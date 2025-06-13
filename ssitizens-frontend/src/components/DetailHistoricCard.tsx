import { useDownloadReport } from "@/services/useExportPdf/useExportPdf";
import { useTranslation } from "react-i18next";
import Spinner from "./Spinner";

export const DetailHistoricCard = ({ sections, reportParams, isLoading }) => {
	const { t } = useTranslation();
	const { mutate: downloadReport, isPending, error } = useDownloadReport();

	const id = reportParams?.user?.id;
	const event = reportParams?.event;
	const ticketAvailable = reportParams?.isTokenTransfer;
	const ticketCid = reportParams?.ticketImage;

	if (isLoading) {
		return <Spinner />;
	}

	return (
		<div className='mx-auto'>
			{sections.map(({ title, items }) => (
				<section key={title} className='mb-8'>
					<h2 className='text-2xl font-bold mb-4'>{title}</h2>
					<div className='space-y-2'>
						{items.map(({ label, value }, i) => (
							<div key={i} className='flex'>
								{label && <span className='w-48 font-medium'>{label}:</span>}
								<span className='flex-1'>{value}</span>
							</div>
						))}
					</div>
				</section>
			))}

			{event?.includes("transfer") && (
				<div className='mt-4'>
					{ticketAvailable ? (
						<button
							onClick={() => window.open(`https://gateway.pinata.cloud/ipfs/${ticketCid}`, "_blank")}
							disabled={isPending}
							className='text-blue-600 underline hover:text-blue-800 disabled:opacity-50'
						>
							{isPending
								? t("transactionHistory.detail.redirectingToticket")
								: t("transactionHistory.detail.ticketRedirect")}
						</button>
					) : (
						<button
							onClick={() => downloadReport({ user: id, since: undefined, until: undefined })}
							disabled={isPending}
							className='text-blue-600 underline hover:text-blue-800 disabled:opacity-50'
						>
							{isPending
								? t("transactionHistory.detail.generatingPdf")
								: t("transactionHistory.detail.downloadReport")}
						</button>
					)}
					{error && (
						<p className='mt-2 text-sm text-red-500'>
							{ticketAvailable
								? t("transactionHistory.detail.errorRedirecting", { message: error.message })
								: t("transactionHistory.detail.errorDownload", { message: error.message })}
						</p>
					)}
				</div>
			)}
		</div>
	);
};
