
import { describe, expect, it } from 'vitest'

import {
    email,
    maxLength,
    minLength,
    nonNegativeNumber,
    number,
    optional,
    required,
    url,
    validate,
} from '../../src/validation/validators'

describe('required', () => {
    it('rejects an empty value', () => {
        expect(required('')).toEqual({ code: 'required' })
    })

    it('rejects whitespace only', () => {
        expect(required('   ')).toEqual({ code: 'required' })
    })

    it('accepts a filled value', () => {
        expect(required('Company')).toBeUndefined()
    })
})

describe('minLength', () => {
    it('rejects values shorter than the minimum', () => {
        expect(minLength(2)('A')).toEqual({
            code: 'minLength',
            params: { min: 2 },
        })
    })

    it('accepts values meeting the minimum', () => {
        expect(minLength(2)('AB')).toBeUndefined()
    })
})

describe('maxLength', () => {
    it('rejects values longer than the maximum', () => {
        expect(maxLength(5)('Company')).toEqual({
            code: 'maxLength',
            params: { max: 5 },
        })
    })

    it('accepts values meeting the maximum', () => {
        expect(maxLength(5)('Hello')).toBeUndefined()
    })
})

describe('url', () => {
    it('accepts valid HTTP URLs', () => {
        expect(url('http://example.com')).toBeUndefined()
    })

    it('accepts valid HTTPS URLs', () => {
        expect(url('https://example.com')).toBeUndefined()
    })

    it('rejects invalid URLs', () => {
        expect(url('not-a-url')).toEqual({
            code: 'invalidUrl',
        })
    })

    it('rejects protocols other than HTTP and HTTPS', () => {
        expect(url('ftp://example.com')).toEqual({
            code: 'invalidUrl',
        })
    })

    it('accepts an empty value because required is separate', () => {
        expect(url('')).toBeUndefined()
    })
})

describe('email', () => {
    it('accepts a valid email address', () => {
        expect(email('test@example.com')).toBeUndefined()
    })

    it('rejects an invalid email address', () => {
        expect(email('invalid-email')).toEqual({
            code: 'invalidEmail',
        })
    })
})

describe('number', () => {
    it('accepts a valid number', () => {
        expect(number('1250')).toBeUndefined()
    })

    it('rejects non-numeric values', () => {
        expect(number('abc')).toEqual({
            code: 'invalidNumber',
        })
    })

    it('rejects an empty value', () => {
        expect(number('')).toEqual({
            code: 'invalidNumber',
        })
    })
})

describe('nonNegativeNumber', () => {
    it('accepts zero', () => {
        expect(nonNegativeNumber('0')).toBeUndefined()
    })

    it('accepts positive numbers', () => {
        expect(nonNegativeNumber('1250')).toBeUndefined()
    })

    it('rejects negative numbers', () => {
        expect(nonNegativeNumber('-100')).toEqual({
            code: 'negativeNumber',
        })
    })
})

describe('optional', () => {
    it('accepts an empty value', () => {
        expect(optional(nonNegativeNumber)('')).toBeUndefined()
    })

    it('accepts whitespace only', () => {
        expect(optional(nonNegativeNumber)('   ')).toBeUndefined()
    })

    it('still validates a filled value', () => {
        expect(optional(nonNegativeNumber)('-100')).toEqual({
            code: 'negativeNumber',
        })
    })
})

describe('validate', () => {
    it('returns the first validation error', () => {
        const result = validate('A', [
            required,
            minLength(2),
            maxLength(150),
        ])

        expect(result).toEqual({
            code: 'minLength',
            params: { min: 2 },
        })
    })

    it('returns undefined when all validators pass', () => {
        const result = validate('Company', [
            required,
            minLength(2),
            maxLength(150),
        ])

        expect(result).toBeUndefined()
    })
})
