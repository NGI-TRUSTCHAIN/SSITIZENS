import React from "react";
import { useTranslation } from "react-i18next";

interface AccountDeactivationModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

const AccountDeactivationModal: React.FC<AccountDeactivationModalProps> = ({ onClose, onConfirm }) => {
  const { t } = useTranslation();
  return (
    <div className="modal-overlay">
      <div className="modal-content w-full max-w-md p-0">
        <div className="p-6">
					<h2 className='text-2xl font-bold mb-3'>{t("accountDeactivationModal.title")}</h2>

					<p className='text-gray-600 mb-6'>{t("accountDeactivationModal.description")}</p>

					<div className='flex justify-end gap-3'>
						<button
							onClick={onClose}
							className='px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors'
						>
							{t("common.back")}
						</button>
						<button
							onClick={onConfirm}
							className='bg-ssitizens-red text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors'
						>
							{t("accountDeactivationModal.confirm")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDeactivationModal;
