/**
 * NATS subject 규칙
 *   chat.room.{roomId}.message   — Pod A가 받은 메시지를 다른 Pod들에 전파
 *   chat.room.{roomId}.presence  — 입장/퇴장 이벤트 (선택적 확장)
 */
export const chatRoomMessageSubject = (roomId: string): string =>
  `chat.room.${roomId}.message`;

export const chatRoomMessageSubjectPattern = 'chat.room.*.message';
