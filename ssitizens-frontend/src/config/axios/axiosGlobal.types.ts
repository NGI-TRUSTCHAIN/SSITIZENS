import { AxiosResponse, InternalAxiosRequestConfig } from "axios";

export type ResponseType<T> = Promise<AxiosResponse<T>>;

export interface ICustomAxiosConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

declare module 'axios' {
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
}
