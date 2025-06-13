import { Search, MoreVertical } from "lucide-react";
import CommerceModal from "../../components/CommerceModal";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCommercePage } from "@/hooks/useCommercePage";
import MessageModal from "@/components/MessageModal";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import BlockUserModal from "@/components/BlockUserModal";
import BlockUserConfirmationModal from "@/components/BlockUserConfirmationModal";

export const CommercePage = () => {
	const {
		searchQuery,
		setSearchQuery,
		page,
		pageSize,
		showAddCommerceModal,
		isLoading,
		error,
		commerceList,
		closeMessageModal,
		modalTitle,
		modalMessage,
		showMessageModal,
		handleAddCommerce,
		handleCloseAddCommerceModal,
		handleProcessPayment,
		handleViewHistory,
		handleBlockCommerce,
		handleDeleteCommerce,
		handlePrevPage,
		handleNextPage,
		handleChangePageSize,
		showBlockModal,
		showBlockConfirmationModal,
		selectedCommerce,
		handleConfirmBlock,
		handleCancelBlock,
		handleCloseBlockConfirmation,
	} = useCommercePage();

	const { t } = useTranslation("translation", { keyPrefix: "commerce" });
	const { t: tCommons } = useTranslation("translation", { keyPrefix: "common" });
	const { t: tPagination } = useTranslation("translation", {
		keyPrefix: "pagination",
	});

	const filteredCommerces = useMemo(() => {
		const search = searchQuery.toLowerCase();
		return (commerceList ?? []).filter((commerce) => {
			return (
				commerce.data?.store_id?.toLowerCase().includes(search) ||
				commerce.data?.full_name?.toLowerCase().includes(search) ||
				commerce.email?.toLowerCase().includes(search) ||
				commerce.data.phone?.toLowerCase().includes(search) ||
				commerce.data?.cif?.toLowerCase().includes(search) ||
				commerce.data?.balance_ethers?.toLowerCase().includes(search)
			);
		});
	}, [commerceList, searchQuery]);

	return (
		<div className='flex min-h-screen bg-gray-100'>
			<div className='flex-1 px-8 py-8 md:px-16'>
				<h1 className='text-2xl font-bold mb-6'>{t("title")}</h1>

				<div className='flex justify-between items-center mb-6'>
					<h2 className='text-2xl font-bold'>{t("listCommerce")}</h2>
					<div className='flex items-center space-x-4'>
						<div className='relative'>
							<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
								<Search size={18} className='text-gray-500' />
							</div>
							<input
								type='text'
								placeholder={tCommons("search") + " " + tCommons("commerce") + "..."}
								className='pl-10 py-2 pr-4 rounded-full bg-gray-100 border-0 focus:ring-2 focus:ring-ssitizens-red focus:bg-white'
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
						<button onClick={handleAddCommerce} className='ssitizens-button flex items-center space-x-1'>
							<span>{t("addCommerce")}</span>
						</button>
					</div>
				</div>

				{isLoading && <p>{t("loadCommerce")}</p>}
				{error && (
					<p className='text-red-500'>
						{t("errorCitizens")} {error.message}
					</p>
				)}

				<div className='bg-white rounded-lg overflow-hidden shadow-sm mt-4'>
					<div className='overflow-x-auto'>
						<table className='min-w-full divide-y divide-gray-200'>
							<thead className='bg-gray-100'>
								<tr>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
										{t("commerceTitleCommerce")}
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
										{t("representativeCommerce")}
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
										{tCommons("email")}
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
										{tCommons("phone")}
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
										{t("cifCommerce")}
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
								{filteredCommerces.map((commerce) => (
									<tr key={commerce.id} className='hover:bg-gray-50'>
										<td className='px-6 py-4 whitespace-nowrap'>
											<div className='text-sm font-medium text-gray-900'>
												{commerce.data?.store_id || "-"}
											</div>
										</td>
										<td className='px-6 py-4 whitespace-nowrap'>
											<div className='text-sm text-gray-500'>{commerce.data?.full_name || "-"}</div>
										</td>
										<td className='px-6 py-4 whitespace-nowrap'>
											<div className='text-sm text-gray-500'>{commerce.email}</div>
										</td>
										<td className='px-6 py-4 whitespace-nowrap'>
											<div className='text-sm text-gray-500'>{commerce.data?.phone_number}</div>
										</td>
										<td className='px-6 py-4 whitespace-nowrap'>
											<div className='text-sm text-gray-500'>{commerce.data?.cif}</div>
										</td>
										<td className='px-6 py-4 whitespace-nowrap'>
											<div className='text-sm text-gray-900'>
												{commerce.balance_tokens?.toFixed(2)} {tCommons("localCurrency")}
											</div>
										</td>
										<td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
											<DropdownMenu>
												<DropdownMenuTrigger>
													<button className='text-gray-500 hover:text-gray-700'>
														<MoreVertical size={20} />
													</button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align='end' className='w-56'>
													{/* <DropdownMenuItem
                            onClick={() => handleProcessPayment(commerce)}
                          >
                            {t('paymentCommerce')}
                          </DropdownMenuItem> */}
													<DropdownMenuItem onClick={() => handleViewHistory(commerce)}>
														{t("viewHistoricCommerce")}
													</DropdownMenuItem>
													<DropdownMenuItem onClick={() => handleBlockCommerce(commerce)}>
														{t("blockedCommerce")}
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => handleDeleteCommerce(commerce)}
														className='text-ssitizens-red'
													>
														{t("deletedCommerce")}
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
							<span className='text-sm text-gray-700'>{tPagination("rows")}</span>
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
										d='M12.707 5.293a1 1 0 010 1.414L9.414
                      10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0
                      010-1.414l4-4a1 1 0 011.414 0z'
										clipRule='evenodd'
									/>
								</svg>
							</button>
							<button onClick={handleNextPage} className='p-1 rounded border border-gray-300'>
								<svg className='h-5 w-5' fill='currentColor' viewBox='0 0 20 20'>
									<path
										fillRule='evenodd'
										d='M7.293 14.707a1 1 0 010-1.414L10.586
                      10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0
                      010 1.414l-4 4a1 1 0 01-1.414 0z'
										clipRule='evenodd'
									/>
								</svg>
							</button>
						</div>
					</div>
				</div>

				{showAddCommerceModal && <CommerceModal onClose={handleCloseAddCommerceModal} />}
				{showBlockModal && selectedCommerce && (
					<BlockUserModal
						userName={selectedCommerce.data?.full_name || ""}
						onConfirm={handleConfirmBlock}
						onCancel={handleCancelBlock}
					/>
				)}
				{showBlockConfirmationModal && selectedCommerce && (
					<BlockUserConfirmationModal
						userName={selectedCommerce.data?.full_name || ""}
						onClose={handleCloseBlockConfirmation}
					/>
				)}

				{showMessageModal && (
					<MessageModal title={modalTitle} message={modalMessage} onClose={closeMessageModal} />
				)}
			</div>
		</div>
	);
};
