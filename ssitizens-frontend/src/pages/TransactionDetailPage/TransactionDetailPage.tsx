import { useParams, useNavigate } from "react-router-dom";
import { DetailHistoricCard } from "@/components/DetailHistoricCard";
import { ArrowLeft } from "lucide-react";
import { useGetTransactionListByID } from "@/services";
import { TransactionEvent } from "@/services/useAdminFunctions/useAdminFunctions.types";
import { useTranslation } from "react-i18next";
import Spinner from "@/components/Spinner";

export const TransactionDetailPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { t } = useTranslation("translation", { keyPrefix: "adminTransactionHistory" });
	const { t: tCommon } = useTranslation("translation", { keyPrefix: "common" });

	const { data, isLoading } = useGetTransactionListByID(id);
	const tx: TransactionEvent = data;

	if (isLoading) {
		return (
			<div className='flex min-h-screen bg-gray-100'>
				<main className='flex-1 p-8 flex items-center justify-center'>
					<Spinner />
				</main>
			</div>
		);
	}

	if (!tx) {
		return (
			<div className='flex min-h-screen bg-gray-100'>
				<main className='flex-1 p-8'>
					<div className='max-w-7xl'>
						<p className='text-red-600 text-lg mb-4'>
							{t("noResults")} <strong>{id}</strong>
						</p>
						<button
							onClick={() => navigate(-1)}
							className='flex items-center text-gray-600 hover:text-gray-900'
						>
							<ArrowLeft size={20} className='mr-1' />
							{tCommon("back")}
						</button>
					</div>
				</main>
			</div>
		);
	}

	const reportParams = {
		user: tx.to || tx.from_user,
		event: tx.event,
		isTokenTransfer: Boolean(tx?.to && tx?.from_user),
		ticketImage: tx.data?.ticket_image,
	};

	const sections = [
		{
			title: t("generalInfo"),
			items: [
				{ label: t("date"), value: new Date(tx.timestamp).toLocaleString() },
				{ label: t("event"), value: tx.event },
			],
		},
		{
			title: t("transaction"),
			items: [
				{
					label: t("from"),
					value: tx.from_user?.data?.store_id
						? tx.from_user?.data?.store_id
						: tx.from_user?.data?.full_name || tCommon("unknown", "Desconocido"),
				},
				{
					label: t("to"),
					value: tx.to?.data?.store_id
						? tx.to?.data?.store_id
						: tx.to?.data?.full_name || tCommon("unknown", "Desconocido"),
				},
				{ label: t("amount"), value: tx.amount_tokens },
				{ label: "Hash", value: tx.hash },
				{ label: "Ethers", value: tx.amount_ethers },
			],
		},
		...(tx.event === "transfer"
			? [
					{
						title: t("paymentResume"),
						items: [
							{
								label: "",
							},
						],
					},
			  ]
			: []),
	];

	return (
		<div className='flex min-h-screen bg-gray-100'>
			<main className='flex-1 p-8'>
				<button
					onClick={() => navigate(-1)}
					className='flex items-center text-gray-600 hover:text-gray-900 mb-4'
				>
					<ArrowLeft size={20} className='mr-1' />
					{tCommon("back")}
				</button>
				<DetailHistoricCard sections={sections} reportParams={reportParams} isLoading={isLoading} />
			</main>
		</div>
	);
};
