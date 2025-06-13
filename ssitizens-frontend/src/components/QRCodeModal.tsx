import React, { useId, useRef } from 'react'
import { useAuthCitizenQR, useAuthCommerceQR } from '@/services/index'
import { useTranslation } from 'react-i18next'
import { useSseListener } from '@/hooks/useSseListener'
import { v4 as uuidv4 } from 'uuid'

interface QRCodeModalProps {
  onClose: () => void
  type?: 'citizen' | 'commerce'
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  onClose,
  type = 'citizen',
}) => {
  const sessionIdRef = useRef(uuidv4())
  const sessionId = sessionIdRef.current
  useSseListener(sessionId, type)

  const { t } = useTranslation()

  const authHook = type === 'citizen' ? useAuthCitizenQR : useAuthCommerceQR

  const {
    data: qrData,
    isLoading: qrLoading,
    isError: qrError,
  } = authHook({ sessionID: sessionId })

  const title = type === 'citizen' ? t('login.ssitizens.titleSsitizens') : t('login.commerce.titleCommerce')

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          <p className="text-center text-gray-600 mb-6">{t('qrCodeModal.title')}</p>
          <div className="mb-6 w-64 h-64 flex items-center justify-center bg-white p-4 rounded-lg shadow">
            {qrLoading ? (
              <p>{t('qrCodeModal.loadingQR')}</p>
            ) : qrError ? (
              <p className="text-red-500">{t('qrCodeModal.errorQR')}</p>
            ) : qrData ? (
              <img
                src={qrData.qr}
                alt="Código QR"
                className="w-full h-full object-contain"
              />
            ) : null}
          </div>
          <button
            className="text-gray-600 border border-gray-300 rounded-full px-8 py-2 hover:bg-gray-100 transition-colors"
            onClick={onClose}
          >
            {t('qrCodeModal.buttonBack')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default QRCodeModal
