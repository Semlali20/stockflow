import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '@/locales/en.json';
import fr from '@/locales/fr.json';
import ar from '@/locales/ar.json';

type SupportedLang = 'en' | 'fr' | 'ar';

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function detectLanguage(): SupportedLang {
  const prefs = safeParse<{ languageRegion?: { language?: string } }>(
    localStorage.getItem('user_preferences'),
  );
  const lrLang = prefs?.languageRegion?.language;
  if (lrLang === 'fr' || lrLang === 'ar' || lrLang === 'en') return lrLang;

  const general = safeParse<{ language?: string }>(localStorage.getItem('app_general_settings'));
  const gsLang = general?.language;
  if (gsLang === 'fr' || gsLang === 'ar' || gsLang === 'en') return gsLang;

  const browser = (navigator.language || 'en').slice(0, 2);
  if (browser === 'fr' || browser === 'ar' || browser === 'en') return browser;
  return 'en';
}

function applyDocumentDirection(lang: SupportedLang) {
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', lang);
}

const initialLang = detectLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      ar: { translation: ar },
    },
    lng: initialLang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    returnEmptyString: false,
  });

applyDocumentDirection(initialLang);
i18n.on('languageChanged', (lng) => {
  const lang = (lng === 'fr' || lng === 'ar' || lng === 'en') ? lng : 'en';
  applyDocumentDirection(lang);
});

export default i18n;

