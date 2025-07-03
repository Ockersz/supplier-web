import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import namespaces for English
import enApp from "./locales/en/app.json";
import enLogin from "./locales/en/login.json";

// Import namespaces for Sinhala
import siApp from "./locales/si/app.json";
import siLogin from './locales/si/login.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: true,
    ns: ["app", 'login'], // declare all namespaces
    defaultNS: "app",
    resources: {
      en: {
        app: enApp,
        login: enLogin,
      },
      si: {
        app: siApp,
        login: siLogin,
      },
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
