import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/useToast";
import { usePutUserByID } from "@/services/useCitizensAndCommerce/useCitizensAndCommerce"
import { useQueryClient } from "@tanstack/react-query"
import { IUserGetResponse } from "@/services/useCitizensAndCommerce/useCitizensAndCommerce.types"
import { useTranslation } from "react-i18next"

const useModal = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const navigate = useNavigate();
  const { mutate: updateUser } = usePutUserByID();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const openModal = (modalType: string) => {
    setActiveModal(modalType);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const handleCitizenAccess = () => {
    openModal("citizenQR");
  };

  const handleCommerceAccess = () => {
    openModal("commerceQR");
  };

	const handlePrivacyAccept = (userData: IUserGetResponse) => {
		updateUser(
			{
				id: userData.id,
				payload: {
					...userData, 
					terms_accepted: true,
				},
			},
			{
			 onSuccess: () => {
          closeModal();
          queryClient.invalidateQueries({ queryKey: ["users"] });
          toast({
            title: t("privacyToast.successTitle"),
            description: t("privacyToast.successDescription"),
            variant: "success",
          });
        },
        onError: () => {
          toast({
            title: t("privacyToast.errorTitle"),
            description: t("privacyToast.errorDescription"),
            variant: "destructive",
          });
        },
			}
		);

	};

  const handlePrivacyReject = () => {
    closeModal();
    toast({
      title: t("privacyToast.rejectTitle"),
      description: t("privacyToast.rejectDescription"),
      variant: "destructive",
    });
    navigate('/');
  };

  const continueToCitizenPrivacyPolicy = () => {
    setActiveModal("citizenPrivacy");
  };

  const continueToCommercePrivacyPolicy = () => {
    setActiveModal("commercePrivacy");
  };

 return {
    activeModal,
    openModal,
    closeModal,
    handleCitizenAccess,
    handleCommerceAccess,
    handlePrivacyAccept,
    handlePrivacyReject,
    continueToCitizenPrivacyPolicy,
    continueToCommercePrivacyPolicy,
  };
};

export default useModal;