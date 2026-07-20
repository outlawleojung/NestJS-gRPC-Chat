import { Observable } from 'rxjs';

export interface ChatGrpcClient {
  CreateRoom(req: { participantIds: string[] }): Observable<Room>;
  ListMessages(req: {
    roomId: string;
    cursor?: string;
    limit?: number;
  }): Observable<{ messages: Message[]; nextCursor: string }>;
  SaveMessage(req: {
    roomId: string;
    senderId: string;
    content: string;
  }): Observable<Message>;
}

export interface Room {
  id: string;
  participantIds: string[];
  createdAt: string;
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  createdAt: string;
}
