import { get, post } from "@/config/axios/axiosInstance";
import { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { IPaginatedTransactions } from "./useAdminFunctions.types";

export const postFundsGeneration = async (quantity: number) => {
	const data = { quantity: quantity };
	const response = await post("/generate", {
		data: data,
		headers: { "Content-Type": "application/json" },
	});
	return response.data;
};

export const fetchTransactionList = async ({
	page = 1,
	page_size = 25,
	from_user,
	to,
	ordering,
}: {
	page?: number;
	page_size?: number;
	from_user?: string;
	to?: string;
	ordering?: string;
}): Promise<IPaginatedTransactions> => {
	const response = await get("/transactions", {
		params: { page, page_size, from_user, to, ordering },
	});
	return response.data;
};

export const useGetTransactionList = ({
	page = 1,
	page_size = 25,
	from_user,
	to,
	ordering,
}: {
	page?: number;
	page_size?: number;
	from_user?: string;
	to?: string;
	ordering?: string;
}) => {
	return useQuery<IPaginatedTransactions, AxiosError>({
		queryKey: [QUERY_KEYS.TRANSACTION_LIST, page, page_size, from_user, to, ordering],
		queryFn: () => fetchTransactionList({ page, page_size, from_user, to, ordering }),
		keepPreviousData: true,
	});
};

export const forceRedemption = async (id: string) => {
	const response = await post(`/force_redemption`, {
		data: { profile_id: id },
		headers: { "Content-Type": "application/json" },
	});
	return response.data;
};

export const recoverPassword = async (email: string) => {
	const response = await post("/api/password-reset", {
		data: { email },
		headers: { "Content-Type": "application/json" },
	});
	return response.data;
};
