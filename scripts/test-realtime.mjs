/**
 * E2E 검증:
 *   Alice → Realtime-Hub Pod-1 (port 3100)
 *   Bob   → Realtime-Hub Pod-2 (port 3101)
 *   Bob이 메시지 전송 → NATS pub → Pod-1 subscribe → Alice 소켓 emit
 * 이걸로 Socket.IO + NATS pub/sub + 다중 Pod 분산이 정상 동작하는지 확인.
 */

import { io } from 'socket.io-client';

const GATEWAY = 'http://localhost:3000';
const POD1 = 'http://localhost:3100';
const POD2 = 'http://localhost:3101';

const uniq = Date.now();

async function http(method, path, body) {
  const res = await fetch(`${GATEWAY}${path}`, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} ${JSON.stringify(json)}`);
  return json;
}

function connectAndJoin(url, userId, roomId, label) {
  return new Promise((resolve, reject) => {
    const socket = io(url, { transports: ['websocket'], reconnection: false });
    const timeout = setTimeout(() => {
      socket.close();
      reject(new Error(`${label} join timeout`));
    }, 5000);
    socket.on('connect', () => {
      socket.emit('join', { userId, roomId }, (ack) => {
        clearTimeout(timeout);
        if (ack && ack.ok) {
          console.log(`✓ ${label} connected (${socket.id}) and joined room`);
          resolve(socket);
        } else {
          reject(new Error(`${label} join ack failed: ${JSON.stringify(ack)}`));
        }
      });
    });
    socket.on('connect_error', (e) => {
      clearTimeout(timeout);
      reject(new Error(`${label} connect_error: ${e.message}`));
    });
  });
}

async function main() {
  console.log('=== SETUP ===');
  const alice = await http('POST', '/accounts', {
    email: `alice-${uniq}@ex.com`,
    nickname: 'Alice',
  });
  console.log(`Alice created: ${alice.id}`);

  const bob = await http('POST', '/accounts', {
    email: `bob-${uniq}@ex.com`,
    nickname: 'Bob',
  });
  console.log(`Bob   created: ${bob.id}`);

  await http('POST', `/users/${alice.id}/friends`, { targetUserId: bob.id });
  await http('POST', `/users/${bob.id}/friends`, { targetUserId: alice.id });
  console.log('Friendship registered (both directions)');

  const room = await http('POST', '/rooms', {
    userId: alice.id,
    targetUserIds: [bob.id],
  });
  console.log(`Room created: ${room.id}`);

  console.log('\n=== CONNECT: Alice → Pod-1(3100), Bob → Pod-2(3101) ===');
  const aliceSocket = await connectAndJoin(POD1, alice.id, room.id, 'Alice(Pod-1)');
  const bobSocket = await connectAndJoin(POD2, bob.id, room.id, 'Bob(Pod-2)');

  console.log('\n=== ACT: Bob sends message on Pod-2. Alice should receive on Pod-1 via NATS ===');
  const messageContent = `hello from Bob @ ${new Date().toISOString()}`;

  const received = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Alice did NOT receive message within 5s — NATS pub/sub 실패'));
    }, 5000);
    aliceSocket.on('message', (payload) => {
      clearTimeout(timeout);
      resolve(payload);
    });
  });

  bobSocket.emit('send', {
    userId: bob.id,
    roomId: room.id,
    content: messageContent,
  });

  const payload = await received;

  console.log('\n=== ASSERT ===');
  console.log('Alice received:', JSON.stringify(payload, null, 2));

  const ok =
    payload.roomId === room.id &&
    payload.senderId === bob.id &&
    payload.content === messageContent;

  aliceSocket.close();
  bobSocket.close();

  if (ok) {
    console.log('\n🎉 PASS — Bob@Pod-2 → NATS → Alice@Pod-1 정상 전파');
    process.exit(0);
  } else {
    console.log('\n❌ FAIL — payload mismatch');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('\n❌ FAIL:', err.message);
  process.exit(1);
});
