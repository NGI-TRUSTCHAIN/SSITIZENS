import { Building, Store, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/LanguageSelector";
import { LoginCard, useModal } from "@/features/index";
import AdminModal from "@/components/AdminModal";
import CitizenModal from "@/components/CitizenModal";
import CommerceModal from "@/components/CommerceModal";
import QRCodeModal from "@/components/QRCodeModal";

export const IndexPage = () => {
  const { t } = useTranslation("translation", { keyPrefix: "login" });

  const {
    activeModal,
    openModal,
    closeModal,
    handleCitizenAccess,
    handleCommerceAccess,
  } = useModal();

  return (
    <div className="min-h-screen flex">
      <div className="w-1/3 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-[#cc2b2b] opacity-70"></div>
        <div className="absolute inset-0 flex items-center justify-center p-0">
          <img
            src="/lovable-uploads/6ae753c2-c398-4e76-a33c-1fa263245674.png"
            alt="Ssitizens Logo"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="w-2/3 p-12">
        <LanguageSelector />
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-5xl font-bold mb-2">{t("title")}</h1>
            <p className="text-lg text-gray-600">{t("subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <LoginCard
              icon={<Building size={32} className="text-ssitizens-darkgray" />}
              title={t("admin.titleAdmin")}
              subtitle={t("admin.subtitleAdmin")}
              buttonText={t("admin.buttonLoginAdmin")}
              onClick={() => openModal("admin")}
              animationDelay="0.1s"
            />

            <LoginCard
              icon={<User size={32} className="text-ssitizens-darkgray" />}
              title={t("ssitizens.titleSsitizens")}
              subtitle={t("ssitizens.subtitleSsitizens")}
              buttonText={t("ssitizens.buttonLoginSsitizens")}
              onClick={handleCitizenAccess}
              animationDelay="0.2s"
            />

            <LoginCard
              icon={<Store size={32} className="text-ssitizens-darkgray" />}
              title={t("commerce.titleCommerce")}
              subtitle={t("commerce.subtitleCommerce")}
              buttonText={t("commerce.buttonLoginCommerce")}
              onClick={handleCommerceAccess}
              animationDelay="0.3s"
            />
          </div>
        </div>
      </div>

      {activeModal === "admin" && <AdminModal onClose={closeModal} />}
      {activeModal === "citizen" && <CitizenModal onClose={closeModal} />}
      {activeModal === "commerce" && <CommerceModal onClose={closeModal} />}

      {activeModal === "citizenQR" && (
        <QRCodeModal onClose={closeModal} type="citizen" />
      )}

      {activeModal === "commerceQR" && (
        <QRCodeModal onClose={closeModal} type="commerce" />
      )}
    </div>
  );
};

