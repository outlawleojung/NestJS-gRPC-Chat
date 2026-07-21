import { chatRoomMessageSubject, chatRoomMessageSubjectPattern } from './nats.subjects';

describe('nats.subjects', () => {
  it('composes subject using the given roomId', () => {
    expect(chatRoomMessageSubject('room-123')).toBe('chat.room.room-123.message');
  });

  it('exports a wildcard pattern that matches subject for any roomId', () => {
    expect(chatRoomMessageSubjectPattern).toBe('chat.room.*.message');
  });
});
