import React, { Suspense } from "react";
import { BrowserRouter, useRoutes, useLocation } from "react-router-dom";
import routes from "./routes";
import Sidebar from "@/components/Sidebar";
import CitizenSidebar from "@/components/CitizenSidebar";
import CommerceSidebar from "@/components/CommerceSidebar";
import Spinner from "@/components/Spinner";
import { useAuthStore } from "@/store";

const getSidebar = (userType?: string) => {
	if (userType === "admin") {
		return <Sidebar />;
	} else if (userType === "commerce") {
		return <CommerceSidebar />;
	} else if (userType === "citizen") {
		return <CitizenSidebar />;
	} else {
		return <Sidebar />;
	}
};

const AppRoutes = () => {
	const routing = useRoutes(routes);
	return <Suspense fallback={<Spinner />}>{routing}</Suspense>;
};

const AppWrapper = () => {
	const { userType } = useAuthStore();
	const location = useLocation();

	const hideSidebar = location.pathname === "/";

	return (
		<>
			{!hideSidebar && getSidebar(userType)}
			<AppRoutes />
		</>
	);
};

const AppWithRouter = () => (
	<BrowserRouter>
		<AppWrapper />
	</BrowserRouter>
);

export default AppWithRouter;
