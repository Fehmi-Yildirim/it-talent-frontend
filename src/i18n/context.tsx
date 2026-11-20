import { useMemo, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { I18nContext } from './I18nContext'
import {
    defaultLanguage,
    t as translate,
    type Language,
    type TranslationKey,
} from './index'
import { getLanguageFromPath, getLocalizedPath } from './routing'

type I18nProviderProps = {
    children: ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
    const value = useMemo(
        () => ({
            language: defaultLanguage,
            setLanguage: (_language: Language) => undefined,
            t: (key: string) =>
                translate(defaultLanguage, key as TranslationKey),
        }),
        [],
    )

    return (
        <I18nContext.Provider value={value}>
            {children}
        </I18nContext.Provider>
    )
}

export function RouteI18nProvider({ children }: I18nProviderProps) {
    const location = useLocation()
    const navigate = useNavigate()
    const language = getLanguageFromPath(location.pathname)

    const value = useMemo(
        () => ({
            language,
            setLanguage: (nextLanguage: Language) => {
                navigate(
                    getLocalizedPath(location.pathname, nextLanguage),
                )
            },
            t: (key: string) =>
                translate(language, key as TranslationKey),
        }),
        [language, location.pathname, navigate],
    )

    return (
        <I18nContext.Provider value={value}>
            {children}
        </I18nContext.Provider>
    )
}
