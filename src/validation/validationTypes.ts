export type ValidationErrorCode =
    | 'required'
    | 'minLength'
    | 'maxLength'
    | 'invalidUrl'
    | 'invalidEmail'
    | 'invalidNumber'
    | 'negativeNumber'

export interface ValidationError {
    code: ValidationErrorCode
    params?: {
        min?: number
        max?: number
    }
}

export type Validator = (
    value: string,
) => ValidationError | undefined