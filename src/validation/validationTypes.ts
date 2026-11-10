export type ValidationErrorCode =
    | 'required'
    | 'minLength'
    | 'maxLength'
    | 'invalidUrl'
    | 'invalidEmail'
    | 'invalidNumber'
    | 'negativeNumber'
    | 'invalidDate'
    | 'salaryRange'

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