import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, History, Settings, LogOut, Menu, Ban } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/useToast";
import { useAuthStore } from "@/store";
import { useGetUsers } from "@/services/useCitizensAndCommerce/useCitizensAndCommerce";
import { EType } from "@/services/useCitizensAndCommerce/useCitizensAndCommerce.types";
import { RoutePaths } from "@/interfaces";

const CitizenSidebar = () => {
	const [visible, setVisible] = useState(false);
	const location = useLocation();
	const navigate = useNavigate();
	const { clearSession } = useAuthStore();
	const { t } = useTranslation();
	const { toast } = useToast();

	const userData = useGetUsers({
		type: EType.beneficiary,
		email: "",
		address: "",
	}).data?.results[0];

	const username = userData?.email;

	const handleLogout = () => {
		clearSession();
		toast({
			title: t("citizenSidebar.logoutSuccess.title"),
			description: t("citizenSidebar.logoutSuccess.description"),
		});
		navigate("/");
	};

	return (
		<>
			{/* Indicador visual */}
			<div
				className='fixed top-1/2 left-0 z-50 -translate-y-1/2 w-4 h-16 bg-ssitizens-red rounded-r-lg flex items-center justify-center cursor-pointer'
				onMouseEnter={() => setVisible(true)}
				title='Abrir menú'
			>
				<Menu className='text-white' size={20} />
			</div>
			{/* Área sensible al hover */}
			<div className='fixed top-0 left-0 h-full w-3 z-40' onMouseEnter={() => setVisible(true)} />
			{/* Sidebar */}
			<aside
				className={`fixed top-0 left-0 h-full w-[260px] bg-white border-r border-gray-200 z-50 transition-transform duration-300 ${
					visible ? "translate-x-0" : "-translate-x-full"
				}`}
				onMouseLeave={() => setVisible(false)}
			>
				<div className='p-6 border-b border-gray-200'>
					<h1 className='text-2xl font-bold text-gray-800'>{t("citizenSidebar.title")}</h1>
				</div>
				<div className='flex items-center p-4 border-b border-gray-200'>
					<div className='w-10 h-10 rounded-full overflow-hidden mr-3'>
						<img
							src='https://imgs.search.brave.com/Wx3BQ4xxcLzyn7vGrTIJ2n2Ttd_kE8JvGVAVQoETndg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWdz/LnNlYXJjaC5icmF2/ZS5jb20vRXBlZ2ZP/eUNsTFZ5RzcwRHBu/Q1JWUlZ2WHFCdjA2/c2lQcHNzMFAtTXlC/US9yczpmaXQ6NTAw/OjA6MDowL2c6Y2Uv/YUhSMGNITTZMeTkw/TXk1bS9kR05rYmk1/dVpYUXZhbkJuL0x6/QTFMelkwTHpVM0x6/QXcvTHpNMk1GOUdY/elUyTkRVMy9NREEy/TTE4NGJXOXhSVEp5/L1FVYzVhVEU1ZWts/blMzVXcvUjBodFNE/VkNSRTVRTUdWai9k/UzVxY0dj'
							alt='Profile'
							className='w-full h-full object-cover'
						/>
					</div>
					<div>
						<p className='font-medium'>{username}</p>
					</div>
				</div>
				<div className='px-4 py-2 text-sm text-gray-500'>{t("citizenSidebar.dashboard")}</div>
				<nav className='px-2 py-1 flex-1'>
					<Link
						to='/citizen-dashboard'
						className={`flex items-center px-4 py-2 text-sm rounded-md ${
							location.pathname === "/citizen-dashboard"
								? "bg-gray-100 text-gray-900"
								: "text-gray-600 hover:bg-gray-100"
						}`}
					>
						<Home size={18} className='mr-3' />
						{t("common.home")}
					</Link>
					<Link
						to='/transaction-history'
						className={`flex items-center px-4 py-2 text-sm rounded-md ${
							location.pathname === "/transaction-history"
								? "bg-gray-100 text-gray-900"
								: "text-gray-600 hover:bg-gray-100"
						}`}
					>
						<History size={18} className='mr-3' />
						{t("citizenSidebar.history")}
					</Link>
				</nav>
				<div className='px-4 py-2 text-sm text-gray-500'>{t("citizenSidebar.settings")}</div>
				<nav className='px-2 mb-6'>
					<Link
						to={RoutePaths.Settings}
						className={`flex items-center px-4 py-2 text-sm rounded-md ${
							location.pathname === "/settings"
								? "bg-gray-100 text-gray-900"
								: "text-gray-600 hover:bg-gray-100"
						}`}
					>
						<Settings size={18} className='mr-3' />
						{t("common.settings")}
					</Link>
					<Link
						to='/account-deactivation'
						className={`flex items-center px-4 py-2 text-sm rounded-md ${
							location.pathname === "/account-deactivation"
								? "bg-gray-100 text-gray-900"
								: "text-gray-600 hover:bg-gray-100"
						}`}
					>
						<Ban size={18} className='mr-3' />
						{t("citizenSidebar.deactivate")}
					</Link>
					<button
						onClick={handleLogout}
						className='flex items-center px-4 py-2 text-sm text-ssitizens-red hover:bg-gray-100 rounded-md w-full text-left'
					>
						<LogOut size={18} className='mr-3' />
						{t("citizenSidebar.logout")}
					</button>
				</nav>
			</aside>
		</>
	);
};

export default CitizenSidebar;
