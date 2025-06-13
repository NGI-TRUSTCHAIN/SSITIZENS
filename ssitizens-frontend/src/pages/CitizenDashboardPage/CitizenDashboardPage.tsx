import { useNavigate } from "react-router-dom";
import { FileText, History, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import PrivacyPolicyModal from "@/components/PrivacyPolicyModal";
import useModal from "@/features/main/hooks/useModal";
import { useGetUsers } from "@/services/useCitizensAndCommerce/useCitizensAndCommerce";
import { EType } from "@/services/useCitizensAndCommerce/useCitizensAndCommerce.types";

export const CitizenDashboardPage = () => {
	const navigate = useNavigate();
	const { t } = useTranslation("translation", {
		keyPrefix: "citizensAdminDashboard",
	});

	const { activeModal, handlePrivacyAccept, handlePrivacyReject, continueToCitizenPrivacyPolicy } =
		useModal();

	const handleViewHistory = () => {
		navigate("/transaction-history");
	};

	const handleViewManual = () => {
		navigate("/user-manual");
	};

	const handleViewPrivacyPolicy = () => {
		navigate("/citizen-privacy-policy");
	};

	const userData = useGetUsers({
		type: EType.beneficiary,
		email: "",
		address: "",
	}).data?.results[0];

	// IBAN is needed for commerce users, so we ensure it exists
	if (userData?.data && !("iban" in userData.data)) {
		userData.data.iban = "";
	}

	const termsAccepted = userData?.terms_accepted;

	useEffect(() => {
		if (termsAccepted === false) {
			continueToCitizenPrivacyPolicy();
		}
	}, [termsAccepted]);

	return (
		<div className='flex min-h-screen'>
			<main className='flex-1 p-8 bg-gray-50'>
				<div className='max-w-7xl mx-auto'>
					<div className='mb-8'>
						<h1 className='text-5xl font-bold mb-2'>{t("welcomeTitle")}</h1>
						<p className='text-xl text-gray-600'>{t("welcomeSubtitle")}</p>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
						{/* Manual Card */}
						<div className='bg-white p-6 rounded-lg shadow-sm h-80 flex flex-col justify-between'>
							<div className='flex flex-col items-center'>
								<div className='mb-4'>
									<FileText size={28} className='text-ssitizens-darkgray' />
								</div>
								<h2 className='text-2xl font-bold mb-2 text-center'>{t("manualTitle")}</h2>
								<p className='text-gray-600 text-center mb-6'>{t("manualDescription")}</p>
							</div>
							<div className='flex justify-center mt-auto'>
								<button onClick={handleViewManual} className='ssitizens-button'>
									{t("manualButton")}
								</button>
							</div>
						</div>

						{/* History Card */}
						<div className='bg-white p-6 rounded-lg shadow-sm h-80 flex flex-col justify-between'>
							<div className='flex flex-col items-center'>
								<div className='mb-4'>
									<History size={28} className='text-ssitizens-darkgray' />
								</div>
								<h2 className='text-2xl font-bold mb-2 text-center'>{t("historyTitle")}</h2>
								<p className='text-gray-600 text-center mb-6'>{t("historyDescription")}</p>
							</div>
							<div className='flex justify-center mt-auto'>
								<button onClick={handleViewHistory} className='ssitizens-button'>
									{t("historyButton")}
								</button>
							</div>
						</div>

						{/* Privacy Card */}
						<div className='bg-white p-6 rounded-lg shadow-sm h-80 flex flex-col justify-between'>
							<div className='flex flex-col items-center'>
								<div className='mb-4'>
									<ShieldCheck size={28} className='text-ssitizens-darkgray' />
								</div>
								<h2 className='text-2xl font-bold mb-2 text-center'>{t("privacyTitle")}</h2>
								<p className='text-gray-600 text-center mb-6'>{t("privacyDescription")}</p>
							</div>
							<div className='flex justify-center mt-auto'>
								<button onClick={handleViewPrivacyPolicy} className='ssitizens-button'>
									{t("privacyButton")}
								</button>
							</div>
						</div>
					</div>
				</div>
				{activeModal === "citizenPrivacy" && (
					<PrivacyPolicyModal onAccept={() => handlePrivacyAccept(userData)} onReject={handlePrivacyReject} />
				)}
			</main>
		</div>
	);
};
