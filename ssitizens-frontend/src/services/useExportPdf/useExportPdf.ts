import { get } from "@/config/axios/axiosInstance";
import { IFetchTransactionsReport } from "./useExportPdf.types";
import { useMutation } from "@tanstack/react-query";

export const fetchTransactionsReport = async ({
  user,
  since,
  until,
}: IFetchTransactionsReport): Promise<void> => {
  const response = await get("/generate_pdf", {
    params: { user, since, until },
    responseType: "blob",
  });

  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `reporte_${user}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const useDownloadReport = () => {
  return useMutation<void, Error, IFetchTransactionsReport>({
    mutationFn: fetchTransactionsReport,
  });
};
