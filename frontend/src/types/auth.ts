export type User = {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role?: 'admin' | 'user';
  jobRole?: 'Developer' | 'Designer' | 'Manager' | 'QA';
};

export type AuthResponse = {
  user?: User;
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  role?: 'admin' | 'user';
  token: string;
};
