import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enJSON from './locales/en/translation.json'
import esJSON from './locales/es/translation.json'
import vaJSON from './locales/va/translation.json'

i18n
  .use(LanguageDetector) // Detecta el idioma del navegador automáticamente
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enJSON },
      es: { translation: esJSON },
      va: { translation: vaJSON },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n
