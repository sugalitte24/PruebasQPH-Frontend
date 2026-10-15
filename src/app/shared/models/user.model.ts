export type Role = 'ADMIN' | 'USER';

export interface User {
  id: number;
  username: string;
  nombre: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  nombre: string;
  email: string;
  role: Role;
}
