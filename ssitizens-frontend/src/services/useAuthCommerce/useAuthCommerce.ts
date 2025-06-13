import { get } from "@/config/axios/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  IFetchPresentationQR,
  TResponsePresentationQR,
} from "./useAuthCommerce.types";
import { QUERY_KEYS } from "@/constants/queryKeys";

const fetchPresentationQR = async ({
  sessionID,
}: IFetchPresentationQR): Promise<TResponsePresentationQR> => {
  const response = await get("/presentation-store-identity/qr", {
    params: {
      session_id: sessionID,
    },
    responseType: "blob",
  });

  const qr = URL.createObjectURL(response.data);
  return { qr };
};

export const useAuthCommerceQR = ({ sessionID }: IFetchPresentationQR) => {
  return useQuery<TResponsePresentationQR, AxiosError>({
    queryKey: [QUERY_KEYS.AUTH_COMMERCE_QR, sessionID],
    queryFn: () => fetchPresentationQR({ sessionID }),
    enabled: Boolean(sessionID && sessionID.length > 0),
  });
};
