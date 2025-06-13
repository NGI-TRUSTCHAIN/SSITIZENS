export type IFetchLoginAdmin = {
  username: string;
  password: string;
};

export interface IAuthResponse {
  refresh: string;
  access: string;
  user_id: number;
  username: string;
  email: string;
}
