import type { ApiErrorDetails } from '../../types/api'

export class ApiError extends Error {
  readonly status: number
  readonly details?: ApiErrorDetails

  constructor(status: number, message: string, details?: ApiErrorDetails) {
    super(message)

    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}
