import { get, post, put, del } from "@/config/axios/axiosInstance";
import {
  useMutation,
  UseMutationResult,
  useQuery,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  EType,
  IAidResponse,
  IFetchDeleteUserByID,
  IFetchGetUsers,
  IFetchGetUsersByID,
  IFetchPutUserByID,
  IFetchUsers,
  IUser,
  IUserGetResponse,
  IUserResponse,
} from "./useCitizensAndCommerce.types";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { TransactionEvent } from "../useAdminFunctions/useAdminFunctions.types"

const fetchPostUser = async ({
  email,
  type,
  aid_type,
  data,
}: IFetchUsers): Promise<IUserGetResponse> => {
  const response = await post("/users", {
    data: { email, type, aid_type, data },
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

export const usePostUsers = (): UseMutationResult<
  IUserGetResponse,
  AxiosError,
  IFetchUsers
> => useMutation({ mutationFn: fetchPostUser });

const fetchGetUsers = async ({
  dni,
  cif,
  store_name,
  type,
  email = "",
  address = "",
  aid_type = "",
  page = 1,
  page_size = 100,
}: IFetchGetUsers): Promise<IUserResponse> => {
  const queryParams: Record<string, string> = {
    store_name: store_name || "",
    type,
    email,
    address,
    aid: String(aid_type),
    page: String(page),
    page_size: String(page_size),
  };

  if (type === EType.beneficiary && dni) {
    queryParams.dni = dni;
  } else if (type === EType.store && cif) {
    queryParams.cif = cif;
  }

  const response = await get("/users", {
    params: queryParams,
  });

  return response.data;
};

export const useGetUsers = (params: IFetchGetUsers) => {
  return useQuery<IUserResponse, AxiosError>({
    queryKey: [QUERY_KEYS.USERS, params],
    queryFn: () => fetchGetUsers(params),
    enabled: !!params.type,
  });
};

const fetchGetUserByID = async ({
  id,
}: IFetchGetUsersByID): Promise<IUserGetResponse> => {
  const response = await get(`/users/${id}`);
  return response.data;
};

export const useGetUserByID = ({ id }: IFetchGetUsersByID) => {
  return useQuery<IUserGetResponse, AxiosError>({
    queryKey: [QUERY_KEYS.USER, id],
    queryFn: () => fetchGetUserByID({ id }),
    enabled: !!id,
  });
};

const fetchPutUserByID = async ({
  id,
  payload,
}: IFetchPutUserByID): Promise<IUserGetResponse> => {
  const response = await put(`/users/${id}`, {
    data: payload,
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

export const usePutUserByID = (): UseMutationResult<
  IUser,
  AxiosError,
  IFetchPutUserByID
> => {
  return useMutation({ mutationFn: fetchPutUserByID });
};

const fetchDeleteUserByID = async ({
  id,
}: IFetchDeleteUserByID): Promise<void> => {
  await del(`/users/${id}`);
};

export const useDeleteUserByID = (): UseMutationResult<
  void,
  AxiosError,
  IFetchDeleteUserByID
> => {
  return useMutation({ mutationFn: fetchDeleteUserByID });
};

const fetchGetAidList = async (): Promise<IAidResponse> => {
  const response = await get("/aids/");
  return response.data;
};

export const useGetAidList = () => {
  return useQuery<IAidResponse, AxiosError>({
    queryKey: [QUERY_KEYS.AIDS],
    queryFn: fetchGetAidList,
  });
};

export const fetchTransactionListByID = async(id: string): Promise<TransactionEvent> => {
  const response = await get(`/transactions/${id}`);
  return response.data;
}

export const useGetTransactionListByID = (id: string) => {
  return useQuery<TransactionEvent, AxiosError>({
    queryKey: [QUERY_KEYS.TRANSACTION_LIST_ID, id],
    queryFn: () => fetchTransactionListByID(id),
    enabled: !!id,
  });
};

export const rechargeTokens = async (id: string, quantity: number, additional_data: string ): Promise<void> => {
  await post(`/distribute`, {
    data: { profile_id: id, quantity: quantity, additional_data: additional_data },
    headers: { "Content-Type": "application/json" },
  });
}