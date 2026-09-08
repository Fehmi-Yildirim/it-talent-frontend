import { ApiError } from './apiError'

export function getApiErrorMessage(
    error: unknown,
    fallback = 'Something went wrong. Please try again.',
): string {
    if (!(error instanceof ApiError)) {
        return fallback
    }

    switch (error.status) {
        case 0:
            return 'Unable to connect to the server. Please check your connection and try again.'
        case 400:
            return 'Please check your input and try again.'
        case 401:
            return 'Your session has expired. Please log in again.'
        case 403:
            return 'You are not authorized to perform this action.'
        case 404:
            return 'The requested resource could not be found.'
        case 409:
            return 'This action conflicts with existing data.'
        case 422:
            return 'The submitted data could not be processed. Please check your input.'
        case 500:
            return 'The server encountered an error. Please try again later.'
        default:
            return fallback
    }
}
