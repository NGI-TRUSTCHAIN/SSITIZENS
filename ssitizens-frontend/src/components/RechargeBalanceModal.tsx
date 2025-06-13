import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface RechargeBalanceModalProps {
  citizenName: string;
  onClose: () => void;
  onSubmit: (amount: number) => void;
}

const RechargeBalanceModal: React.FC<RechargeBalanceModalProps> = ({ 
  citizenName,
  onClose,
  onSubmit
}) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const numAmount = Number(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Por favor, introduce una cantidad válida');
      return;
    }
    
    if (numAmount > 10000) {
      setError('La cantidad máxima es de 10.000 Eurfy');
      return;
    }
    
    onSubmit(numAmount);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">{t("rechargeBalanceModal.title")}</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <p className="mb-4">
                {t("rechargeBalanceModal.prompt", { citizenName })}
              </p>
              
              <div className="relative">
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value.replace(/[^0-9.]/g, ''));
                    setError('');
                  }}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ssitizens-red"
                  placeholder={t("rechargeBalanceModal.placeholder")}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {t("rechargeBalanceModal.currency")}
                </span>
              </div>
              
              {error && (
                <p className="mt-2 text-ssitizens-red text-sm">
                  {error === 'Por favor, introduce una cantidad válida'
                    ? t("rechargeBalanceModal.errorAmount")
                    : t("rechargeBalanceModal.errorMax")}
                </p>
              )}
            </div>
            
            <div className="flex justify-end">
              <button 
                type="button" 
                className="px-4 py-2 mr-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={onClose}
              >
                {t("rechargeBalanceModal.cancel")}
              </button>
              <button 
                type="submit" 
                className="ssitizens-button flex items-center"
                onClick={handleSubmit}
              >
                <span>{t("rechargeBalanceModal.submit")}</span>
                <ArrowRight size={18} className="ml-2" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RechargeBalanceModal;
