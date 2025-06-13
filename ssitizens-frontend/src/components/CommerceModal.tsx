import { ICommerceData } from '@/interfaces/commercesModalInterfaces/commerceModalInterfaces';
import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
export interface CommerceData {
  responsibleName: string;
  commerceName: string;
  cif: string;
  phone: string;
  email: string;
}

interface CommerceModalProps {
  onClose: (data?: CommerceData) => void;
}

const CommerceModal: React.FC<CommerceModalProps> = ({ onClose }) => {
  const { t } = useTranslation("translation", { keyPrefix: "commerceModal" });
  const [form, setForm] = useState<ICommerceData>({
    responsibleName: "",
    commerceName: "",
    cif: "",
    phone: "",
    email: "",
    });
    const handleSubmit = () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      form && onClose(form)
    };

  return (
    <div className="modal-overlay" onClick={() => onClose()}>
      <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-center">
            {t('title')}
          </h2>
          <p className="text-center text-gray-600 mb-6">
          {t('subtitle')}
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
              {t('responsibleName')}
              </label>
              <input
                type="text"
                className="ssitizens-input"
                placeholder="José García García"
                value={form.responsibleName}
                onChange={(e) =>{
                  setForm((prev) => ({ ...prev, responsibleName: e.target.value }));
                }}
              />
            </div>

            {/* Nombre del comercio */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
              {t('commerceName')}
              </label>
              <input
                type="text"
                className="ssitizens-input"
                placeholder="Nuevapanadería"
                value={form.commerceName}
                onChange={(e) =>{
                  setForm((prev) => ({ ...prev, commerceName: e.target.value }));
                }}
              />
            </div>

            {/* CIF */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
              {t('cif')}</label>
              <input
                type="text"
                className="ssitizens-input"
                placeholder="X123456789"
                value={form.cif}
                onChange={(e) =>{
                  setForm((prev) => ({ ...prev, cif: e.target.value }));
                }}
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {t('phone')}</label>
              <input
                type="tel"
                className="ssitizens-input"
                placeholder="+34666777888"
                value={form.phone}
                onChange={(e) =>{
                  setForm((prev) => ({ ...prev, phone: e.target.value }));
                }}
              />
            </div>

            {/* E-mail */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
              {t('email')}
              </label>
              <input
                type="email"
                className="ssitizens-input"
                placeholder="ejemplo@gmail.com"
                value={form.email}
                onChange={(e) =>{
                  setForm((prev) => ({ ...prev, email: e.target.value }));
                }}
              />
            </div>
          </div>

          <div className="mt-8">
            <p className="text-gray-600 mb-6">
            {t('message')}
            </p>
          </div>

          <div className="flex justify-between mt-4">
            <button
              className="px-6 py-2 border border-gray-300 rounded bg-white hover:bg-gray-50"
              onClick={() => onClose()}
            >
              {t('back')}
            </button>
            <button className="ssitizens-button" onClick={handleSubmit}>
            {t('create')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommerceModal;
