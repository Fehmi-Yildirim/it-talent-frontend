
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { I18nContext } from './I18nContext'
import {
    defaultLanguage,
    t as translate,
    type Language,
    type TranslationKey,
} from './index'

type I18nProviderProps = {
    children: ReactNode
}

function getInitialLanguage(): Language {
    try {
        const savedLanguage = window.localStorage.getItem('it-talent-language')

        if (savedLanguage === 'en' || savedLanguage === 'nl') {
            return savedLanguage
        }
    } catch {
        // Fall back to the default language if localStorage is unavailable.
    }

    return defaultLanguage
}

export function I18nProvider({ children }: I18nProviderProps) {
    const [language, setLanguage] = useState<Language>(getInitialLanguage)

    useEffect(() => {
        try {
            window.localStorage.setItem('it-talent-language', language)
        } catch {
            // The language selection remains available for the current session.
        }
    }, [language])

    const value = useMemo(
        () => ({
            language,
            setLanguage,
            t: (key: string) => translate(language, key as TranslationKey),
        }),
        [language],
    )

    return (
        <I18nContext.Provider value={value}>
            {children}
        </I18nContext.Provider>
    )
}
