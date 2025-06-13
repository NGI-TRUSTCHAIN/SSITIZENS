import { useGetUsers } from '@/services/useCitizensAndCommerce/useCitizensAndCommerce'
import { EType } from '@/services/useCitizensAndCommerce/useCitizensAndCommerce.types'
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface BankAccountModalProps {
  onClose: () => void;
  onSave: (accountData: BankAccountData) => void;
}

export interface BankAccountData {
  holderName: string;
  cif: string;
  iban: string;
}

const BankAccountModal: React.FC<BankAccountModalProps> = ({ onClose, onSave }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<BankAccountData>({
    holderName: '',
    cif: '',
    iban: ''
  });

  const userData = useGetUsers({
    type: EType.store,
    email: "",
    address: "",
  }).data?.results?.[0];

  const holderName = userData?.data?.full_name || 'Nombre del titular';
  const cif = userData?.data?.cif || 'A123456789';
  const iban = userData?.data?.iban || 'XXXX-XXXX-XXXX-XXXX-XXXX';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">{t("bankAccountModal.title")}</h2>
          <p className="text-gray-600 mb-6">{t("bankAccountModal.description")}</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">{t("bankAccountModal.holderName")}</label>
              <input
                disabled
                type="text"
                name="holderName"
                value={formData.holderName}
                onChange={handleChange}
                placeholder={holderName}
                className="ssitizens-input"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">{t("bankAccountModal.cif")}</label>
              <input
                disabled
                type="text"
                name="cif"
                value={formData.cif}
                onChange={handleChange}
                placeholder={cif}
                className="ssitizens-input"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-600 mb-1">{t("bankAccountModal.iban")}</label>
              <input
                type="text"
                name="iban"
                value={formData.iban}
                onChange={handleChange}
                placeholder={iban}
                className="ssitizens-input"
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {t("bankAccountModal.back")}
              </button>
              <button
                type="submit"
                className="bg-ssitizens-red text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors"
                onClick={handleSubmit}
              >
                {t("bankAccountModal.save")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BankAccountModal;
