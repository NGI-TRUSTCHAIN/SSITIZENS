/* eslint-disable @typescript-eslint/no-explicit-any */
import { TransactionEventType } from "../useAdminFunctions/useAdminFunctions.types"

export type IFetchUsers = {
  email: string;
  type: EType;
  data: TUsersData;
  aid_type?: string|number;
};

export type TUsersData = {
  dni?: string;
  phone_number?: string;
  cif?: string;
  store_id?: string;
  iban?: string;
  aid_funds?: number;
  full_name?: string;
  store_name?: string;
  [key: string]: any;
};

export enum EType {
  beneficiary = "beneficiary",
  store = "store",
}

export interface IUserGetResponse {
  id: string;
  email: string;
  address: string;
  type: EType;
  data: TUsersData;
  aid_type: string|number;
  terms_accepted: boolean;
  active_since: string;
  active_until: string;
  balance_tokens: number;
  balance_ethers: number;
}

export type IFetchGetUsers = {
  type: EType;
  email?: string;
  address?: string;
  page?: number;
  page_size?: number;
  dni?: string;
  cif?: string;
  store_name?: string;
  aid_type?: string|number;
};

export interface IUserResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: IUser[];
}

export interface IUser {
  id: string;
  email: string;
  address: string;
  type: EType;
  data: TUsersData;
  aid_type: string|number;
  terms_accepted: boolean;
  active_since: string;
  active_until: string;
  balance_tokens: number;
  balance_ethers: number;
}

export type IFetchGetUsersByID = {
  id: string;
};

export interface IFetchPutUserByID {
  id: string;
  payload: IUserGetResponse;
}

export interface IFetchDeleteUserByID {
  id: string;
}

export interface IAid {
  id: string;
  name: string;
}

export type IAidResponse = IAid[];
