import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Importamos tus archivos JSON
import esTranslation from './locales/es.json'
import enTranslation from './locales/en.json'
import vaTranslation from './locales/va.json' // Cambiado a va.json

i18n
  .use(LanguageDetector) // Esto ya no debería dar error si instalaste la librería
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: esTranslation },
      en: { translation: enTranslation },
      va: { translation: vaTranslation }, // Usamos 'va' como clave
    },
    fallbackLng: 'es', // Si no detecta el idioma, usa español
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
    },
  })

export default i18n
