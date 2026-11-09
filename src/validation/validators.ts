
import type {
    ValidationError,
    Validator,
} from './validationTypes'

export const required: Validator = (value) => {
    if (!value.trim()) {
        return { code: 'required' }
    }

    return undefined
}

export function optional(validator: Validator): Validator {
    return (value) => {
        if (!value.trim()) {
            return undefined
        }

        return validator(value)
    }
}

export function minLength(min: number): Validator {
    return (value) => {
        if (value.trim().length < min) {
            return {
                code: 'minLength',
                params: { min },
            }
        }

        return undefined
    }
}

export function maxLength(max: number): Validator {
    return (value) => {
        if (value.length > max) {
            return {
                code: 'maxLength',
                params: { max },
            }
        }

        return undefined
    }
}

export const url: Validator = (value) => {
    const trimmedValue = value.trim()

    if (!trimmedValue) {
        return undefined
    }

    try {
        const parsedUrl = new URL(trimmedValue)

        if (
            parsedUrl.protocol !== 'http:' &&
            parsedUrl.protocol !== 'https:'
        ) {
            return { code: 'invalidUrl' }
        }

        return undefined
    } catch {
        return { code: 'invalidUrl' }
    }
}

export const email: Validator = (value) => {
    const trimmedValue = value.trim()

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailPattern.test(trimmedValue)) {
        return { code: 'invalidEmail' }
    }

    return undefined
}

export const number: Validator = (value) => {
    const trimmedValue = value.trim()

    if (!trimmedValue || !Number.isFinite(Number(trimmedValue))) {
        return { code: 'invalidNumber' }
    }

    return undefined
}

export const nonNegativeNumber: Validator = (value) => {
    const trimmedValue = value.trim()
    const parsedValue = Number(trimmedValue)

    if (
        !trimmedValue ||
        !Number.isFinite(parsedValue) ||
        parsedValue < 0
    ) {
        return { code: 'negativeNumber' }
    }

    return undefined
}

/**
 * Runs multiple validators in order.
 * Returns the first validation error.
 */
export function validate(
    value: string,
    validators: Validator[],
): ValidationError | undefined {
    for (const validator of validators) {
        const error = validator(value)

        if (error) {
            return error
        }
    }

    return undefined
}
