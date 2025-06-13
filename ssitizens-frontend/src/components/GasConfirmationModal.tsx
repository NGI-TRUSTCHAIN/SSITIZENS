
import React from 'react';

interface GasConfirmationModalProps {
  requestedAmount: number;
  onClose: () => void;
}

const GasConfirmationModal: React.FC<GasConfirmationModalProps> = ({ requestedAmount, onClose }) => {
  // Convert euros to ethers (1 euro = 10 ethers)
  const ethersAmount = requestedAmount * 10;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Gas solicitado</h2>
          
          <div className="mb-6">
            <p className="mb-2">Se han solicitado {ethersAmount} Ethers.</p>
            <p className="mb-4">Cuando los fondos estén disponibles, recibirás una notificación en el sistema con su disponibilidad.</p>
            <p>Si son aprobados, automáticamente se cargará el monto en la cuenta del ayuntamiento.</p>
          </div>
          
          <div className="flex justify-end mt-8">
            <button 
              type="button" 
              className="ssitizens-button"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GasConfirmationModal;
