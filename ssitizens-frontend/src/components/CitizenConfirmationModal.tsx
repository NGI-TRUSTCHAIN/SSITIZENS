import React from 'react';
import { useTranslation } from 'react-i18next';

interface CitizenConfirmationModalProps {
  citizenName: string;
  onClose: () => void;
}

const CitizenConfirmationModal: React.FC<CitizenConfirmationModalProps> = ({ citizenName, onClose }) => {
  const { t } = useTranslation();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-center">
            {t("citizenConfirmation.title")}
          </h2>
          <div className="mb-6 text-center">
            <p className="mb-4">
              {t("citizenConfirmation.message", { citizenName })}
            </p>
          </div>
          <div className="flex justify-center">
            <button 
              type="button" 
              className="ssitizens-button"
              onClick={onClose}
            >
              {t("citizenConfirmation.close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenConfirmationModal;
