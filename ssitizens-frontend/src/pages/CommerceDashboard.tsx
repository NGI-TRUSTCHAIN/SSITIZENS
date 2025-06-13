import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, History, FileText } from 'lucide-react';
import { toast } from '@/hooks/useToast';
import BankAccountModal from '@/components/BankAccountModal';
import BankAccountConfirmationModal from '@/components/BankAccountConfirmationModal';
import { BankAccountData } from '@/components/BankAccountModal';
import { useTranslation } from 'react-i18next';
import { usePutUserByID, useGetUsers } from '@/services';
import { EType } from '@/services/useCitizensAndCommerce/useCitizensAndCommerce.types';
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal'
import useModal from '@/features/main/hooks/useModal'

const CommerceDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { mutate: updateUser } = usePutUserByID();
  const [showBankAccountModal, setShowBankAccountModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [bankData, setBankData] = useState<{ holderName: string; iban: string }>({
    holderName: '',
    iban: ''
  });
  const { activeModal, handlePrivacyAccept, handlePrivacyReject, continueToCommercePrivacyPolicy } =
    useModal();

  const userData = useGetUsers({
    type: EType.store,
    email: "",
    address: "",
  }).data?.results?.[0];

  const userId = userData?.id;

  const termsAccepted = userData?.terms_accepted;
  
    useEffect(() => {
      if (termsAccepted === false) {
        continueToCommercePrivacyPolicy();
      }
    }, [termsAccepted]);

  
  const handleSaveBankAccount = (accountData: BankAccountData) => {
    if (userId) {
      updateUser({
        id: userId,
        payload: {
          ...userData,
          data: {
            ...userData.data,
            iban: accountData.iban,
          },
        },
      });
    }
    
    toast({
      title: t("commerceDashboard.bankAccountAddedTitle"),
      description: t("commerceDashboard.bankAccountAddedDescription"),
      variant: 'success'
    });
    
    setBankData({
      holderName: userData.data.full_name,
      iban: accountData.iban,
    });
    
    setShowBankAccountModal(false);
    setShowConfirmationModal(true);
  };

  const handleAddBankAccount = () => {
    setShowBankAccountModal(true);
  };

  const handleViewHistory = () => {
    navigate('/transaction-history');
  };

  const handleViewPrivacyPolicy = () => {
    navigate('/commerce-privacy-policy');
  };

  return (
    <div className="flex min-h-screen">
      <main className="flex-1 p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-5xl font-bold mb-2">{t("commerceDashboard.welcomeTitle")}</h1>
            <p className="text-xl text-gray-600">
              {t("commerceDashboard.welcomeSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Dar de alta número de cuenta Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm h-80 flex flex-col justify-between">
              <div className="flex flex-col items-center">
                <div className="mb-4">
                  <CreditCard size={28} className="text-ssitizens-darkgray" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-center">
                  {t("commerceDashboard.bankAccountTitle")}
                </h2>
                <p className="text-gray-600 text-center mb-6">
                  {t("commerceDashboard.bankAccountDescription")}
                </p>
              </div>
              <div className="flex justify-center mt-auto">
                <button
                  onClick={handleAddBankAccount}
                  className="ssitizens-button"
                >
                  {t("commerceDashboard.addBankAccountButton", "Añadir nueva cuenta bancaria")}
                </button>
              </div>
            </div>

            {/* Revisa tus transacciones Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm h-80 flex flex-col justify-between">
              <div className="flex flex-col items-center">
                <div className="mb-4">
                  <History size={28} className="text-ssitizens-darkgray" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-center">
                  {t("commerceDashboard.historyTitle")}
                </h2>
                <p className="text-gray-600 text-center mb-6">
                  {t("commerceDashboard.historyDescription")}
                </p>
              </div>
              <div className="flex justify-center mt-auto">
                <button
                  onClick={handleViewHistory}
                  className="ssitizens-button"
                >
                  {t("commerceDashboard.historyButton")}
                </button>
              </div>
            </div>

            {/* Políticas de privacidad Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm h-80 flex flex-col justify-between">
              <div className="flex flex-col items-center">
                <div className="mb-4">
                  <FileText size={28} className="text-ssitizens-darkgray" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-center">
                  {t("commerceDashboard.privacyTitle")}
                </h2>
                <p className="text-gray-600 text-center mb-6">
                  {t("commerceDashboard.privacyDescription")}
                </p>
              </div>
              <div className="flex justify-center mt-auto">
                <button
                  onClick={handleViewPrivacyPolicy}
                  className="ssitizens-button"
                >
                  {t("commerceDashboard.privacyButton")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showBankAccountModal && (
        <BankAccountModal
          onClose={() => setShowBankAccountModal(false)}
          onSave={handleSaveBankAccount}
        />
      )}

      {showConfirmationModal && (
        <BankAccountConfirmationModal
          onClose={() => setShowConfirmationModal(false)}
          bankData={bankData}
        />
      )}
      {activeModal === "commercePrivacy" && (
          <PrivacyPolicyModal
            onAccept={() => handlePrivacyAccept(userData)}
            onReject={handlePrivacyReject}
          />
        )}
    </div>
  );
};

export default CommerceDashboard;
