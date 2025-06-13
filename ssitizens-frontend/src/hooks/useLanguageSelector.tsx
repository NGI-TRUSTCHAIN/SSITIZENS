import { useState } from "react";
import { useTranslation } from "react-i18next";

export const useLanguageSelector = () => {
  const { i18n, t } = useTranslation("translation", { keyPrefix: "languages" });

  const [language, setLanguage] = useState(i18n.language || "es");

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const languageLabels: Record<string, string> = {
    es: t("spanish.spanishLanguage"),
    en: t("english.englishLanguage"),
  };

  return {
    language,
    handleLanguageChange,
    languageLabels,
  };
};
