import { Router } from 'express'
import { login, register, logout, emailVerify, resendVerifyEmail, forgotPassWordController } from '~/controllers'
import { RequestAsync } from '~/middleware/request.middlewares'
import {
  refreshTokenValidator,
  accessTokenValidator,
  loginValidate,
  registerValidate,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  verifyForgotPasswordValidator
} from '~/middleware/users.middlewares'

const userRoute = Router()

userRoute.post('/login', loginValidate, RequestAsync(login))
userRoute.post('/register', registerValidate, RequestAsync(register))
userRoute.post('/logout', accessTokenValidator, refreshTokenValidator, logout)
userRoute.post('/email-verify', emailVerifyTokenValidator, RequestAsync(emailVerify))
userRoute.post('/resend-email-verify', accessTokenValidator, RequestAsync(resendVerifyEmail))
userRoute.post('/forgot-password', forgotPasswordValidator, RequestAsync(forgotPassWordController))
userRoute.post('/verify-forgot-password', verifyForgotPasswordValidator, RequestAsync(forgotPassWordController))

export default userRoute
