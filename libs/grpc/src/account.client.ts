import { Observable } from 'rxjs';

export interface AccountGrpcClient {
  GetAccount(req: { id: string }): Observable<Account>;
  CreateAccount(req: { email: string; nickname: string }): Observable<Account>;
}

export interface Account {
  id: string;
  email: string;
  nickname: string;
  createdAt: string; // int64 → string in grpc-js
}
