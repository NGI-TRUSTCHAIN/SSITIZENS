import { create } from "zustand";
import { jwtDecode } from "jwt-decode";
import { AuthState, UserType } from "./useAuthStore.type";

export const useAuthStore = create<AuthState>((set) => ({
	isAuthenticated: false,
	isAppInitialized: false,
	tokens: null,
	userType: (localStorage.getItem("userType") as UserType) || null,

	setIsAuthenticated: (isAuthenticated) => {
		set({ isAuthenticated });
	},

	setIsAppInitialized: (isAppInitialized) => {
		set({ isAppInitialized });
	},

	setUserType: (type: UserType) => {
		set({ userType: type });
		localStorage.setItem("userType", type);
	},

	setTokens: (tokens) => {
		set({ isAuthenticated: true, tokens });
		localStorage.setItem("authTokens", JSON.stringify(tokens));

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const decoded: any = jwtDecode(tokens.access);
		const exp = decoded.exp * 1000;
		const now = Date.now();
		const timeout = exp - now;

		if (timeout > 0) {
			setTimeout(() => {
				set({ isAuthenticated: false, tokens: null });
				localStorage.removeItem("authTokens");
				window.location.reload();
			}, timeout);
		}
	},

	clearSession: () => {
		set({ isAuthenticated: false, tokens: null, userType: null });
		localStorage.removeItem("authTokens");
		localStorage.removeItem("userType");
	},
}));
