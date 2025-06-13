import React, { useState } from "react";
import { useToast } from "@/hooks/useToast";
import FundsConfirmationModal from "./FundsConfirmationModal";
import { postFundsGeneration } from "@/services/useAdminFunctions/useAdminFunctions";
import { useTranslation } from "react-i18next";

interface AddFundsModalProps {
	currentFunds: number;
	onClose: () => void;
}

const AddFundsModal: React.FC<AddFundsModalProps> = ({ currentFunds, onClose }) => {
	const [amount, setAmount] = useState("10");
	const [showConfirmation, setShowConfirmation] = useState(false);
	const { toast } = useToast();
	const { t } = useTranslation();

	const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		// Only allow numbers
		const value = e.target.value.replace(/[^0-9]/g, "");
		setAmount(value);
	};

	const handleRequestFunds = () => {
		const numericAmount = parseInt(amount);

		if (numericAmount <= 0 || isNaN(numericAmount)) {
			toast({
				title: t("common.error", "Error"),
				description: t("AddFundsModal.errorAmount"),
				variant: "destructive",
			});
			return;
		}

		postFundsGeneration(numericAmount)
			.then(() => {
				toast({
					title: t("addFundsModal.requested", "Fondos solicitados"),
					description: t("addFundsModal.requestedDescription"),
				});
				setShowConfirmation(true);
			})
			.catch((error) => {
				onClose();
				toast({
					title: t("common.error", "Error"),
					description: t("addFundsModal.errorGeneric"),
					variant: "destructive",
				});
			});
	};

	if (showConfirmation) {
		return <FundsConfirmationModal requestedAmount={parseInt(amount)} onClose={onClose} />;
	}

	return (
		<div className='modal-overlay' onClick={onClose}>
			<div className='modal-content max-w-md' onClick={(e) => e.stopPropagation()}>
				<div className='p-6'>
					<h2 className='text-2xl font-bold mb-4'>{t("addFundsModal.addFunds")}</h2>

					<div className='mb-6'>
						<p className='mb-4'>
							{t("addFundsModal.currentFunds", { amount: currentFunds.toLocaleString("es-ES") })}
						</p>
						<p className='mb-4'>{t("addFundsModal.addFundsInfo")}</p>
						<p className='mb-6'>{t("addFundsModal.notify")}</p>

						<div className='mb-4'>
							<label htmlFor='amount' className='block text-sm font-medium text-gray-700 mb-1'>
								{t("addFundsModal.amountLabel")}
							</label>
							<input
								id='amount'
								type='text'
								className='ssitizens-input'
								placeholder='10 Euros'
								value={amount}
								onChange={handleAmountChange}
							/>
						</div>
					</div>

					<div className='flex justify-between mt-8'>
						<button
							type='button'
							className='px-4 py-2 border border-gray-300 rounded bg-white hover:bg-gray-50'
							onClick={onClose}
						>
							{t("common.back")}
						</button>
						<button type='button' className='ssitizens-button' onClick={handleRequestFunds}>
							{t("addFundsModal.requestFunds")}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AddFundsModal;
