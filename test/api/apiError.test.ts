import { describe, expect, it } from 'vitest'
import { ApiError } from '../../src/services/api/apiError'

describe('ApiError', () => {
    it('contains the HTTP status', () => {
        const error = new ApiError(
            401,
            'Invalid credentials',
        )

        expect(error.status).toBe(401)
    })

    it('contains the error message', () => {
        const error = new ApiError(
            401,
            'Invalid credentials',
        )

        expect(error.message).toBe('Invalid credentials')
    })

    it('has the correct error name', () => {
        const error = new ApiError(
            400,
            'Bad request',
        )

        expect(error.name).toBe('ApiError')
    })

    it('contains backend error details', () => {
        const details = {
            statusCode: 409,
            message: 'Unable to create account',
            error: 'Conflict',
        }

        const error = new ApiError(
            409,
            'Unable to create account',
            details,
        )

        expect(error.details).toEqual(details)
    })

    it('supports validation message arrays', () => {
        const error = new ApiError(
            400,
            'email must be an email, password is required',
            {
                statusCode: 400,
                message: [
                    'email must be an email',
                    'password is required',
                ],
                error: 'Bad Request',
            },
        )

        expect(error.status).toBe(400)
        expect(error.message).toBe(
            'email must be an email, password is required',
        )
        expect(error.details?.message).toEqual([
            'email must be an email',
            'password is required',
        ])
    })

    it('is an instance of Error', () => {
        const error = new ApiError(
            500,
            'Server error',
        )

        expect(error).toBeInstanceOf(Error)
    })
})