import { get } from "@/config/axios/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  TFetchPresentationQR,
  TResponsePresentationQR,
} from "./useAuthCitizen.type";
import { QUERY_KEYS } from "@/constants/queryKeys";

const fetchPresentationQR = async ({
  sessionID,
}: TFetchPresentationQR): Promise<TResponsePresentationQR> => {
  const response = await get("/presentation-beneficiary-identity/qr", {
    params: {
      session_id: sessionID,
    },
    responseType: "blob",
  });

  const qr = URL.createObjectURL(response.data);

  return { qr };
};

export const useAuthCitizenQR = ({ sessionID }: TFetchPresentationQR) => {
  return useQuery<TResponsePresentationQR, AxiosError>({
    queryKey: [QUERY_KEYS.AUTH_CITIZEN_QR, sessionID],
    queryFn: () => fetchPresentationQR({ sessionID }),
    enabled: Boolean(sessionID && sessionID.length > 0),
  });
};
