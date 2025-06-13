/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useGetTransactionList } from "@/services";
import { TransactionEvent } from "@/services/useAdminFunctions/useAdminFunctions.types";

export const AdminTransactionHistoryPage = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(25);

	const { t: tCommon } = useTranslation("translation", { keyPrefix: "common" });
	const { t } = useTranslation("translation", { keyPrefix: "adminTransactionHistory" });
	const { t: tPagination } = useTranslation("translation", { keyPrefix: "pagination" });
	const navigate = useNavigate();

	const { data, isLoading } = useGetTransactionList({
		page,
		page_size: pageSize,
		ordering: "-timestamp",
	});

	//@ts-ignore
	const transactions = data?.results ?? [];

	//@ts-ignore
	const count = data?.count ?? 0;

	const totalPages = Math.ceil(count / pageSize);

	const filtered: TransactionEvent[] = transactions.filter(
		(tx) =>
			tx.event?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			tx.hash?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const handleGoBack = () => {
		navigate("/admin-dashboard");
	};

	return (
		<div className='flex min-h-screen bg-gray-100'>
			<main className='flex-1 p-8'>
				<div className='max-w-7xl mx-auto'>
					<div className='mb-8'>
						<h1 className='text-3xl font-bold mb-4'>{t("title")}</h1>

						<div className='relative justify-between flex items-center mb-4'>
							<div className='absolute inset-y-0 left-3 flex items-center pointer-events-none'>
								<Search size={20} className='text-gray-400' />
							</div>
							<input
								type='text'
								placeholder={t("searchPlaceholder")}
								className='w-full md:w-96 pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
							<button
								onClick={handleGoBack}
								className='px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors'
							>
								{tCommon("back")}
							</button>
						</div>
					</div>

					<div className='bg-white rounded-lg shadow-sm overflow-hidden mb-4'>
						<table className='w-full table-auto'>
							<thead className='bg-gray-200'>
								<tr>
									<th className='px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider'>
										{t("date")}
									</th>
									<th className='px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider'>
										{t("event")}
									</th>
									<th className='px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider'>
										{t("from")}
									</th>
									<th className='px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider'>
										{t("to")}
									</th>
									<th className='px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider'>
										{t("amount")}
									</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-gray-200'>
								{isLoading ? (
									<tr>
										<td colSpan={6} className='text-center py-8'>
											{t("loading")}
										</td>
									</tr>
								) : filtered.length === 0 ? (
									<tr>
										<td colSpan={6} className='text-center py-8'>
											{t("noResults")}
										</td>
									</tr>
								) : (
									filtered.map((tx) => (
										<tr
											key={tx?.id}
											className='hover:bg-gray-50 cursor-pointer'
											onClick={() => navigate(`/transactions/${tx?.id}`)}
										>
											<td className='px-6 py-4 text-sm text-gray-500'>
												{new Date(tx.timestamp).toLocaleString()}
											</td>
											<td className='px-6 py-4 text-sm text-gray-500'>{tx?.event}</td>
											<td className='px-6 py-4 text-sm text-gray-500'>
												{tx.from_user?.data.store_id
													? tx.from_user?.data.store_id
													: tx?.from_user?.data?.full_name ?? "-"}
											</td>
											<td className='px-6 py-4 text-sm text-gray-500'>
												{tx.to?.data.store_id ? tx.to?.data.store_id : tx?.to?.data?.full_name ?? "-"}
											</td>
											<td className='px-6 py-4 text-sm text-gray-500'>{tx?.amount_tokens ?? "-"}</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>

					<div className='flex items-center justify-between'>
						<div className='flex items-center space-x-2'>
							<span className='text-sm text-gray-700'>{tPagination("rows")}</span>
							<select
								className='border border-gray-300 rounded px-2 py-1 text-sm'
								value={pageSize}
								onChange={(e) => setPageSize(Number(e.target.value))}
							>
								<option value={25}>25</option>
								<option value={50}>50</option>
								<option value={100}>100</option>
							</select>
						</div>

						<div className='flex items-center space-x-2'>
							<span className='text-sm text-gray-700'>{tPagination("page")}</span>
							<button
								className='p-1 rounded border border-gray-300 hover:bg-gray-100'
								onClick={() => setPage((p) => Math.max(1, p - 1))}
								disabled={page === 1}
							>
								<ChevronLeft size={16} />
							</button>
							<span className='text-sm'>
								{page} / {totalPages}
							</span>
							<button
								className='p-1 rounded border border-gray-300 hover:bg-gray-100'
								onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
								disabled={page === totalPages}
							>
								<ChevronRight size={16} />
							</button>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
};
