import { CitizenModalProps, ICitizenData } from "@/interfaces";
import { useGetAidList } from "@/services/useCitizensAndCommerce/useCitizensAndCommerce";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const CitizenModal: React.FC<CitizenModalProps> = ({ onClose }) => {
  const { t } = useTranslation("translation", { keyPrefix: "citizenModal" });
  const [form, setForm] = useState<ICitizenData>({
    fullName: "",
    dni: "",
    phone: "",
    email: "",
    funds: null,
    aid: 1,
  });
  const { data: aids } = useGetAidList();

  const handleSubmit = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    form && onClose(form)
  };

  return (
    <div className="modal-overlay" onClick={() => onClose()}>
      <div
        className="modal-content max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
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
              {t('aid')}
              </label>
              <select
                className="ssitizens-input"
                value={form.aid}

                onChange={(e) => {
                  const selectedAid = aids.find((aid) => aid.id === e.target.value);
                  setForm((prev) => ({ ...prev, aid: selectedAid.id}));
                }}
              >
                {aids?.map((aid) => (
                  <option key={aid.id} value={aid.id}>
                    {t(`aidTypes.${aid.name}`, aid.name)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {t('name')}
              </label>
              <input
                type="text"
                className="ssitizens-input"
                placeholder="José García García"
                value={form.fullName}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, fullName: e.target.value }));
                }}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">{t('dni')}</label>
              <input
                type="text"
                className="ssitizens-input"
                placeholder="123456789X"
                value={form.dni}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, dni: e.target.value }));
                }}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {t('phone')}
              </label>
              <input
                type="tel"
                className="ssitizens-input"
                placeholder="+34666777888"
                value={form.phone}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, phone: e.target.value }));
                }}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">E-mail</label>
              <input
                type="email"
                className="ssitizens-input"
                placeholder="ejemplo@gmail.com"
                value={form.email}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, email: e.target.value }));
                }}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {t('funds')}
              </label>
              <input
                type="number"
                className="ssitizens-input"
                placeholder="0"
                value={form.funds}
                onChange={(e) => {
                  setForm((prev) => ({
                    ...prev,
                    funds: Number(e.target.value),
                  }));
                }}
              />
            </div>
          </div>

          <div className="flex justify-between mt-8">
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

export default CitizenModal;
