/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { ICustomAxiosConfig } from "./axiosGlobal.types";
import { useAuthStore } from "@/store";

const baseURL = import.meta.env.VITE_API_URL;

const createAxiosInstance = (
  baseURL: string,
  customHeaders?: AxiosRequestConfig["headers"]
): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    headers: {
      ...customHeaders,
    },
  });

  instance.interceptors.request.use(
    (config: ICustomAxiosConfig) => {
      const token = useAuthStore.getState().tokens?.access;
      const sessionId = sessionStorage.getItem("session_id");
      if (token) {
        config.headers = new AxiosHeaders(config.headers);
        config.headers.set("Authorization", `Bearer ${token}`);
      }
      else if (sessionId){
        config.headers = new AxiosHeaders(config.headers);
        config.headers.set("Authorization", `${sessionId}`);

      }
      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as ICustomAxiosConfig;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          return Promise.reject(error);
        } catch (e) {
          return Promise.reject(e);
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

const axiosInstance = createAxiosInstance(baseURL);

const httpRequest = async <D = any>(
  method: "get" | "post" | "put" | "delete",
  url: string,
  config: AxiosRequestConfig<D> = {}
): Promise<AxiosResponse> => {
  const finalConfig: AxiosRequestConfig<D> = {
    ...config,
    method,
    url,
  };
  return axiosInstance.request(finalConfig);
};

const get = async (url: string, config: AxiosRequestConfig = {}) =>
  httpRequest("get", url, config);

const post = async <D = any>(url: string, config: AxiosRequestConfig<D> = {}) =>
  httpRequest("post", url, config);

const put = async <D = any>(url: string, config: AxiosRequestConfig<D> = {}) =>
  httpRequest("put", url, config);

const del = async <D = any>(url: string, config: AxiosRequestConfig<D> = {}) =>
  httpRequest("delete", url, config);

export { del, get, post, put };
