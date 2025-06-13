import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DeleteCitizenModalProps {
  citizenName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteCitizenModal: React.FC<DeleteCitizenModalProps> = ({
  citizenName,
  onConfirm,
  onCancel
}) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onCancel}>
      <div className="bg-white rounded-lg max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle size={32} className="text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-center">
              {t("citizens.deletedCitizen")}
            </h2>
          </div>
          
          <div className="mb-6 text-center">
            <p className="mb-4">
              {t("citizens.deleteConfirm", { citizenName })}
            </p>
            <p>
              {t("citizens.deleteWarning")}
            </p>
          </div>
          
          <div className="flex justify-center gap-4">
            <button 
              type="button" 
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-6 rounded-md transition-colors"
              onClick={onCancel}
            >
              {t("common.cancel", "Cancelar")}
            </button>
            <button 
              type="button" 
              className="bg-ssitizens-red hover:bg-red-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
              onClick={onConfirm}
            >
              {t("citizens.deletedCitizen")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteCitizenModal;
