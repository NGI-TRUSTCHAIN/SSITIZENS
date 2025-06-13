
import React from 'react';
import { useTranslation } from 'react-i18next'

interface FundsConfirmationModalProps {
  requestedAmount: number;
  onClose: () => void;
}

const FundsConfirmationModal: React.FC<FundsConfirmationModalProps> = ({ requestedAmount, onClose }) => {
  const { t } = useTranslation();
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">{t("fundsConfirmationModal.title")}</h2>
          
          <div className="mb-6">
            <p className="mb-2">
              {t("fundsConfirmationModal.requested", { amount: requestedAmount.toLocaleString('es-ES') })}
            </p>
            <p className="mb-4">{t("fundsConfirmationModal.notify")}</p>
            <p>{t("fundsConfirmationModal.autoLoad")}</p>
          </div>
          
          <div className="flex justify-end mt-8">
            <button 
              type="button" 
              className="ssitizens-button"
              onClick={onClose}
            >
              {t("fundsConfirmationModal.close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundsConfirmationModal;
