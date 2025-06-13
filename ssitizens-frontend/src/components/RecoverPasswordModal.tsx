import React, { useState } from 'react';
import { useToast } from "@/hooks/useToast";
import { useTranslation } from 'react-i18next';
import { recoverPassword } from '@/services/useAdminFunctions/useAdminFunctions'

interface RecoverPasswordModalProps {
  onClose: () => void;
}

const RecoverPasswordModal: React.FC<RecoverPasswordModalProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

    try {
      await recoverPassword(email)
      setTimeout(() => {
        toast({
          title: t("recoverPasswordModal.toastTitle"),
          description: t("recoverPasswordModal.toastDescription"),
        });
        onClose();
        setLoading(false);
      }, 1000);

    } catch (error) {
      toast({
        title: t("recoverPasswordModal.errorTitle"),
        description: t("recoverPasswordModal.errorDescription"),
        variant: "destructive",
      });
      onClose();
      setLoading(false);
      return;
    }
	};

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-center">{t("recoverPasswordModal.title")}</h2>
          <p className="text-center text-gray-600 mb-6">{t("recoverPasswordModal.description")}</p>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t("recoverPasswordModal.emailLabel")}
              </label>
              <input
                id="email"
                type="email"
                className="ssitizens-input"
                placeholder={t("recoverPasswordModal.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="flex justify-between mt-8">
              <button 
                type="button" 
                className="px-4 py-2 border border-gray-300 rounded bg-white hover:bg-gray-50"
                onClick={onClose}
              >
                {t("recoverPasswordModal.cancel")}
              </button>
              <button 
                type="submit" 
                className="ssitizens-button"
                disabled={loading}
              >
                {loading ? t("recoverPasswordModal.sending") : t("recoverPasswordModal.submit")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecoverPasswordModal;
