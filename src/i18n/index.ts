import { en } from './locales/en';
import { nl } from './locales/nl';

export const translations = {
    en,
    nl,
} as const;

export type Language = keyof typeof translations;

export const defaultLanguage: Language = 'en';

type PreviousDepth = [never, 0, 1, 2, 3, 4];

type TranslationKeys<
    T,
    Depth extends number = 4,
> = Depth extends 0
    ? never
    : T extends object
    ? {
        [K in keyof T & string]:
        T[K] extends object
        ? K | `${K}.${TranslationKeys<T[K], PreviousDepth[Depth]>}`
        : K;
    }[keyof T & string]
    : never;

export type TranslationKey = TranslationKeys<typeof en>;

export function t(
    language: Language,
    key: TranslationKey,
): string {
    const keys = key.split('.');

    const getTranslation = (source: unknown): string | undefined => {
        let current: unknown = source;

        for (const part of keys) {
            if (
                typeof current !== 'object' ||
                current === null ||
                !(part in current)
            ) {
                return undefined;
            }

            current = (current as Record<string, unknown>)[part];
        }

        return typeof current === 'string' ? current : undefined;
    };

    return (
        getTranslation(translations[language]) ??
        getTranslation(translations.en) ??
        key
    );
}