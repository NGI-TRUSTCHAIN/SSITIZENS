import { lazy } from "react";
import { AppRoute, RoutePaths } from "@/interfaces/index";
import ProtectedLayout from "./protectedLayout";
import {
  IndexPage,
  SettingsPage,
  AdminDashboardPage,
  CitizenDashboardPage,
  CitizensPage,
  CommercePage,
  AdminTransactionHistoryPage,
  TransactionDetailPage,
  TransactionHistoryPage,
} from "@/pages";

const CommerceDashboard = lazy(() => import("../pages/CommerceDashboard"));
const CommercePrivacyPolicy = lazy(
  () => import("../pages/CommercePrivacyPolicy")
);
const CitizenPrivacyPolicy = lazy(
  () => import("../pages/CitizenPrivacyPolicy")
);
const AccountDeactivation = lazy(() => import("../pages/AccountDeactivation"));
const UserManual = lazy(() => import("../pages/UserManual"));
const Notifications = lazy(() => import("../pages/Notifications"));
const NotFound = lazy(() => import("../pages/NotFound"));

const routes: AppRoute[] = [
  { path: RoutePaths.Index, element: <IndexPage /> },
  {
    element: <ProtectedLayout />,
    children: [
      { path: RoutePaths.AdminDashboard, element: <AdminDashboardPage /> },
      { path: RoutePaths.Citizens, element: <CitizensPage /> },
      { path: RoutePaths.Commerce, element: <CommercePage /> },
      { path: RoutePaths.CitizenDashboard, element: <CitizenDashboardPage /> },
      { path: RoutePaths.CommerceDashboard, element: <CommerceDashboard /> },
      {
        path: RoutePaths.CommercePrivacyPolicy,
        element: <CommercePrivacyPolicy />,
      },
      {
        path: RoutePaths.CitizenPrivacyPolicy,
        element: <CitizenPrivacyPolicy />,
      },
      {
        path: RoutePaths.TransactionHistory,
        element: <TransactionHistoryPage />,
      },
      {
        path: RoutePaths.TransactionsDetail,
        element: <TransactionDetailPage />,
      },

      {
        path: RoutePaths.AdminTransactionHistory,
        element: <AdminTransactionHistoryPage />,
      },
      {
        path: RoutePaths.AccountDeactivation,
        element: <AccountDeactivation />,
      },
      { path: RoutePaths.UserManual, element: <UserManual /> },
      { path: RoutePaths.Notifications, element: <Notifications /> },
      { path: RoutePaths.Settings, element: <SettingsPage /> },
    ],
  },
  { path: "*", element: <NotFound /> },
];

export default routes;
