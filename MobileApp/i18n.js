import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import all translation files
const resources = {
  en: {
    welcome: require("@/languages/eng/welcome.json"),
    home: require("@/languages/eng/home.json"),
    common: require("@/languages/eng/common.json"),
  },
  amh: {
    welcome: require("@/languages/amh/welcome.json"),
    home: require("@/languages/amh/home.json"),
    common: require("@/languages/amh/common.json"),
  },
};

const fallback = { languageTag: "en", isRTL: false };
let languageTag = fallback.languageTag;
let RNLocalize;

try {
  // Dynamically require RNLocalize so that if it isn’t linked, we catch the error.
  RNLocalize = require("react-native-localize");
  const bestLanguage = RNLocalize.findBestAvailableLanguage(Object.keys(resources));
  languageTag = bestLanguage ? bestLanguage.languageTag : fallback.languageTag;
} catch (error) {
  console.warn("RNLocalize not available, falling back to default language", error);
  languageTag = fallback.languageTag;
}

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: "v3", // For React Native compatibility
    resources,
    lng: languageTag,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

export default i18n;
