import { en } from './locales/en';
import { nl } from './locales/nl';

export const translations = {
    en,
    nl,
} as const;

export type Language = keyof typeof translations;

export const defaultLanguage: Language = 'en';

export type TranslationKey =
    | 'navigation.dashboard'
    | 'navigation.findJobs'
    | 'navigation.profile'
    | 'navigation.login'
    | 'navigation.register'
    | 'navigation.logout';

export function t(
    language: Language,
    key: TranslationKey,
): string {
    const [section, translationKey] = key.split('.');

    const languageTranslations = translations[language] as Record<
        string,
        Record<string, string>
    >;

    return (
        languageTranslations[section]?.[translationKey] ??
        translations.en[section as keyof typeof en]?.[
        translationKey as never
        ] ??
        key
    );
}