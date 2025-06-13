import React, { useState } from "react";
import { Building, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/useToast";
import RecoverPasswordModal from "./RecoverPasswordModal";
import { useAuthAdmin } from "@/services";
import { useAuthStore } from "@/store";
import { AuthTokens } from "@/store/AuthStore/useAuthStore.type";
import { useTranslation } from "react-i18next";

interface AdminModalProps {
  onClose: () => void;
}

const AdminModal: React.FC<AdminModalProps> = ({ onClose }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [recoveringPassword, setRecoveringPassword] = useState(false);
  const { setTokens } = useAuthStore();

  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUserType } = useAuthStore();
  const { mutate } = useAuthAdmin();
  const { t: tCommon } = useTranslation("translation", { keyPrefix: "common" });
  const { t: tLogin } = useTranslation("translation", { keyPrefix: "login" });
  const { t: toastLogin } = useTranslation("translation", { keyPrefix: "toastLogin" });



  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast({
        title: toastLogin("emptyFields.title"),
        description: toastLogin("emptyFields.description"),
        variant: "destructive",
      });
      return;
    }

    mutate(
      { username, password },
      {
        onSuccess: (data: AuthTokens) => {
          setTokens(data);
          setUserType("admin");
          toast({
            title: toastLogin("success.title"),
            description: toastLogin("success.description"),
            variant: "success",
          });
          navigate("/admin-dashboard");
        },
        onError: () => {
          toast({
            title: toastLogin("error.title"),
            description: toastLogin("error.description"),
            variant: "destructive",
          });
        },
      }
    );
  };

  if (recoveringPassword) {
    return (
      <RecoverPasswordModal onClose={() => setRecoveringPassword(false)} />
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <Building size={28} className="text-ssitizens-darkgray mr-2" />
            <h2 className="text-2xl font-bold"> {tLogin("admin.titleAdmin")}</h2>
          </div>

          <p className="text-center text-gray-600 mb-6">
            {tLogin("admin.modalSubtitle")}
          </p>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                 {tLogin("admin.modalUsername")}
              </label>
              <input
                id="username"
                type="text"
                className="ssitizens-input"
                placeholder={tLogin("admin.modalUsernamePlaceholder")}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                 {tLogin("admin.modalPassword")}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="ssitizens-input pr-10"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <button
                type="button"
                onClick={() => setRecoveringPassword(true)}
                className="text-sm text-gray-600 hover:text-ssitizens-red"
              >
                 {tLogin("admin.modalForgottenPassword")}
              </button>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded bg-white hover:bg-gray-50"
                onClick={onClose}
              >
                {tCommon("back")}
              </button>
              <button type="submit" className="ssitizens-button">
                {tLogin("admin.buttonLoginAdmin")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminModal;
