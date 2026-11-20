import {
    DEFAULT_LANGUAGE,
    SUPPORTED_LANGUAGES,
    type AppLanguage,
} from '../config/app'

export type Language = AppLanguage

const localizedPaths: Record<
    string,
    Record<Language, string>
> = {
    '/about': {
        en: '/about-this-app',
        nl: '/over-deze-app',
    },
    '/about-this-app': {
        en: '/about-this-app',
        nl: '/over-deze-app',
    },
    '/over-deze-app': {
        en: '/about-this-app',
        nl: '/over-deze-app',
    },
    '/register': {
        en: '/register',
        nl: '/registreren',
    },
    '/registreren': {
        en: '/register',
        nl: '/registreren',
    },
}

export function getLanguageFromPath(pathname: string): Language {
    const firstSegment = pathname.split('/').filter(Boolean)[0]

    if (
        firstSegment &&
        SUPPORTED_LANGUAGES.includes(firstSegment as Language)
    ) {
        return firstSegment as Language
    }

    return DEFAULT_LANGUAGE
}

export function getPathWithoutLocale(pathname: string): string {
    const normalizedPath = pathname.startsWith('/')
        ? pathname
        : `/${pathname}`

    const firstSegment = normalizedPath.split('/').filter(Boolean)[0]

    if (
        firstSegment &&
        firstSegment !== DEFAULT_LANGUAGE &&
        SUPPORTED_LANGUAGES.includes(firstSegment as Language)
    ) {
        const pathWithoutLocale = normalizedPath.slice(
            firstSegment.length + 1,
        )

        return pathWithoutLocale || '/'
    }

    return normalizedPath
}

export function getLocalizedPath(
    pathname: string,
    language: Language,
): string {
    const pathWithoutLocale = getPathWithoutLocale(pathname)
    const localizedPath =
        localizedPaths[pathWithoutLocale]?.[language] ??
        pathWithoutLocale

    if (language === DEFAULT_LANGUAGE) {
        return localizedPath
    }

    if (localizedPath === '/') {
        return `/${language}/`
    }

    return `/${language}${localizedPath}`
}
