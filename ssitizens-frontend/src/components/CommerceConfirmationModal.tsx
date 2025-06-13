import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CommerceConfirmationModalProps {
  commerceName: string;
  onClose: () => void;
}

const CommerceConfirmationModal: React.FC<CommerceConfirmationModalProps> = ({ commerceName, onClose }) => {
  const { t } = useTranslation();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 flex flex-col items-center">
          <div className="mb-4 bg-green-100 rounded-full p-4">
            <CheckCircle size={48} className="text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2 text-center">
            {t("commerceConfirmation.title")}
          </h2>
          <p className="text-center text-gray-600 mb-6">
            {t("commerceConfirmation.message", { commerceName })}
          </p>
          
          <button 
            className="ssitizens-button w-full"
            onClick={onClose}
          >
            {t("commerceConfirmation.accept")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommerceConfirmationModal;
