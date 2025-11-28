export interface BackendUser {
  _id: string;     // backend returns _id
  username: string;
  email: string;
  avatar?: string;

  createdAt?: string;
  updatedAt?: string;
}
