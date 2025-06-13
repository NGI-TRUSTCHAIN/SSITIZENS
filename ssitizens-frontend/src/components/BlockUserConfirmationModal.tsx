import React from "react";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

interface BlockUserConfirmationModalProps {
	userName: string;
	onClose: () => void;
}

const BlockUserConfirmationModal: React.FC<BlockUserConfirmationModalProps> = ({ userName, onClose }) => {
	const { t } = useTranslation();

	return (
		<div
			className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
			onClick={onClose}
		>
			<div className='bg-white rounded-lg max-w-md w-full mx-4' onClick={(e) => e.stopPropagation()}>
				<div className='p-6'>
					<div className='flex flex-col items-center mb-6'>
						<div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4'>
							<Check size={32} className='text-green-600' />
						</div>
						<h2 className='text-2xl font-bold text-center'>{t("citizens.blockConfirmationTitle")}</h2>
					</div>

					<div className='mb-6 text-center'>
						<p className='mb-4'>
							{t("citizens.blockConfirmationMessage", {
								userName: userName,
							})}
						</p>
						<p>{t("citizens.blockConfirmationDetail")}</p>
					</div>

					<div className='flex justify-center'>
						<button
							type='button'
							className='bg-ssitizens-red hover:bg-red-700 text-white font-medium py-2 px-6 rounded-md transition-colors'
							onClick={onClose}
						>
							{t("common.accept")}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default BlockUserConfirmationModal;
