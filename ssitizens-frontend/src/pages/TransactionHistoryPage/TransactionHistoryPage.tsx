/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useState } from "react";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { DetailHistoricCard } from "@/components/DetailHistoricCard";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/AuthStore/useAuthStore";
import { useGetTransactionList } from "@/services/useAdminFunctions/useAdminFunctions";
import { useGetUserByID, useGetUsers } from "@/services";
import { EType } from "@/services/useCitizensAndCommerce/useCitizensAndCommerce.types";
import { useNavigate, useSearchParams } from "react-router-dom";
import Spinner from "@/components/Spinner";
import { TransactionEvent } from "@/services/useAdminFunctions/useAdminFunctions.types";

export const TransactionHistoryPage = () => {
	const { t } = useTranslation();
	const { t: tHistory } = useTranslation("translation", { keyPrefix: "transactionHistory" });
	const { t: tPagination } = useTranslation("translation", { keyPrefix: "pagination" });
	const [searchParams] = useSearchParams();
	const citizenId = searchParams.get("citizenId") || "";
	const commerceId = searchParams.get("commerceId") || "";
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(25);
	const [selectedTx, setSelectedTx] = useState<TransactionEvent>(null);
	const { userType } = useAuthStore();
	const navigate = useNavigate();

	const paramId = citizenId || commerceId;
	const isAdmin = userType === "admin";
	const isCitizenOrCommerce = userType === "citizen" || userType === "commerce";

	const usersResult = useGetUsers({
		type: userType === "citizen" ? EType.beneficiary : EType.store,
		email: "",
		address: "",
	});

	const userByIdResult = useGetUserByID({ id: paramId });

	let userData;
	if (isAdmin) {
		userData = userByIdResult.data;
	} else if (isCitizenOrCommerce) {
		userData = usersResult.data?.results?.[0];
	}

	const fullname = userData?.data?.full_name;
	const id = userData?.id;
	const balanceTokens = userData?.balance_tokens;

	const { data, isLoading } = useGetTransactionList({
		page,
		page_size: pageSize,
		ordering: "-timestamp",
	});

	//@ts-ignore
	const allTransactions = data?.results ?? [];

	const filteredTransactions: TransactionEvent[] = allTransactions.filter(
		(tx) => tx.to?.id === id || tx.from_user?.id === id
	);
	//@ts-ignore
	const count = data?.count ?? 0;

	const totalPages = Math.ceil(count / pageSize);

	const reportParams = {
		user: selectedTx?.to || selectedTx?.from_user,
		event: selectedTx?.event,
		isTokenTransfer: Boolean(selectedTx?.to && selectedTx?.from_user),
		ticketImage: selectedTx?.data?.ticket_image,
	};

	const detailSections = selectedTx
		? [
				{
					title: tHistory("detail.general"),
					items: [
						{ label: tHistory("columns.date"), value: new Date(selectedTx.timestamp).toLocaleString() },
						{ label: tHistory("columns.event"), value: selectedTx.event },
						{
							label: tHistory("columns.from"),
							value:
								userType === "commerce"
									? selectedTx.from_user?.data?.store_id || "-"
									: (selectedTx.from_user?.data?.store_id || selectedTx.from_user?.data?.full_name) ?? "-",
						},
						{
							label: tHistory("columns.to"),
							value:
								userType === "commerce"
									? selectedTx.to?.data?.store_id || "-"
									: (selectedTx.to?.data?.store_id || selectedTx.to?.data?.full_name) ?? "-",
						},
						{ label: tHistory("columns.amount"), value: selectedTx.amount_tokens },
					],
				},
		  ]
		: [];

	const handleGoBack = () => {
		if (userType === "admin") {
			navigate("/admin-dashboard");
		} else if (userType === "citizen") {
			navigate("/citizen-dashboard");
		} else if (userType === "commerce") {
			navigate("/commerce-dashboard");
		}
	};

	// Espera a que el hook correcto termine de cargar
	const isUserLoading = isAdmin ? userByIdResult.isLoading : usersResult.isLoading;
	if (isUserLoading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<Spinner />
			</div>
		);
	}

	return (
		<div className='flex min-h-screen bg-gray-50'>
			<main className='flex-1 p-8'>
				<div className='max-w-7xl mx-auto'>
					{selectedTx ? (
						<div>
							<button
								onClick={() => setSelectedTx(null)}
								className='flex items-center text-blue-600 hover:underline mb-6'
							>
								<ArrowLeft size={20} className='mr-1' />
								{tHistory("backToList")}
							</button>
							<DetailHistoricCard
								sections={detailSections}
								reportParams={reportParams}
								isLoading={isLoading}
							/>
						</div>
					) : (
						<>
							<div className={id ? "mb-6" : "mb-8"}>
								<h1 className='text-2xl font-bold mb-2'>
									{id ? tHistory("detailTitle", { name: fullname }) : tHistory("title")}
								</h1>
								{id && (
									<div className='flex items-center justify-between'>
										<h2 className='text-5xl font-bold'>
											{tHistory("balance", { balance: String(balanceTokens) })}
										</h2>
										<button
											onClick={handleGoBack}
											className='px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors'
										>
											{t("common.back")}
										</button>
									</div>
								)}
							</div>

							<div className='bg-white rounded-lg shadow-sm overflow-hidden mb-4'>
								<table className='w-full'>
									<thead className='bg-gray-200'>
										<tr>
											<th className='px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider'>
												{tHistory("columns.date")}
											</th>
											<th className='px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider'>
												{tHistory("columns.event")}
											</th>
											<th className='px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider'>
												{tHistory("columns.from")}
											</th>
											<th className='px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider'>
												{tHistory("columns.to")}
											</th>
											<th className='px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider'>
												{tHistory("columns.amount")}
											</th>
										</tr>
									</thead>
									<tbody className='divide-y divide-gray-200'>
										{isLoading ? (
											<tr>
												<td colSpan={5} className='text-center py-8'>
													{tHistory("loading")}
												</td>
											</tr>
										) : filteredTransactions?.length === 0 ? (
											<tr>
												<td colSpan={5} className='text-center py-8'>
													{tHistory("noResults")}
												</td>
											</tr>
										) : (
											filteredTransactions?.map((tx) => (
												<tr
													key={tx.id}
													className='cursor-pointer hover:bg-gray-50'
													onClick={() => setSelectedTx(tx)}
												>
													<td className='px-6 py-4 text-sm text-gray-500'>
														{new Date(tx.timestamp).toLocaleString()}
													</td>
													<td className='px-6 py-4 text-sm text-gray-500'>{tx.event}</td>
													<td className='px-6 py-4 text-sm text-gray-500'>
														{userType === "commerce"
															? tx.from_user?.data?.store_id || "-"
															: userType === "citizen"
															? tx.from_user?.data?.store_id || tx.from_user?.data?.full_name || "-"
															: tx.from_user?.data?.store_id || tx.from_user?.data?.full_name || "-"}
													</td>
													<td className='px-6 py-4 text-sm text-gray-500'>
														{userType === "commerce"
															? tx.to?.data?.store_id || "-"
															: userType === "citizen"
															? tx.to?.data?.store_id || tx.to?.data?.full_name || "-"
															: tx.to?.data?.store_id || tx.to?.data?.full_name || "-"}
													</td>
													<td className='px-6 py-4 text-sm text-gray-500'>{tx.amount_tokens}</td>
												</tr>
											))
										)}
									</tbody>
								</table>
							</div>

							<div className='flex items-center justify-between'>
								<div className='flex items-center space-x-2'>
									<span className='text-sm text-gray-700'>{tPagination("rows")}:</span>
									<select
										className='border rounded px-2 py-1 text-sm'
										value={pageSize}
										onChange={(e) => {
											setPageSize(Number(e.target.value));
											setPage(1);
										}}
									>
										{[25, 50, 100].map((n) => (
											<option key={n} value={n}>
												{n}
											</option>
										))}
									</select>
								</div>
								<div className='flex items-center space-x-2'>
									<span className='text-sm text-gray-700'>{tPagination("page")}:</span>
									<button
										className='p-1 rounded border hover:bg-gray-100'
										onClick={() => setPage((p) => Math.max(1, p - 1))}
										disabled={page === 1}
									>
										<ChevronLeft size={16} />
									</button>
									<span className='text-sm'>
										{page} / {totalPages}
									</span>
									<button
										className='p-1 rounded border hover:bg-gray-100'
										onClick={() => setPage((p) => p + 1)}
										disabled={page * pageSize >= count}
									>
										<ChevronRight size={16} />
									</button>
								</div>
							</div>
						</>
					)}
				</div>
			</main>
		</div>
	);
};
