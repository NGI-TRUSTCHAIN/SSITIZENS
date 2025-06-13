import React, { useState } from "react";
import { useToast } from "@/hooks/useToast";
import GasConfirmationModal from "./GasConfirmationModal";
import { useTranslation } from "react-i18next";

interface AddGasModalProps {
	currentGas: number;
	onClose: () => void;
}

const AddGasModal: React.FC<AddGasModalProps> = ({ currentGas, onClose }) => {
	const [amount, setAmount] = useState("10");
	const [showConfirmation, setShowConfirmation] = useState(false);
	const { toast } = useToast();
	const { t } = useTranslation("translation", { keyPrefix: "addGasModal" });

	const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/[^0-9]/g, "");
		setAmount(value);
	};

	const handleRequestGas = () => {
		if (parseInt(amount) <= 0) {
			toast({
				title: t("errorAmount"),
				description: t("errorAmount"),
				variant: "destructive",
			});
			return;
		}
		setShowConfirmation(true);
	};

	if (showConfirmation) {
		return <GasConfirmationModal requestedAmount={parseInt(amount)} onClose={onClose} />;
	}

	return (
		<div className='modal-overlay' onClick={onClose}>
			<div className='modal-content max-w-md' onClick={(e) => e.stopPropagation()}>
				<div className='p-6'>
					<h2 className='text-2xl font-bold mb-4'>{t("title")}</h2>
					<div className='mb-6'>
						<p className='mb-2'>{t("currentGas", { amount: currentGas })}</p>
						<p className='mb-4'>{t("addGasInfo")}</p>
						<p className='mb-6'>{t("notify")}</p>
						<div className='mb-4'>
							<label htmlFor='amount' className='block text-sm font-medium text-gray-700 mb-1'>
								{t("amountLabel")}
							</label>
							<input
								id='amount'
								type='text'
								className='ssitizens-input'
								placeholder={t("amountPlaceholder")}
								value={amount}
								onChange={handleAmountChange}
							/>
						</div>
						<p className='text-sm text-gray-500'>{t("conversionInfo")}</p>
					</div>
					<div className='flex justify-between mt-8'>
						<button
							type='button'
							className='px-4 py-2 border border-gray-300 rounded bg-white hover:bg-gray-50'
							onClick={onClose}
						>
							{t("close", { keyPrefix: undefined })}
						</button>
						<button type='button' className='ssitizens-button' onClick={handleRequestGas}>
							{t("requestGas")}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AddGasModal;
