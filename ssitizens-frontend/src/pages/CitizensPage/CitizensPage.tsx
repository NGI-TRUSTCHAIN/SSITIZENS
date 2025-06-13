import React, { useMemo, useState } from "react";
import { Search, MoreVertical } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CitizenModal from "../../components/CitizenModal";
import RechargeBalanceModal from "../../components/RechargeBalanceModal";
import RechargeConfirmationModal from "../../components/RechargeConfirmationModal";
import BlockUserModal from "../../components/BlockUserModal";
import BlockUserConfirmationModal from "../../components/BlockUserConfirmationModal";
import DeleteCitizenModal from "../../components/DeleteCitizenModal";
import DeleteCitizenConfirmationModal from "../../components/DeleteCitizenConfirmationModal";
import { useCitizensPage } from "@/hooks/useCitizensPage";
import MessageModal from "@/components/MessageModal";
import { useTranslation } from "react-i18next";
import { useGetAidList } from "@/services/useCitizensAndCommerce/useCitizensAndCommerce";
import { DownloadReportModal } from "@/components/DownloadReportModal";

export const CitizensPage: React.FC = () => {
	const {
		searchQuery,
		setSearchQuery,
		page,
		pageSize,
		handlePrevPage,
		handleNextPage,
		handleChangePageSize,
		showAddCitizenModal,
		showMessageModal,
		modalTitle,
		modalMessage,
		closeMessageModal,
		showRechargeModal,
		showRechargeConfirmationModal,
		rechargeAmount,
		showBlockModal,
		showBlockConfirmationModal,
		showDeleteModal,
		showDeleteConfirmationModal,
		selectedCitizen,
		handleAddCitizen,
		handleCloseAddCitizenModal,
		handleRechargeBalance,
		handleCloseRechargeModal,
		handleRechargeSubmit,
		handleCloseRechargeConfirmation,
		handleViewHistory,
		handleBlockCitizen,
		handleConfirmBlock,
		handleCloseBlockConfirmation,
		handleCancelBlock,
		handleDeleteCitizen,
		handleConfirmDelete,
		handleCloseDeleteConfirmation,
		handleCancelDelete,
		handleDownloadReport,
		showDownloadReportModal,
		handleCancelDownloadReport,
		handleConfirmDownloadReport,
		isDownloadingReport,
		data,
		isLoading,
		error,
	} = useCitizensPage();

	const { t } = useTranslation("translation", { keyPrefix: "citizens" });
	const { t: tAid } = useTranslation("translation", { keyPrefix: "citizenModal" });
	const { t: tCommons } = useTranslation("translation", {
		keyPrefix: "common",
	});
	const { t: tPagination } = useTranslation("translation", {
		keyPrefix: "pagination",
	});
	const [aid, setAid] = useState("");
	const { data: aids } = useGetAidList();

	const filteredCitizens = useMemo(() => {
		const search = searchQuery.toLowerCase();
		return (data?.results ?? []).filter((citizen) => {
			return (
				citizen.data?.full_name?.toLowerCase().includes(search) ||
				citizen.data?.dni?.toLowerCase().includes(search) ||
				citizen.email?.toLowerCase().includes(search) ||
				citizen.data?.phone_number?.toLowerCase().includes(search)
			);
		});
	}, [data, searchQuery]);

	return (
		<div className='flex min-h-screen bg-gray-100'>
			<div className='flex-1 px-8 py-8 md:px-16'>
				<h1 className='text-2xl font-bold mb-6'>{t("titleCitizen")}</h1>

				<div className='flex justify-between items-center mb-6'>
					<h2 className='text-2xl font-bold'>{t("listCitizen")}</h2>
					<div className='flex items-center space-x-4'>
						<div className='relative flex'>
							<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
								<Search size={18} className='text-gray-500' />
							</div>
							<select
								className='ssitizens-input pl-[35px] mr-4'
								value={aid}
								onChange={(e) => setAid(e.target.value)}
							>
								{aids?.map((aid) => (
									<option key={aid.id} value={aid.id}>
										{tAid(`aidTypes.${aid.name}`, aid.name)}
									</option>
								))}
							</select>
							<input
								type='text'
								placeholder={tCommons("search") + " " + tCommons("citizens") + "..."}
								className='pl-10 py-2 pr-4 rounded-full bg-gray-100 border-0 focus:ring-2 focus:ring-ssitizens-red focus:bg-white'
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
						<button onClick={handleAddCitizen} className='ssitizens-button flex items-center space-x-1'>
							<span>{t("addCitizen")}</span>
						</button>
					</div>
				</div>

				{isLoading && <p>{t("loadCitizen")}</p>}
				{error && (
					<p className='text-red-500'>
						{t("errorCitizen")} {error.message}
					</p>
				)}

				<div className='bg-white rounded-lg overflow-hidden shadow-sm mt-4'>
					<div className='overflow-x-auto'>
						<table className='min-w-full divide-y divide-gray-200'>
							<thead className='bg-gray-100'>
								<tr>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
										{t("nameCitizen")}
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
										{tCommons("email")}
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
										{tCommons("phone")}
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
										{t("dniCitizen")}
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
										{tCommons("aid_funds")}
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
										{tCommons("balance")}
									</th>
									<th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
										{tCommons("actions")}
									</th>
								</tr>
							</thead>
							<tbody className='bg-white divide-y divide-gray-200'>
								{filteredCitizens.map((citizen) => (
									<tr key={citizen.id} className='hover:bg-gray-50'>
										<td className='px-6 py-4 whitespace-nowrap'>
											<div className='text-sm font-medium text-gray-900'>
												{citizen.data?.full_name || "-"}
											</div>
										</td>
										<td className='px-6 py-4 whitespace-nowrap'>
											<div className='text-sm text-gray-600'>{citizen.email || "-"}</div>
										</td>
										<td className='px-6 py-4 whitespace-nowrap'>
											<div className='text-sm text-gray-600'>{citizen.data?.phone_number || "-"}</div>
										</td>
										<td className='px-6 py-4 whitespace-nowrap'>
											<div className='text-sm text-gray-600'>{citizen.data?.dni || "-"}</div>
										</td>
										<td className='px-6 py-4 whitespace-nowrap'>
											<div className='text-sm text-gray-600'>{citizen.data?.aid_funds || "-"}</div>
										</td>
										<td className='px-6 py-4 whitespace-nowrap'>
											<div className='text-sm text-gray-900'>{citizen.balance_tokens.toFixed(2)} Eurfy</div>
										</td>
										<td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
											<DropdownMenu>
												<DropdownMenuTrigger>
													<button className='text-gray-500 hover:text-gray-700'>
														<MoreVertical size={20} />
													</button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align='end' className='w-56'>
													<DropdownMenuItem onClick={() => handleRechargeBalance(citizen)}>
														{t("rechargeBalanceCitizen")}
													</DropdownMenuItem>
													<DropdownMenuItem onClick={() => handleViewHistory(citizen)}>
														{t("viewHistoricCitizen")}
													</DropdownMenuItem>
													<DropdownMenuItem onClick={() => handleBlockCitizen(citizen)}>
														{t("blockedCitizen")}
													</DropdownMenuItem>
													<DropdownMenuItem onClick={() => handleDownloadReport(citizen)}>
														{t("downloadReport")}
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => handleDeleteCitizen(citizen)}
														className='text-ssitizens-red'
													>
														{t("deletedCitizen")}
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					<div className='bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200'>
						<div className='flex items-center space-x-2'>
							<span className='text-sm text-gray-700'>{tPagination("rows")} </span>
							<select
								className='border border-gray-300 rounded p-1 text-sm'
								value={pageSize}
								onChange={handleChangePageSize}
							>
								<option value='25'>25</option>
								<option value='50'>50</option>
								<option value='100'>100</option>
							</select>
						</div>
						<div className='flex items-center space-x-2'>
							<span className='text-sm text-gray-700'>
								{tPagination("page")} {page}
							</span>
							<button onClick={handlePrevPage} className='p-1 rounded border border-gray-300'>
								<svg className='h-5 w-5' fill='currentColor' viewBox='0 0 20 20'>
									<path
										fillRule='evenodd'
										d='M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293
                      3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0
                      010-1.414l4-4a1 1 0 011.414 0z'
										clipRule='evenodd'
									/>
								</svg>
							</button>
							<button onClick={handleNextPage} className='p-1 rounded border border-gray-300'>
								<svg className='h-5 w-5' fill='currentColor' viewBox='0 0 20 20'>
									<path
										fillRule='evenodd'
										d='M7.293 14.707a1 1 0 010-1.414L10.586 10
                      7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0
                      010 1.414l-4 4a1 1 0 01-1.414 0z'
										clipRule='evenodd'
									/>
								</svg>
							</button>
						</div>
					</div>
				</div>

				{showMessageModal && (
					<MessageModal title={modalTitle} message={modalMessage} onClose={closeMessageModal} />
				)}

				{showAddCitizenModal && <CitizenModal onClose={handleCloseAddCitizenModal} />}

				{showRechargeModal && selectedCitizen && (
					<RechargeBalanceModal
						citizenName={selectedCitizen.data?.full_name || ""}
						onClose={handleCloseRechargeModal}
						onSubmit={handleRechargeSubmit}
					/>
				)}
				{showRechargeConfirmationModal && selectedCitizen && (
					<RechargeConfirmationModal
						citizenName={selectedCitizen.data?.full_name || ""}
						amount={rechargeAmount}
						onClose={handleCloseRechargeConfirmation}
					/>
				)}
				{showBlockModal && selectedCitizen && (
					<BlockUserModal
						userName={selectedCitizen.data?.full_name || ""}
						onConfirm={handleConfirmBlock}
						onCancel={handleCancelBlock}
					/>
				)}
				{showBlockConfirmationModal && selectedCitizen && (
					<BlockUserConfirmationModal
						userName={selectedCitizen.data?.full_name || ""}
						onClose={handleCloseBlockConfirmation}
					/>
				)}
				{showDeleteModal && selectedCitizen && (
					<DeleteCitizenModal
						citizenName={selectedCitizen.data?.full_name || ""}
						onConfirm={handleConfirmDelete}
						onCancel={handleCancelDelete}
					/>
				)}
				{showDownloadReportModal && selectedCitizen && (
					<DownloadReportModal
						citizenId={selectedCitizen.id}
						citizenName={selectedCitizen.data?.full_name || ""}
						onConfirm={(range, id) => handleConfirmDownloadReport(range, id)}
						onCancel={handleCancelDownloadReport}
						isLoading={isDownloadingReport}
					/>
				)}
				{showDeleteConfirmationModal && selectedCitizen && (
					<DeleteCitizenConfirmationModal
						citizenName={selectedCitizen.data?.full_name || ""}
						onClose={handleCloseDeleteConfirmation}
					/>
				)}
			</div>
		</div>
	);
};
