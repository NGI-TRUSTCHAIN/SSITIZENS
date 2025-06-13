import { get } from "@/config/axios/axiosInstance";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { TBalanceResponse } from "./useBalance.types";
import { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";

export const fetchGetBalance = async (): Promise<TBalanceResponse> => {
  const response = await get("/balance");
  return response.data;
};

export const useGetBalance = () => {
  return useQuery<TBalanceResponse, AxiosError>({
    queryKey: [QUERY_KEYS.ADMIN_BALANCE],
    queryFn: () => fetchGetBalance(),
  });
};
