import { checkSchema } from 'express-validator'
import { validate } from './validation.middlewares'
import { userServices } from '~/services/user.services'
import { USER_MESSAGE } from '~/constants/message'
import { verifyToken } from '~/utils/jwt'
import { responseWithData, unauthorized } from '~/constants/httpStatus'
import { JsonWebTokenError } from 'jsonwebtoken'
import { ErrorWithStatus } from '~/models/Errors'
import { statusCode } from './../constants/statusCode'
import databaseServices from '~/services/database.services'
import { Request } from 'express'
import { ObjectId } from 'mongodb'
import User from '~/models/schemas/User.schema'

export const registerValidate = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: USER_MESSAGE.EMAIL_INVALID
        },
        trim: true,
        custom: {
          options: async (value) => {
            const isEmailExits = await userServices.checkEmailExits(value)
            if (isEmailExits) {
              throw new ErrorWithStatus({
                message: USER_MESSAGE.USER_EXIST,
                statusCode: statusCode.BAD_REQUEST
              })
            }

            return true
          }
        }
      },
      password: {
        notEmpty: true,
        isString: true,
        isLength: {
          options: {
            min: 6,
            max: 32
          },
          errorMessage: USER_MESSAGE.PASSWORD_INVALID
        },
        trim: true,
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: USER_MESSAGE.PASSWORD_MUST_BE_STRONG
        }
      },

      confirm_password: {
        notEmpty: true,
        isString: true,
        isLength: {
          options: {
            min: 6,
            max: 32
          }
        },
        trim: true,
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: USER_MESSAGE.PASSWORD_MUST_BE_STRONG
        },
        //custom
        custom: {
          options: (value, { req }) => {
            if (value !== req.body.password) {
              throw new Error(USER_MESSAGE.CONFIRM_PASSWORD_NOT_MATCH)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const loginValidate = validate(
  checkSchema(
    {
      email: {
        isEmail: true,
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const isEmailExits = await userServices.checkLogin(value, req.body.password)
            if (!isEmailExits) {
              throw new ErrorWithStatus({ message: USER_MESSAGE.USER_NOT_FOUND, statusCode: statusCode.BAD_REQUEST })
            }
            req.user = isEmailExits
            return true
          }
        }
      },
      password: {
        notEmpty: true,
        isString: true,
        isLength: {
          options: {
            min: 6,
            max: 32
          },
          errorMessage: USER_MESSAGE.PASSWORD_INVALID
        },
        trim: true,
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: USER_MESSAGE.PASSWORD_MUST_BE_STRONG
        }
      }
    },
    ['body']
  )
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            try {
              console.log('Check', value)
              const accessToken = (value || '').split(' ')[1]
              if (!accessToken)
                throw new ErrorWithStatus({
                  message: USER_MESSAGE.ACCESS_TOKEN_REQUIRED,
                  statusCode: statusCode.BAD_REQUEST
                })
              const decoded_authorization = await verifyToken({
                token: accessToken,
                secretOrPublicKey: process.env.JWT_ACCESS_SECRET as string
              })
              req.decoded_authorization = decoded_authorization
              return true
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: (error as JsonWebTokenError).message,
                  statusCode: statusCode.UNAUTHORIZED
                })
              }
              throw error
            }
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        trim: true,
        custom: {
          options: async (value) => {
            try {
              if (!value)
                throw new ErrorWithStatus({
                  message: USER_MESSAGE.REFRESH_TOKEN_REQUIRED,
                  statusCode: statusCode.UNAUTHORIZED
                })
              const [decoded_refresh_token, refresh_token] = await Promise.all([
                verifyToken({ token: value, secretOrPublicKey: process.env.JWT_REFRESH_SECRET as string }),
                databaseServices.refreshTokens.findOne({ token: value })
              ])

              if (!refresh_token)
                throw new ErrorWithStatus({
                  message: USER_MESSAGE.REFRESH_TOKEN_USED_OR_INVALID,
                  statusCode: statusCode.UNAUTHORIZED
                })
              return true
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: (error as JsonWebTokenError).message,
                  statusCode: statusCode.UNAUTHORIZED
                })
              }
              throw error
            }
          }
        }
      }
    },
    ['body']
  )
)

export const emailVerifyTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            try {
              if (!value) {
                throw new ErrorWithStatus({
                  message: USER_MESSAGE.EMAIL_VERIFY_TOKEN_REQUIRED,
                  statusCode: statusCode.UNAUTHORIZED
                })
              }

              const decoded_email_verify_token = await verifyToken({
                token: value,
                secretOrPublicKey: process.env.JWT_EMAIL_VERIFY_SECRET as string
              })
              req.decoded_email_verify_token = decoded_email_verify_token

              return true
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: (error as JsonWebTokenError).message,
                  statusCode: statusCode.UNAUTHORIZED
                })
              }
              throw error
            }
          }
        }
      }
    },
    ['body']
  )
)

export const forgotPasswordValidator = validate(
  checkSchema({
    email: {
      isEmail: {
        errorMessage: USER_MESSAGE.EMAIL_INVALID
      },
      trim: true,
      custom: {
        options: async (value, { req }) => {
          const user = await databaseServices.users.findOne({ email: value })
          if (!user) throw new Error(USER_MESSAGE.USER_NOT_FOUND)
          req.user = user
          return true
        }
      }
    }
  })
)

export const verifyForgotPasswordValidator = validate(
  checkSchema({
    forgot_password_token: {
      trim: true,
      custom: {
        options: async (value, { req }) => {
          try {
            if (!value) {
              throw new ErrorWithStatus({
                message: USER_MESSAGE.EMAIL_VERIFY_TOKEN_REQUIRED,
                statusCode: statusCode.UNAUTHORIZED
              })
            }

            const decode_forget_password_token = await verifyToken({
              token: value,
              secretOrPublicKey: process.env.JWT_FORGOT_PASSWORD_SECRET as string
            })
            const { user_id } = decode_forget_password_token
            const user = await databaseServices.users.findOne({ _id: new ObjectId(user_id) })
            if (!user) {
              throw new Error(USER_MESSAGE.USER_NOT_FOUND)
            }

            if (user.forgot_password_token !== value) {
              throw new ErrorWithStatus({
                message: USER_MESSAGE.VERIFY_FORGOT_PASSWORD_TOKEN_ALREADY_USED_BEFORE,
                statusCode: statusCode.BAD_REQUEST
              })
            }
            req.user = user

            return true
          } catch (error) {
            if (error instanceof JsonWebTokenError) {
              throw new ErrorWithStatus({
                message: (error as JsonWebTokenError).message,
                statusCode: statusCode.UNAUTHORIZED
              })
            }
            throw error
          }
        }
      }
    }
  })
)
