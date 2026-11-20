import { describe, expect, it } from 'vitest'
import {
    getLanguageFromPath,
    getLocalizedPath,
    getPathWithoutLocale,
} from '../../src/i18n/routing'

describe('getLanguageFromPath', () => {
    it('returns English for paths without a language prefix', () => {
        expect(getLanguageFromPath('/')).toBe('en')
        expect(getLanguageFromPath('/about-this-app')).toBe('en')
        expect(getLanguageFromPath('/register')).toBe('en')
    })

    it('returns Dutch for paths with the Dutch prefix', () => {
        expect(getLanguageFromPath('/nl/')).toBe('nl')
        expect(getLanguageFromPath('/nl/over-deze-app')).toBe('nl')
    })

    it('returns the default language for unsupported prefixes', () => {
        expect(getLanguageFromPath('/fr/about')).toBe('en')
    })
})

describe('getPathWithoutLocale', () => {
    it('removes the Dutch language prefix', () => {
        expect(getPathWithoutLocale('/nl/over-deze-app')).toBe(
            '/over-deze-app',
        )
    })

    it('keeps paths without a language prefix unchanged', () => {
        expect(getPathWithoutLocale('/about-this-app')).toBe(
            '/about-this-app',
        )
    })

    it('returns the root path for the Dutch homepage', () => {
        expect(getPathWithoutLocale('/nl/')).toBe('/')
    })

    it('adds a leading slash when it is missing', () => {
        expect(getPathWithoutLocale('about-this-app')).toBe(
            '/about-this-app',
        )
    })
})

describe('getLocalizedPath', () => {
    it('returns English paths without a language prefix', () => {
        expect(getLocalizedPath('/nl/over-deze-app', 'en')).toBe(
            '/about-this-app',
        )
        expect(getLocalizedPath('/nl/registreren', 'en')).toBe(
            '/register',
        )
    })

    it('returns Dutch paths with a language prefix', () => {
        expect(getLocalizedPath('/about-this-app', 'nl')).toBe(
            '/nl/over-deze-app',
        )
        expect(getLocalizedPath('/register', 'nl')).toBe(
            '/nl/registreren',
        )
    })

    it('localizes the homepage correctly', () => {
        expect(getLocalizedPath('/', 'en')).toBe('/')
        expect(getLocalizedPath('/', 'nl')).toBe('/nl/')
        expect(getLocalizedPath('/nl/', 'en')).toBe('/')
    })

    it('keeps unknown paths while adding the language prefix', () => {
        expect(getLocalizedPath('/dashboard', 'nl')).toBe(
            '/nl/dashboard',
        )
    })
})
