import { env } from '../../config/env'

async function request<T>(
    endpoint: string,
    options?: RequestInit,
): Promise<T> {
    const response = await fetch(`${env.apiBaseUrl}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    })

    if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
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