import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest'
import '@testing-library/jest-dom/vitest'
import { apiClient } from '../../src/services/api/apiClient'
import { ApiError } from '../../src/services/api/apiError'
import { authToken } from '../../src/services/api/authToken'

describe('apiClient', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('makes a GET request', async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response(
                JSON.stringify({
                    id: '123',
                    name: 'Test User',
                }),
                {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            ),
        )

        vi.stubGlobal('fetch', fetchMock)

        const result = await apiClient.get<{
            id: string
            name: string
        }>('/users/123')

        expect(result).toEqual({
            id: '123',
            name: 'Test User',
        })

        expect(fetchMock).toHaveBeenCalledWith(
            'http://localhost:3000/api/v1/users/123',
            expect.objectContaining({
                headers: expect.objectContaining({
                    'Content-Type': 'application/json',
                }),
            }),
        )
    })

    it('makes a POST request with a JSON body', async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response(
                JSON.stringify({
                    success: true,
                }),
                {
                    status: 201,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            ),
        )

        vi.stubGlobal('fetch', fetchMock)

        const body = {
            email: 'test@example.com',
            password: 'password',
        }

        const result = await apiClient.post<{ success: boolean }>(
            '/auth/login',
            body,
        )

        expect(result).toEqual({
            success: true,
        })

        expect(fetchMock).toHaveBeenCalledWith(
            'http://localhost:3000/api/v1/auth/login',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify(body),
            }),
        )
    })

    it('adds the authentication token when available', async () => {
        authToken.set('test-access-token')

        const fetchMock = vi.fn().mockResolvedValue(
            new Response(
                JSON.stringify({
                    id: '123',
                }),
                {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            ),
        )

        vi.stubGlobal('fetch', fetchMock)

        await apiClient.get('/users/me')

        expect(fetchMock).toHaveBeenCalledWith(
            'http://localhost:3000/api/v1/users/me',
            expect.objectContaining({
                headers: expect.objectContaining({
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer test-access-token',
                }),
            }),
        )
    })

    it('does not add an authentication header without a token', async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response(
                JSON.stringify({
                    success: true,
                }),
                {
                    status: 200,
                },
            ),
        )

        vi.stubGlobal('fetch', fetchMock)

        await apiClient.get('/health')

        const options = fetchMock.mock.calls[0][1] as RequestInit
        const headers = options.headers as Record<string, string>

        expect(headers.Authorization).toBeUndefined()
        expect(headers['Content-Type']).toBe(
            'application/json',
        )
    })

    it('throws ApiError for HTTP errors', async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response(
                JSON.stringify({
                    statusCode: 401,
                    message: 'Invalid credentials',
                    error: 'Unauthorized',
                }),
                {
                    status: 401,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            ),
        )

        vi.stubGlobal('fetch', fetchMock)

        const request = apiClient.post(
            '/auth/login',
            {
                email: 'test@example.com',
                password: 'wrong-password',
            },
        )

        await expect(request).rejects.toBeInstanceOf(ApiError)
    })

    it('preserves the backend HTTP status', async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response(
                JSON.stringify({
                    statusCode: 409,
                    message: 'Unable to create account',
                    error: 'Conflict',
                }),
                {
                    status: 409,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            ),
        )

        vi.stubGlobal('fetch', fetchMock)

        try {
            await apiClient.post('/auth/register', {
                email: 'existing@example.com',
                password: 'password',
            })

            throw new Error('Expected request to fail')
        } catch (error) {
            expect(error).toBeInstanceOf(ApiError)

            const apiError = error as ApiError

            expect(apiError.status).toBe(409)
            expect(apiError.message).toBe(
                'Unable to create account',
            )
        }
    })

    it('preserves backend error details', async () => {
        const details = {
            statusCode: 401,
            message: 'Account is not active',
            error: 'Unauthorized',
        }

        const fetchMock = vi.fn().mockResolvedValue(
            new Response(
                JSON.stringify(details),
                {
                    status: 401,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            ),
        )

        vi.stubGlobal('fetch', fetchMock)

        try {
            await apiClient.get('/users/me')

            throw new Error('Expected request to fail')
        } catch (error) {
            expect(error).toBeInstanceOf(ApiError)

            const apiError = error as ApiError

            expect(apiError.details).toEqual(details)
        }
    })

    it('handles validation error message arrays', async () => {
        const details = {
            statusCode: 400,
            message: [
                'email must be an email',
                'password must be longer than or equal to 1 characters',
            ],
            error: 'Bad Request',
        }

        const fetchMock = vi.fn().mockResolvedValue(
            new Response(
                JSON.stringify(details),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            ),
        )

        vi.stubGlobal('fetch', fetchMock)

        try {
            await apiClient.post('/auth/login', {
                email: 'invalid',
                password: '',
            })

            throw new Error('Expected request to fail')
        } catch (error) {
            expect(error).toBeInstanceOf(ApiError)

            const apiError = error as ApiError

            expect(apiError.status).toBe(400)
            expect(apiError.message).toBe(
                'email must be an email, password must be longer than or equal to 1 characters',
            )
            expect(apiError.details?.message).toEqual(
                details.message,
            )
        }
    })

    it('handles HTTP errors without a JSON response', async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response('', {
                status: 500,
            }),
        )

        vi.stubGlobal('fetch', fetchMock)

        try {
            await apiClient.get('/health')

            throw new Error('Expected request to fail')
        } catch (error) {
            expect(error).toBeInstanceOf(ApiError)

            const apiError = error as ApiError

            expect(apiError.status).toBe(500)
            expect(apiError.message).toBe(
                'API request failed with status 500',
            )
        }
    })

    it('handles network errors', async () => {
        const networkError = new TypeError(
            'Failed to fetch',
        )

        const fetchMock = vi
            .fn()
            .mockRejectedValue(networkError)

        vi.stubGlobal('fetch', fetchMock)

        try {
            await apiClient.get('/health')

            throw new Error('Expected request to fail')
        } catch (error) {
            expect(error).toBeInstanceOf(ApiError)

            const apiError = error as ApiError

            expect(apiError.status).toBe(0)
            expect(apiError.message).toBe(
                'Unable to connect to the API',
            )
            expect(apiError.details?.cause).toBe(
                networkError,
            )
        }
    })

    it('handles successful empty JSON objects', async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response('{}', {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            }),
        )

        vi.stubGlobal('fetch', fetchMock)

        const result = await apiClient.get<Record<string, never>>(
            '/health',
        )

        expect(result).toEqual({})
    })
})