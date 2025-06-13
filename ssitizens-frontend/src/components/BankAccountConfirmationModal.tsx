
import React from 'react';
import { CheckCircle } from 'lucide-react';

interface BankAccountConfirmationModalProps {
  onClose: () => void;
  bankData: {
    holderName: string;
    iban: string;
  };
}

const BankAccountConfirmationModal: React.FC<BankAccountConfirmationModalProps> = ({ 
  onClose, 
  bankData 
}) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 flex flex-col items-center">
          <div className="mb-4 bg-green-100 rounded-full p-4">
            <CheckCircle size={48} className="text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2 text-center">¡Cuenta bancaria guardada!</h2>
          <p className="text-center text-gray-600 mb-6">
            La cuenta de <span className="font-medium">{bankData.holderName}</span> con IBAN <span className="font-medium">{bankData.iban}</span> ha sido añadida correctamente.
          </p>
          
          <button 
            className="bg-ssitizens-red text-white px-8 py-3 rounded-full hover:bg-red-700 transition-colors"
            onClick={onClose}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

export default BankAccountConfirmationModal;
