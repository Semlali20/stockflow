import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

type LanguageCode = 'en' | 'fr' | 'ar';

const FlagIcon = ({ code }: { code: LanguageCode }) => {
  if (code === 'fr') {
    return (
      <svg viewBox="0 0 3 2" className="w-5 h-3.5 rounded-sm overflow-hidden shrink-0" aria-hidden="true">
        <rect width="1" height="2" x="0" y="0" fill="#0055A4" />
        <rect width="1" height="2" x="1" y="0" fill="#FFFFFF" />
        <rect width="1" height="2" x="2" y="0" fill="#EF4135" />
      </svg>
    );
  }
  if (code === 'ar') {
    return (
      <svg viewBox="0 0 60 40" className="w-5 h-3.5 rounded-sm overflow-hidden shrink-0" aria-hidden="true">
        <rect width="60" height="40" fill="#C1272D" />
        <g transform="translate(30 20)" fill="none" stroke="#006233" strokeWidth="2.2" strokeLinejoin="round">
          <path d="M0,-12 L3.5,-3.5 L12,-3.5 L5,1.5 L8.5,10 L0,5 L-8.5,10 L-5,1.5 L-12,-3.5 L-3.5,-3.5 Z" />
        </g>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 60 30" className="w-5 h-3.5 rounded-sm overflow-hidden shrink-0" aria-hidden="true">
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFF" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="3" />
      <path d="M30,0 V30 M0,15 H60" stroke="#FFF" strokeWidth="10" />
      <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  );
};

export const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  
  const options: { value: LanguageCode; label: string }[] = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' },
    { value: 'ar', label: 'العربية' },
  ];

  const currentLanguage = (i18n.language?.split('-')[0] || 'en') as LanguageCode;

  const handleLanguageChange = (code: LanguageCode) => {
    i18n.changeLanguage(code);
    setOpen(false);
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = code;
  };

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 shadow-xl hover:border-primary-500 dark:hover:border-primary-500 hover:scale-110 transition-all duration-300 z-50 relative ${open ? 'border-primary-500 ring-4 ring-primary-500/10' : ''}`}
        aria-label="Select Language"
      >
        <Globe className={`w-6 h-6 transition-colors duration-300 ${open ? 'text-primary-500' : 'text-neutral-600 dark:text-neutral-300'}`} />
      </button>

      {open && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setOpen(false)} 
          />
          <div className="absolute bottom-full right-0 mb-4 w-48 bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300 origin-bottom-right">
            <div className="p-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleLanguageChange(option.value)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-all group/opt ${
                    currentLanguage === option.value 
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-bold' 
                      : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <div className={`transition-transform duration-300 group-hover/opt:scale-110 ${currentLanguage === option.value ? 'scale-110' : ''}`}>
                    <FlagIcon code={option.value} />
                  </div>
                  <span className="flex-1">{option.label}</span>
                  {currentLanguage === option.value && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shadow-sm shadow-primary-500/50" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
