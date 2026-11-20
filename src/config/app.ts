
export const DEFAULT_CURRENCY = 'EUR' as const

export const DEFAULT_LANGUAGE = 'en' as const

export const SUPPORTED_LANGUAGES = ['en', 'nl'] as const

export type AppLanguage =
    (typeof SUPPORTED_LANGUAGES)[number]
