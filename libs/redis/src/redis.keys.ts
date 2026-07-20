/**
 * Redis 키 규칙 — 룸 참여자, 사용자 접속 세션 등 공유 상태를 어느 Pod에서든 조회 가능
 */
export const roomMembersKey = (roomId: string): string => `chat:room:${roomId}:members`;
export const userSessionKey = (userId: string): string => `chat:user:${userId}:sessions`;
