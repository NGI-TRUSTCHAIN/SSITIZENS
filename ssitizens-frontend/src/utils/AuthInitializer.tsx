import { useAuthStore } from "@/store";
import { useEffect } from "react";

export const AuthInitializer = () => {
  const { setTokens, setIsAppInitialized } = useAuthStore();

  useEffect(() => {
    const savedTokens = localStorage.getItem("authTokens");
    if (savedTokens) {
      const parsed = JSON.parse(savedTokens);
      setTokens(parsed);
    }
    setIsAppInitialized(true);
  }, []);

  return null;
};
