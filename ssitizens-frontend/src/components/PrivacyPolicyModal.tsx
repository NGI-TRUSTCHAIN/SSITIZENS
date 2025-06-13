import React from 'react';
import { useTranslation } from 'react-i18next'

interface PrivacyPolicyModalProps {
  onAccept: () => void;
  onReject: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ onAccept, onReject }) => {
  const { t } = useTranslation();

  const policy = t('commerceDashboard.privacyPolicy', { returnObjects: true }) as string[];

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 flex flex-col">
          <h2 className="text-3xl font-bold mb-4">{t('commerceDashboard.privacyTitle')}</h2>
          <p className="text-gray-600 mb-6">{t('commerceDashboard.privacyDescription')}</p>
          <div className="mb-6 max-h-64 overflow-y-auto pr-2">
            {policy.map((item, idx) => (
              <p className="text-gray-700 mb-4" key={idx}>{item}</p>
            ))}
          </div>
          <div className="flex justify-end gap-4">
            <button 
              className="text-gray-600 border border-gray-300 rounded-full px-8 py-2 hover:bg-gray-100 transition-colors"
              onClick={onReject}
            >
              {t('common.reject')}
            </button>
            <button 
              className="bg-ssitizens-red text-white rounded-full px-8 py-2 hover:bg-red-700 transition-colors"
              onClick={onAccept}
            >
              {t('common.accept')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyModal;
