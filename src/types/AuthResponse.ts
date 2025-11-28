export interface AuthResponse {
  token: string;
  message: string;
  user?: {
    name?: string;
    email?: string;
    _id?: string;
  };
}
