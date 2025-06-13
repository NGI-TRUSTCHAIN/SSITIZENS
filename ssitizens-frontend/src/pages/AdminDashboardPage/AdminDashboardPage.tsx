import { useState } from "react";
import { Coins, UserPlus, ShoppingBag } from "lucide-react";
import AddGasModal from "../../components/AddGasModal";
import AddFundsModal from "../../components/AddFundsModal";
import CitizenModal from "../../components/CitizenModal";
import CommerceModal from "../../components/CommerceModal";
import MessageModal from "../../components/MessageModal";
import { useCitizensPage } from "@/hooks/useCitizensPage";
import { useCommercePage } from "@/hooks/useCommercePage";
import { useTranslation } from "react-i18next";
import { useGetBalance } from "@/services/useBalance/useBalance";

export const AdminDashboardPage = () => {
	const { t } = useTranslation("translation", {
		keyPrefix: "citizensDashboard",
	});

	const [showAddGasModal, setShowAddGasModal] = useState(false);
	const [showAddFundsModal, setShowAddFundsModal] = useState(false);
	const { data } = useGetBalance();
	const {
		showMessageModal,
		handleCloseAddCitizenModal,
		closeMessageModal,
		modalTitle,
		modalMessage,
		handleAddCitizen,
		showAddCitizenModal,
	} = useCitizensPage();

	const {
		showMessageModal: showMessageModalCommerce,
		handleCloseAddCommerceModal,
		closeMessageModal: closeMessageModalCommerce,
		modalTitle: modalTitleCommerce,
		modalMessage: modalMessageCommerce,
		handleAddCommerce,
		showAddCommerceModal,
	} = useCommercePage();

	// const handleAddGas = () => {
	//   setShowAddGasModal(true);
	// };

	const handleCloseAddGasModal = () => {
		setShowAddGasModal(false);
	};

	const handleAddFunds = () => {
		setShowAddFundsModal(true);
	};

	const handleCloseAddFundsModal = (amount?: number) => {
		setShowAddFundsModal(false);
	};

	return (
		<div className='flex min-h-screen bg-gray-100'>
			<main className='flex-1 px-8 py-8 md:px-16'>
				<div className='flex justify-between items-center mb-6'>
					<div>
						<h1 className='text-4xl font-bold mb-2'>{t("welcomeTitle")}</h1>
						<p className='text-gray-600 text-lg'>{t("welcomeSubtitle")}</p>
					</div>
					{/* <div className="flex items-center">
            <div className="mr-4 text-right">
              <span className="block font-medium">  {data?.ethers ?? 0} Ethers</span>
            </div>
            <button className="ssitizens-button" onClick={handleAddGas}>
              {t("addGasButton")}
            </button>
          </div> */}
				</div>

				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8'>
					<div className='bg-white p-6 rounded-lg shadow-sm flex flex-col justify-between h-72'>
						<>
							<div className='mb-4'>
								<Coins size={24} className='text-ssitizens-darkgray' />
							</div>
							<h2 className='text-2xl font-bold mb-2'>
								{t("fundsTitle", {
									funds: data?.tokens?.toLocaleString() ?? "0",
								})}
							</h2>
							<p className='text-gray-600 mb-6'>{t("fundsDescription")}</p>
						</>
						<div className='flex justify-center mt-auto'>
							<button className='ssitizens-button' onClick={handleAddFunds}>
								{t("fundsButton")}
							</button>
						</div>
					</div>

					<div className='bg-white p-6 rounded-lg shadow-sm flex flex-col justify-between h-72'>
						<div>
							<div className='mb-4'>
								<UserPlus size={24} className='text-ssitizens-darkgray' />
							</div>
							<h2 className='text-2xl font-bold mb-2'>{t("addCitizenTitle")}</h2>
							<p className='text-gray-600 mb-6'>{t("addCitizenDescription")}</p>
						</div>
						<div className='flex justify-center mt-auto'>
							<button className='ssitizens-button' onClick={handleAddCitizen}>
								{t("addCitizenButton")}
							</button>
						</div>
					</div>

					<div className='bg-white p-6 rounded-lg shadow-sm flex flex-col justify-between h-72'>
						<div>
							<div className='mb-4'>
								<ShoppingBag size={24} className='text-ssitizens-darkgray' />
							</div>
							<h2 className='text-2xl font-bold mb-2'>{t("addCommerceTitle")}</h2>
							<p className='text-gray-600 mb-6'>{t("addCommerceDescription")}</p>
						</div>
						<div className='flex justify-center mt-auto'>
							<button className='ssitizens-button' onClick={handleAddCommerce}>
								{t("addCommerceButton")}
							</button>
						</div>
					</div>
				</div>
			</main>

			{showAddGasModal && <AddGasModal currentGas={Number(data.ethers)} onClose={handleCloseAddGasModal} />}
			{showAddFundsModal && (
				<AddFundsModal currentFunds={Number(data.tokens)} onClose={handleCloseAddFundsModal} />
			)}

			{showMessageModal && (
				<MessageModal title={modalTitle} message={modalMessage} onClose={closeMessageModal} />
			)}

			{showMessageModalCommerce && (
				<MessageModal
					title={modalTitleCommerce}
					message={modalMessageCommerce}
					onClose={closeMessageModalCommerce}
				/>
			)}

			{showAddCitizenModal && <CitizenModal onClose={handleCloseAddCitizenModal} />}

			{showAddCommerceModal && <CommerceModal onClose={handleCloseAddCommerceModal} />}
		</div>
	);
};
