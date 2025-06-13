export type AuthTokens = {
  access: string
  refresh: string
  username: string
  email: string
  user_id: number
}

export type UserType = "admin" | "citizen" | "commerce";

export type AuthState = {
  isAppInitialized: boolean
  setIsAppInitialized: (isAppInitialized: boolean) => void
  isAuthenticated: boolean
  setIsAuthenticated: (isAuthenticated: boolean) => void
  tokens: AuthTokens | null
  setTokens: (tokens: AuthTokens) => void
  clearSession: () => void
	userType: UserType | null;
	setUserType: (type: UserType) => void;
};
