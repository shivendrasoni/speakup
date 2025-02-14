
import { createContext, useContext, useState } from "react";
import { LanguageCode } from "@/types/complaints";
import { TRANSLATIONS } from "@/i18n/translations";

type LanguageContextType = {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<LanguageCode>("english");

  const t = (key: string) => {
    const keys = key.split('.');
    let translation: any = TRANSLATIONS[language];
    
    for (const k of keys) {
      translation = translation?.[k];
    }
    
    return translation || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
