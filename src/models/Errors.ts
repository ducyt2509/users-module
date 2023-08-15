import { USER_MESSAGE } from '~/constants/message'

export class ErrorWithStatus {
  message: string
  statusCode: number

  constructor({ message, statusCode }: { message: string; statusCode: number }) {
    this.message = message
    this.statusCode = statusCode
  }
}

export class EntityError extends ErrorWithStatus {
  errors: ErrorsType
  constructor({ message = USER_MESSAGE.VALIDATION_ERROR, errors }: { message?: string; errors: ErrorsType }) {
    super({ message, statusCode: 422 })
    this.errors = errors
  }
}

type ErrorsType = Record<
  string,
  {
    msg: string
    [key: string]: any
  }
>
