export interface ApiErrorDetails {
  statusCode?: number
  error?: string
  message?: string | string[]
  [key: string]: unknown
}
