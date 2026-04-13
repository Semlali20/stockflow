type LocalizationPrefs = {
  language?: string;
  timezone?: string;
  timeFormat?: '12h' | '24h';
  currency?: string;
  // supports both SettingsContext ("comma"/"dot") and profile prefs ("1,000.00"/etc)
  numberFormat?: string;
};

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function getLocalizationPrefs(): LocalizationPrefs {
  // Prefer profile preferences (synced to backend) if present
  const userPrefs = safeJsonParse<{ languageRegion?: LocalizationPrefs }>(
    localStorage.getItem('user_preferences'),
  );
  const lr = userPrefs?.languageRegion;
  if (lr?.language || lr?.timezone || lr?.currency || lr?.timeFormat || lr?.numberFormat) {
    return lr;
  }

  // Fallback: general settings (Settings page)
  const general = safeJsonParse<LocalizationPrefs>(localStorage.getItem('app_general_settings'));
  return general ?? {};
}

function resolveLocale(language?: string, numberFormat?: string): string {
  // If the user chose a "dot" thousand separator style, favor a European locale
  const wantsDot =
    numberFormat === 'dot' ||
    numberFormat === '1.000,00' ||
    numberFormat === '1 000,00';

  switch (language) {
    case 'fr':
      return wantsDot ? 'fr-FR' : 'fr-FR';
    case 'de':
      return 'de-DE';
    case 'es':
      return wantsDot ? 'es-ES' : 'es-ES';
    case 'ar':
      return 'ar';
    case 'zh':
      return 'zh-CN';
    case 'ja':
      return 'ja-JP';
    case 'en':
    default:
      return wantsDot ? 'de-DE' : 'en-US';
  }
}

function hour12FromTimeFormat(timeFormat?: '12h' | '24h'): boolean | undefined {
  if (timeFormat === '12h') return true;
  if (timeFormat === '24h') return false;
  return undefined;
}

export const format = {
  number: (value: number, decimals: number = 0): string => {
    const prefs = getLocalizationPrefs();
    const locale = resolveLocale(prefs.language, prefs.numberFormat);
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  },

  currency: (value: number, currency?: string): string => {
    const prefs = getLocalizationPrefs();
    const locale = resolveLocale(prefs.language, prefs.numberFormat);
    const c = currency ?? prefs.currency ?? 'USD';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: c,
    }).format(value);
  },

  percentage: (value: number, decimals: number = 1): string => {
    return `${format.number(value, decimals)}%`;
  },

  date: (date: Date | string): string => {
    const prefs = getLocalizationPrefs();
    const locale = resolveLocale(prefs.language, prefs.numberFormat);
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: prefs.timezone,
    }).format(new Date(date));
  },

  dateTime: (date: Date | string): string => {
    const prefs = getLocalizationPrefs();
    const locale = resolveLocale(prefs.language, prefs.numberFormat);
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: hour12FromTimeFormat(prefs.timeFormat),
      timeZone: prefs.timezone,
    }).format(new Date(date));
  },

  relativeTime: (date: Date | string): string => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return format.date(date);
  },

  truncate: (text: string, length: number = 50): string => {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  },
};