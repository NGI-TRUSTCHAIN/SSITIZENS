import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Ban } from "lucide-react";
import { toast } from "@/hooks/useToast";
import AccountDeactivationModal from "@/components/AccountDeactivationModal";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/AuthStore/useAuthStore"

const AccountDeactivation = () => {
	const navigate = useNavigate();
	const [showConfirmationModal, setShowConfirmationModal] = useState(false);
	const { t } = useTranslation();
	const {userType} = useAuthStore()

	const handleInitiateDeactivation = () => {
		setShowConfirmationModal(true);
	};

	const handleConfirmDeactivation = () => {
		toast({
			title: t("accountDeactivation.toast.title"),
			description: t("accountDeactivation.toast.description"),
			variant: "success",
		});

		setShowConfirmationModal(false);
		navigate("/");
	};

	return (
		<div className='flex min-h-screen'>

			<main className='flex-1 p-8 bg-gray-50'>
				<div className='max-w-3xl mx-auto'>
					<div className='bg-gray-100 p-12 rounded-lg mb-6 flex items-center justify-center'>
						<Ban size={48} className='text-ssitizens-red' />
						<h1 className='text-4xl font-bold ml-4'>{t("accountDeactivation.title")}</h1>
					</div>

					<h2 className='text-2xl font-bold mb-4'>{t("accountDeactivation.heading")}</h2>

					<p className='text-gray-700 mb-6'>{t("accountDeactivation.description")}</p>

					<button
						onClick={handleInitiateDeactivation}
						className='bg-ssitizens-red text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors'
					>
						{t("accountDeactivation.submitButton")}
					</button>
				</div>
			</main>

			{showConfirmationModal && (
				<AccountDeactivationModal
					onClose={() => setShowConfirmationModal(false)}
					onConfirm={handleConfirmDeactivation}
				/>
			)}
		</div>
	);
};

export default AccountDeactivation;
