import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import all translation files
const resources = {
  en: {
    welcome: require("@/languages/eng/welcome.json"),
    home: require("@/languages/eng/home.json"),
    card: require("@/languages/eng/card.json"),
    categorydetail: require("@/languages/eng/categorydetail.json"),
    category: require("@/languages/eng/category.json"),
    tabs: require("@/languages/eng/tabs.json"),
    shop: require("@/languages/eng/shop.json"),
    cartscreen: require("@/languages/eng/cartscreen.json"),
    checkout: require("@/languages/eng/checkout.json"),
    directpayment: require("@/languages/eng/directpayment.json"),
  },
  amh: {
    welcome: require("@/languages/amh/welcome.json"),
    home: require("@/languages/amh/home.json"),
    card: require("@/languages/amh/card.json"),
    categorydetail: require("@/languages/amh/categorydetail.json"),
    category: require("@/languages/amh/category.json"),
    tabs: require("@/languages/amh/tabs.json"),
    shop: require("@/languages/amh/shop.json"),
    cartscreen: require("@/languages/amh/cartscreen.json"),
    checkout: require("@/languages/amh/checkout.json"),
    directpayment: require("@/languages/amh/directpayment.json"),
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
