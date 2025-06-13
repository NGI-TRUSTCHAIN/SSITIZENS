import { ReactElement } from "react";

export interface AppRoute {
    path?: string;
    element: ReactElement;
    children?: AppRoute[];
  }

  export enum RoutePaths {
    Index = "/",
    AdminDashboard = "/admin-dashboard",
    Citizens = "/citizens",
    Commerce = "/commerce",
    CitizenDashboard = "/citizen-dashboard",
    CommerceDashboard = "/commerce-dashboard",
    CommercePrivacyPolicy = "/commerce-privacy-policy",
    CitizenPrivacyPolicy = "/citizen-privacy-policy",
    TransactionHistory = "/transaction-history",
    TransactionsDetail = "/transactions/:id",
    AdminTransactionHistory = "/admin-transaction-history",
    AccountDeactivation = "/account-deactivation",
    UserManual = "/user-manual",
    Notifications = "/notifications",
    Settings = "/settings",
    NotFound = "*",
  }