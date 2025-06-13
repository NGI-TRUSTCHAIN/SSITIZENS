import React, { useState, forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { IDownloadReportModalProps } from "@/interfaces";

export const DownloadReportModal: React.FC<IDownloadReportModalProps> = ({
  citizenId,
  citizenName,
  onCancel,
  onConfirm,
  isLoading,
}) => {
  const { t } = useTranslation("translation", {
    keyPrefix: "downloadReportModal",
  });

  const [dates, setDates] = useState<[Date | null, Date | null]>([null, null]);
  const [error, setError] = useState("");
  const [startDate, endDate] = dates;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setError(t("errorSelectRange"));
      return;
    }
    onConfirm({ from: startDate, to: endDate }, citizenId);
  };

  const CustomInput = forwardRef<HTMLInputElement, any>(
    ({ value, onClick, onClear }, ref) => {
      const showClear = !!value;

      return (
        <div className="relative w-full">
          <input
            ref={ref}
            className="w-full bg-transparent border-none py-3 pl-4 pr-10 text-sm placeholder-gray-400 focus:outline-none"
            onClick={onClick}
            value={value}
            readOnly
            placeholder={t("placeholder")}
          />
          {showClear ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-ssitizens-red px-[6px] py-0 rounded-[50px] text-white"
            >
              ×
            </button>
          ) : (
            <Calendar
              size={18}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          )}
        </div>
      );
    }
  );
  CustomInput.displayName = "CustomInput";

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">{t("title")}</h2>
        <p className="text-gray-700 mb-6">
          {t("description", { name: citizenName })}
        </p>

        <form onSubmit={handleSubmit}>
          <fieldset className="w-full border border-gray-300 rounded-xl focus-within:border-ssitizens-red transition">
            <legend className="mx-2 px-1 text-xs text-gray-600">
              {t("legend")}
            </legend>
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => {
                setDates(update);
                setError("");
              }}
              customInput={
                <CustomInput
                  onClear={() => {
                    setDates([null, null]);
                  }}
                />
              }
              dateFormat="dd/MM/yyyy"
              monthsShown={2}
              className="w-full"
              wrapperClassName="w-full"
              calendarClassName="custom-calendar"
            />
          </fieldset>

          {error && <p className="text-ssitizens-red text-sm mt-2">{error}</p>}

          <div className="flex justify-end items-center mt-6 space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              {t("buttonCancel")}
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-ssitizens-red text-white hover:bg-red-700 transition"
            >
              {isLoading ? t('waitDownload') : t("buttonDownload")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
