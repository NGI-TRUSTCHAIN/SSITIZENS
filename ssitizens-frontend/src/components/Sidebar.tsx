import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Users, Store, History, Bell, Settings, LogOut, Menu } from "lucide-react";
import { toast } from "@/hooks/useToast";
import { useAuthStore } from "@/store";
import { RoutePaths } from "@/interfaces";
import { useTranslation } from "react-i18next";

const Sidebar: React.FC = () => {
	const [visible, setVisible] = useState(false);
	const location = useLocation();
	const navigate = useNavigate();
	const { clearSession } = useAuthStore();
	const username = useAuthStore()?.tokens?.username;
	const { t } = useTranslation("translation", { keyPrefix: "common" });

	const handleLogout = () => {
		clearSession();
		toast({
      description: t("logoutSuccess"),
		});
		navigate("/");
	};

	return (
		<>
			<div
				className='fixed top-1/2 left-0 z-50 -translate-y-1/2 w-4 h-16 bg-ssitizens-red rounded-r-lg flex items-center justify-center cursor-pointer'
				onMouseEnter={() => setVisible(true)}
				title='Abrir menú'
			>
				<Menu className='text-white' size={20} />
			</div>
			<div className='fixed top-0 left-0 h-full w-3 z-40' onMouseEnter={() => setVisible(true)} />
			<aside
				className={`fixed top-0 left-0 h-full w-[320px] bg-white border-r border-gray-200 z-50 transition-transform duration-300 ${
					visible ? "translate-x-0" : "-translate-x-full"
				}`}
				onMouseLeave={() => setVisible(false)}
			>
				<div className='p-6 border-b border-gray-200'>
					<h1 className='text-3xl font-bold text-ssitizens-darkgray'>SSItizens</h1>
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
						<p className='font-medium text-lg'>{username}</p>
					</div>
				</div>

				<div className='px-6 py-4 text-base text-gray-500'>{t("dashboard")}</div>

				<nav className='px-4 py-1 flex-1'>
					<Link
						to={RoutePaths.AdminDashboard}
						className={`flex items-center px-4 py-3 text-base rounded-md ${
							location.pathname === "/admin-dashboard"
								? "bg-gray-100 text-ssitizens-darkgray"
								: "text-gray-600 hover:bg-gray-100"
						}`}
					>
						<Home size={22} className='mr-3' />
						{t("home")}
					</Link>
					<Link
						to='/citizens'
						className={`flex items-center px-4 py-3 text-base rounded-md ${
							location.pathname === "/citizens"
								? "bg-gray-100 text-ssitizens-darkgray"
								: "text-gray-600 hover:bg-gray-100"
						}`}
					>
						<Users size={22} className='mr-3' />
						{t("citizens")}
					</Link>
					<Link
						to={RoutePaths.Commerce}
						className={`flex items-center px-4 py-3 text-base rounded-md ${
							location.pathname === "/commerce"
								? "bg-gray-100 text-ssitizens-darkgray"
								: "text-gray-600 hover:bg-gray-100"
						}`}
					>
						<Store size={22} className='mr-3' />
						{t("commerce")}
					</Link>
					<Link
						to='/admin-transaction-history'
						className={`flex items-center px-4 py-3 text-base rounded-md ${
							location.pathname === "/admin-transaction-history"
								? "bg-gray-100 text-ssitizens-darkgray"
								: "text-gray-600 hover:bg-gray-100"
						}`}
					>
						<History size={22} className='mr-3' />
						{t("historic")}
					</Link>
					{/* <Link
          to={RoutePaths.Notifications}
          className={`flex items-center px-4 py-3 text-base rounded-md ${
            location.pathname === '/notifications'
              ? 'bg-gray-100 text-ssitizens-darkgray'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Bell size={22} className="mr-3" />
          {t('notifications')}
          <span className="ml-auto bg-ssitizens-red text-white text-xs font-bold px-2 py-1 rounded-full">2</span>
        </Link> */}
				</nav>
				<div className='px-4 py-2 text-sm text-gray-500'>{t("settings")}</div>
				<nav className='px-4 mb-8'>
					<Link
						to={RoutePaths.Settings}
						className='flex items-center px-4 py-3 text-base text-gray-600 hover:bg-gray-100 rounded-md'
					>
						<Settings size={22} className='mr-3' />
						{t("settings")}
					</Link>
					<button
						onClick={handleLogout}
						className='flex items-center px-4 py-3 text-base text-ssitizens-red hover:bg-gray-100 rounded-md w-full text-left'
					>
						<LogOut size={22} className='mr-3' />
						{t("closeSession")}
					</button>
				</nav>
			</aside>
		</>
	);
};

export default Sidebar;
