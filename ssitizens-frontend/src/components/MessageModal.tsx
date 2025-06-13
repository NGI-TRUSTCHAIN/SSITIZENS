import React from "react";
import { useTranslation } from "react-i18next"

interface IMessageModalProps {
  title: string;
  message: string;
  onClose: () => void;
}

const MessageModal: React.FC<IMessageModalProps> = ({
  title,
  message,
  onClose,
}) => {
  const {t} = useTranslation()
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-center">{title}</h2>
          <div className="mb-6 text-center">
            <p className="mb-4 whitespace-pre-line">{message}</p>
          </div>
          <div className="flex justify-center">
            <button
              type="button"
              className="ssitizens-button"
              onClick={onClose}
            >
              {t("common.close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;
