import { Request, Response } from 'express'
import core from 'express-serve-static-core'
import { badRequest, responseWithData, ok } from '~/constants/httpStatus'
import { userServices } from '~/services/user.services'
import { NextFunction } from 'express'
import User from '~/models/schemas/User.schema'
import { ObjectId } from 'mongodb'
import { statusCode } from '~/constants/statusCode'
import { USER_MESSAGE } from '~/constants/message'
import databaseServices from '~/services/database.services'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { JwtPayload } from 'jsonwebtoken'
import { UserVerifyStatus } from '~/constants/enums'
import { ForgotPassWordBody } from './../models/requests/User.requests'

const login = async (req: Request, res: Response) => {
  const user = req.user as User
  const userId = user._id as ObjectId
  const [access_token, refresh_token] = await userServices.login(userId.toString())
  await databaseServices.refreshTokens.insertOne(new RefreshToken({ token: refresh_token, userId }))
  responseWithData(res, statusCode.OK, {
    message: USER_MESSAGE.LOGIN_SUCCESS,
    access_token,
    refresh_token
  })
}

const register = async (req: Request<core.ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
  const { email, password } = req.body
  const { result, access_token, refresh_token } = await userServices.register({ email, password })
  responseWithData(res, statusCode.OK, {
    message: 'Registration sucessful',
    result,
    access_token,
    refresh_token
  })
  next()
}

const logout = async (req: Request, res: Response) => {
  const { refresh_token } = req.body
  const result = await userServices.logout(refresh_token)
  ok(res, result.message)
}

const emailVerify = async (req: Request, res: Response, next: NextFunction) => {
  const decoded_email_verify_token = req.decoded_email_verify_token as JwtPayload
  const { user_id } = decoded_email_verify_token
  const user = await databaseServices.users.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    badRequest(res, USER_MESSAGE.USER_NOT_FOUND)
  }
  if (!user?.email_verify_token) {
    badRequest(res, USER_MESSAGE.EMAIL_VERIFY_TOKEN_ALREADY_USED_BEFORE)
  } else {
    const result = await userServices.emailVerifyToken(user_id)
    responseWithData(res, statusCode.OK, result)
  }
  next()
}

const resendVerifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as JwtPayload
  const user = await databaseServices.users.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    badRequest(res, USER_MESSAGE.USER_NOT_FOUND)
  }
  if (user?.verify === UserVerifyStatus.Verified) {
    badRequest(res, USER_MESSAGE.EMAIL_VERIFY_TOKEN_ALREADY_USED_BEFORE)
  }

  const result = await userServices.resendEmailVerify(user_id)
  responseWithData(res, statusCode.OK, result)
  next()
}

const forgotPassWordController = async (
  req: Request<core.ParamsDictionary, any, ForgotPassWordBody>,
  res: Response,
  next: NextFunction
) => {
  const { _id } = req.user as User
  const result = await userServices.forgotPassword((_id as ObjectId)?.toString())
  ok(res, result.message)
}
const verifyForgotPassWordController = async (
  req: Request<core.ParamsDictionary, any, ForgotPassWordBody>,
  res: Response,
  next: NextFunction
) => {
  // ok(res,)
}
export { login, register, logout, emailVerify, resendVerifyEmail, forgotPassWordController }
