# NestJS-gRPC-Chat

[![CI](https://github.com/outlawleojung/NestJS-gRPC-Chat/actions/workflows/ci.yml/badge.svg)](https://github.com/outlawleojung/NestJS-gRPC-Chat/actions/workflows/ci.yml)

> **NestJS 기반 실시간 채팅 MSA 보일러플레이트** — Gateway + gRPC + Socket.IO + NATS + Redis

실제 운영한 실시간 번역 채팅 서비스의 아키텍처 패턴을 참고해, 핵심 MSA 구성 요소만 정제해서 새로 작성한 보일러플레이트입니다.
NestJS monorepo 위에서 **Gateway 패턴**, **gRPC 내부 통신**, **NATS 기반 다중 Pod 이벤트 전파**, **Redis 공유 상태**가 어떻게 유기적으로 맞물리는지 한눈에 볼 수 있도록 만들었습니다.

## Why this repo

기존 공개 리포([NestCore](https://github.com/outlawleojung/NestCore))는 단일 NestJS 서버 구조라 MSA·gRPC·NATS 같은 분산 시스템 요소가 드러나지 않습니다.
이 리포는 그 격차를 채우기 위해, **실시간 채팅 도메인**을 통해 다음을 보여줍니다.

- **MSA 서비스 분리** — 계정 · 친구 · 채팅 · 실시간 허브를 독립 프로세스로
- **Gateway + gRPC** — 클라이언트는 Gateway HTTP만, 내부는 gRPC로 통신
- **다중 Pod 소켓 서버** — Realtime-Hub가 수평 확장돼도 같은 룸의 사용자끼리 실시간 통신
- **NATS + Redis 공용 인프라** — Pod 간 이벤트(NATS)와 공유 상태(Redis) 분리

## Architecture

```
                       ┌───────────────────────┐
                       │      Client (App)     │
                       └─────┬────────────┬────┘
             HTTP(REST)      │            │  Socket.IO (직접 연결)
                             ▼            ▼
                    ┌──────────────┐  ┌──────────────────────────────┐
                    │   Gateway    │  │   Realtime-Hub (Pod A/B/C)   │
                    │  (NestJS)    │  │  Socket.IO + NATS + Redis    │
                    └──────┬───────┘  └──────────┬───────────────────┘
                           │ gRPC                │ gRPC (SaveMessage)
        ┌──────────────────┼──────────────────┐  │
        ▼                  ▼                  ▼  ▼
   ┌────────┐         ┌────────┐         ┌──────────┐
   │Account │         │ Friend │         │   Chat   │
   │ (gRPC) │         │ (gRPC) │         │  (gRPC)  │
   └───┬────┘         └───┬────┘         └────┬─────┘
       │                  │                    │ NATS publish
       └─────── PostgreSQL (TypeORM) ──────────┘   chat.room.{roomId}.message
                                                          │
                                                          ▼
                                              ┌──────────────────────┐
                                              │   NATS  ─  Redis     │
                                              │ (Pod 간 pub/sub /    │
                                              │  룸·세션 공유 상태)  │
                                              └──────────────────────┘
```

## Tech Stack

| Category | Library |
|---|---|
| Framework | NestJS v11 (monorepo) |
| Language | TypeScript |
| Inter-service RPC | gRPC (`@grpc/grpc-js` + `@nestjs/microservices`) |
| Realtime | Socket.IO (`@nestjs/websockets`) |
| Pub/Sub | NATS (`nats`) |
| Shared State | Redis (`ioredis`) |
| Database | PostgreSQL + TypeORM |
| Package Manager | pnpm |

## Project Structure

```
NestJS-gRPC-Chat/
├── apps/
│   ├── gateway/          # HTTP 엔드포인트, 내부 서비스에 gRPC 클라이언트로 호출
│   ├── account/          # 계정 도메인 gRPC 서버 (Users)
│   ├── friend/           # 친구 관계 gRPC 서버 (Friendships) — 룸 생성 시 관계 검증
│   ├── chat/             # 채팅 비즈니스 로직 gRPC 서버 (Rooms/Messages)
│   │                     # 메시지 저장 후 NATS로 이벤트 publish
│   └── realtime-hub/     # Socket.IO 서버 (다중 Pod)
│                         # NATS subscribe → 자신에게 연결된 소켓으로 emit
├── libs/
│   ├── common/           # 공통 상수 (gRPC package·service·client token)
│   ├── entity/           # TypeORM Entities + DatabaseModule
│   ├── repository/       # BaseRepository 상속 + 도메인별 Repository
│   ├── grpc/             # gRPC 클라이언트 팩토리 (Gateway·Realtime-Hub가 재사용)
│   ├── nats/             # NATS 클라이언트 래퍼 (publish/subscribe)
│   └── redis/            # Redis 클라이언트 래퍼 (룸 멤버 셋 등)
├── proto/
│   ├── account.proto
│   ├── chat.proto
│   └── friend.proto
├── docker-compose.yaml   # NATS + Redis + PostgreSQL (로컬 개발용)
├── nest-cli.json         # monorepo 설정 (apps + libs)
├── tsconfig.json         # @app/* path alias
└── .env.example
```

## Key Design Decisions

### 1. 채팅 서비스 vs 실시간 허브 분리

원본 설계에서 배운 가장 중요한 결정입니다. **채팅 비즈니스 로직(chat)** 과 **실시간 소켓 서버(realtime-hub)** 를 물리적으로 분리했습니다.

- **Chat** — 순수 도메인 서비스(gRPC). 룸 CRUD, 메시지 채번(`seqId`)·영속화·NATS publish까지 담당. 상태를 갖지 않아 아무 곳에서든 호출 가능.
- **Realtime-Hub** — 소켓 세션 유지만 담당. NATS 구독으로 이벤트를 받아 자신에게 연결된 소켓에만 emit.

이렇게 나누면 **소켓 서버는 stateless하게 무제한 수평 확장**할 수 있고, **채팅 로직은 배치 잡·다른 서비스에서도 재사용**할 수 있습니다.

### 2. Gateway 패턴 + gRPC 내부 통신

클라이언트는 `Gateway`의 HTTP 엔드포인트만 알면 됩니다. 내부 서비스가 몇 개인지, 어떻게 나뉘어 있는지 몰라도 됩니다.

내부 통신은 `.proto` 스펙 기반 gRPC로 처리해서 **타입 안전성**과 **성능**을 동시에 확보. Gateway에서 하나의 API가 여러 서비스에 걸치는 경우(예: 룸 생성 시 friend 검증)에도 순차 gRPC 호출로 자연스럽게 조율됩니다.

### 3. 채팅 경로 분리 (일반 API vs 실시간 연결)

- **일반 API** → 클라이언트 → Gateway(HTTP) → 내부 서비스(gRPC)
- **실시간 채팅** → 클라이언트 → Ingress → **Realtime-Hub Pod**(Socket.IO)로 **직접 연결**

Gateway를 소켓 트래픽까지 담당하게 하면 병목이 되므로 완전히 분리했습니다. Kubernetes에서는 Ingress에서 path 기반 라우팅으로 처리할 수 있습니다.

### 4. NATS Pub/Sub — Pod 간 이벤트 전파

Chat 서비스가 `chat.room.{roomId}.message` subject로 publish하면, 모든 Realtime-Hub Pod가 이를 subscribe하고 있어서 **어느 Pod에 연결된 사용자든 실시간 수신**이 가능합니다.

subject를 `roomId` 단위로 나눠서 확장 시 파티셔닝 여지를 남겼습니다.

### 5. Redis — 공유 상태(룸 멤버, 세션)

Realtime-Hub가 여러 Pod로 확장돼도 **룸 참여자 목록·접속 상태**는 Redis에 저장되어 어느 Pod에서든 동일하게 조회할 수 있습니다.

### 6. Custom Repository (BaseRepository 상속)

TypeORM Repository 위에 얇은 `BaseRepository`를 두고 각 도메인이 상속합니다. `ChatRoomRepository.incrementSeq()`처럼 도메인 특유의 원자적 연산을 Repository 안에 격리시켜 테스트·재사용을 쉽게 합니다.

## Quick Start

### 1. 인프라 실행

```bash
docker compose up -d      # NATS(4222) + Redis(6379) + Postgres(5432)
```

### 2. 의존성 설치 & 환경변수

```bash
pnpm install
cp .env.example .env
```

### 3. 모든 서비스 동시 실행

```bash
pnpm start:all
```

또는 개별 실행:

```bash
pnpm start:gateway        # HTTP  :3000
pnpm start:account        # gRPC  :5001
pnpm start:chat           # gRPC  :5002
pnpm start:friend         # gRPC  :5003
pnpm start:realtime-hub   # WS    :3100
```

### 4. 시나리오 테스트

```bash
# 1) 사용자 2명 생성
curl -X POST http://localhost:3000/accounts \
  -H 'content-type: application/json' \
  -d '{"email":"alice@ex.com","nickname":"alice"}'

curl -X POST http://localhost:3000/accounts \
  -H 'content-type: application/json' \
  -d '{"email":"bob@ex.com","nickname":"bob"}'

# 2) 친구 등록 (양방향)
curl -X POST http://localhost:3000/users/{ALICE_ID}/friends \
  -H 'content-type: application/json' \
  -d '{"targetUserId":"{BOB_ID}"}'

# 3) 룸 생성 (Gateway가 friend 서비스에 gRPC로 관계 검증)
curl -X POST http://localhost:3000/rooms \
  -H 'content-type: application/json' \
  -d '{"userId":"{ALICE_ID}","targetUserIds":["{BOB_ID}"]}'

# 4) 소켓 연결 → join → send (Socket.IO 클라이언트)
```

## Tests

```bash
pnpm test          # 모든 단위 테스트 실행
pnpm test:watch    # 파일 변경 감지
pnpm test:cov      # 커버리지 리포트
```

- `chat.service.spec.ts` — 룸 생성, `saveAndPublish`(seqId 채번 + NATS publish), listMessages limit 클램프
- `friend.service.spec.ts` — 관계 등록/조회, `check`가 targetUserIds 순서 유지
- `account.service.spec.ts` — get이 `NotFoundException` 던지는 케이스, create 위임
- `nats.subjects.spec.ts` — subject 문자열 규칙

E2E 실시간 시나리오 (다중 Pod → NATS 전파) 는 `scripts/test-realtime.mjs` 참고 —
로컬에서 인프라와 5개 서비스를 띄운 뒤 `node scripts/test-realtime.mjs` 로 실행합니다.

## Portfolio Context

원본 프로덕션 서비스에서 사용한 아키텍처 패턴을 참고했지만 **비즈니스 로직·시크릿·프로덕션 매니페스트는 모두 제외**하고 처음부터 새로 작성했습니다. 이 리포는 다음을 검증하기 위한 것입니다.

- MSA를 서비스 경계 기준으로 나눌 수 있는지
- gRPC로 내부 통신을 설계할 수 있는지
- 다중 Pod 소켓 서버를 NATS + Redis 조합으로 확장할 수 있는지
- NestJS monorepo 안에서 apps/libs를 실전적으로 구성할 수 있는지

## Related

- **[NestCore](https://github.com/outlawleojung/NestCore)** — 단일 NestJS 백엔드 보일러플레이트 (LMS 백오피스)
- **[ReactCore](https://github.com/outlawleojung/ReactCore)** — React 어드민 대시보드 보일러플레이트

## License

이 저장소는 학습·포트폴리오 목적으로 공개됩니다.
