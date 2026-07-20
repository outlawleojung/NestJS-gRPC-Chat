import { Observable } from 'rxjs';

export interface FriendGrpcClient {
  AddFriend(req: { userId: string; targetUserId: string }): Observable<Friendship>;
  ListFriends(req: { userId: string }): Observable<{ friends: Friendship[] }>;
  AreFriends(req: {
    userId: string;
    targetUserIds: string[];
  }): Observable<{ result: boolean[] }>;
}

export interface Friendship {
  id: string;
  userId: string;
  targetUserId: string;
  createdAt: string;
}
