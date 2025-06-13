import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguageSelector } from "@/hooks/useLanguageSelector";
import { useTranslation } from "react-i18next"

export const LanguageSelector = () => {
  const { language, handleLanguageChange, languageLabels } =
    useLanguageSelector();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const {t} = useTranslation()

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  return (
    <div className="absolute top-0 right-[50px] mb-6 flex justify-end">
      <div
        ref={wrapperRef}
        className="flex items-center bg-gray-100 rounded-bl-[15px] rounded-br-[15px] px-4 py-2 relative"
      >
        <span className="mr-3 font-medium text-black">{t('settings.title')}</span>

        <button
          onClick={() => setOpen((o) => !o)}
          className="
            relative
            flex items-center
            border-2 border-ssitizens-red
            bg-transparent
            rounded-full
            text-ssitizens-red
            pl-10 pr-5 py-2
            focus:outline-none
          "
        >
          <ChevronDown
            size={16}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ssitizens-red pointer-events-none"
          />
          {languageLabels[language]}
        </button>

        {open && (
          <ul
            className="
      absolute
      top-full left-0
      mt-1 w-40
      bg-gray-100
      border-2 
      rounded-b-[15px]
      shadow-lg
      overflow-hidden
      z-20
      left-[50px]
    "
          >
            {Object.entries(languageLabels).map(([code, label]) => (
              <li key={code}>
                <button
                  onClick={() => {
                    handleLanguageChange(code);
                    setOpen(false);
                  }}
                  className={`
            w-full text-left px-4 py-2 hover:bg-gray-200
            ${code === language ? "text-ssitizens-red" : "text-black"}
          `}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
