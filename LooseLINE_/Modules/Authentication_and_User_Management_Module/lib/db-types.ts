// lib/db-types.ts
export interface UserTable {
  id: number;
  email: string;
  password: string;
  role: string;
  created_at: Date;
  updated_at: Date;
}

export interface Database {
  user: UserTable;
}