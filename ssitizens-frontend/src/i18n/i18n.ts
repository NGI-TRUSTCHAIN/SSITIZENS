import * as i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import translationEs from './es.json'
import translationEn from './en.json'

const resources = {
  es: {
    translation: translationEs,
  },
  en: {
    translation: translationEn,
  }
}

i18n
  .use(new LanguageDetector())
  .use(initReactI18next)
  .init({
    fallbackLng: 'es',
    ns: ['translation'],
    defaultNS: 'translation',
    debug: false,
    resources,
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
