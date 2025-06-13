import { post } from "@/config/axios/axiosInstance";
import { IAuthResponse, IFetchLoginAdmin } from "./useAuthAdmin.types";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { AxiosError } from "axios";

const fetchLoginAdmin = async ({
  username,
  password,
}: IFetchLoginAdmin): Promise<IAuthResponse> => {
  const response = await post("/api/api-token-auth", {
    data: { username, password },
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const useAuthAdmin = (): UseMutationResult<
  IAuthResponse,
  AxiosError,
  IFetchLoginAdmin
> =>
  useMutation({
    mutationFn: fetchLoginAdmin,
  });
