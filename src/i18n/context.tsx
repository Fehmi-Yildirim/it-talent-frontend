import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
    defaultLanguage,
    t as translate,
    type Language,
    type TranslationKey,
} from './index';

type I18nContextValue = {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: TranslationKey) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const STORAGE_KEY = 'it-talent-language';

function getInitialLanguage(): Language {
    const storedLanguage = localStorage.getItem(STORAGE_KEY);

    if (storedLanguage === 'en' || storedLanguage === 'nl') {
        return storedLanguage;
    }

    return defaultLanguage;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>(getInitialLanguage);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, language);
    }, [language]);

    const value = useMemo(
        () => ({
            language,
            setLanguage,
            t: (key: TranslationKey) => translate(language, key),
        }),
        [language],
    );

    return (
        <I18nContext.Provider value={value}>
            {children}
        </I18nContext.Provider>
    );
}

export function useTranslation(): I18nContextValue {
    const context = useContext(I18nContext);

    if (!context) {
        throw new Error(
            'useTranslation must be used inside an I18nProvider',
        );
    }

    return context;
}