import { env } from '../../config/env'
import { ApiError, type ApiErrorDetails } from './apiError'
import { authToken } from './authToken'

async function request<T>(
    endpoint: string,
    options?: RequestInit,
): Promise<T> {
    const token = authToken.get()

    let response: Response

    try {
        response = await fetch(`${env.apiBaseUrl}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token
                    ? {
                        Authorization: `Bearer ${token}`,
                    }
                    : {}),
                ...options?.headers,
            },
        })
    } catch (error) {
        throw new ApiError(
            0,
            'Unable to connect to the API',
            {
                cause: error,
            },
        )
    }

    if (!response.ok) {
        let details: ApiErrorDetails | undefined

        try {
            details = (await response.json()) as ApiErrorDetails
        } catch {
            // Response bevat geen JSON body.
        }

        const message =
            typeof details?.message === 'string'
                ? details.message
                : Array.isArray(details?.message)
                    ? details.message.join(', ')
                    : `API request failed with status ${response.status}`

        throw new ApiError(response.status, message, details)
    }

    return response.json() as Promise<T>
}

export const apiClient = {
    get<T>(endpoint: string) {
        return request<T>(endpoint)
    },

    post<T>(endpoint: string, body: unknown) {
        return request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        })
    },
}