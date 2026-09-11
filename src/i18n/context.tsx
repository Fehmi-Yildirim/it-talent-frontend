import { useMemo, useState, type ReactNode } from 'react'
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

export function I18nProvider({ children }: I18nProviderProps) {
    const [language, setLanguage] = useState<Language>(defaultLanguage)

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