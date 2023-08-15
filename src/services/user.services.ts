import User from '~/models/schemas/User.schema'
import databaseServices from './database.services'
import { RegisterReqbody } from '~/models/requests/User.requests'
import { hashPassword } from '~/utils/crypto'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import { signToken } from '~/utils/jwt'
import 'dotenv/config'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import { USER_MESSAGE } from '~/constants/message'

class UserServices {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken
      },
      secretOrPrivateKey: process.env.JWT_ACCESS_SECRET as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRE
      }
    })
  }

  private signRefreshToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken
      },
      secretOrPrivateKey: process.env.JWT_REFRESH_SECRET as string,
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRE
      }
    })
  }

  private signForgotPasswordToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.ForgotPasswordToken
      },
      secretOrPrivateKey: process.env.JWT_FORGOT_PASSWORD_SECRET as string,
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRE
      }
    })
  }
  private signEmailVerifyToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken
      },
      secretOrPrivateKey: process.env.JWT_EMAIL_VERIFY_SECRET as string,
      options: {
        expiresIn: process.env.EMAIL_VERIFY_EXPIRE
      }
    })
  }

  private signAccessAndRefreshToken = (userId: string) => {
    return Promise.all([this.signAccessToken(userId), this.signRefreshToken(userId)])
  }
  async register(payload: RegisterReqbody) {
    const userId = new ObjectId()
    const { email, password } = payload
    console.log(userId.toString())
    const email_verify_token = await this.signEmailVerifyToken(userId.toString())
    const result = await databaseServices.users.insertOne(
      new User({
        _id: userId,
        email: email,
        password: hashPassword(password),
        email_verify_token: email_verify_token
      })
    )

    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(userId.toString())
    await databaseServices.refreshTokens.insertOne(
      new RefreshToken({
        userId: new ObjectId(userId),
        token: refresh_token
      })
    )
    return {
      result,
      access_token,
      refresh_token
    }
  }
  async checkEmailExits(email: string) {
    const result = await databaseServices.users.findOne({ email })
    return result
  }

  async checkLogin(email: string, password: string) {
    return databaseServices.users.findOne({ email, password: hashPassword(password) })
  }

  async login(userId: string) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(userId)
    return [access_token, refresh_token]
  }

  async logout(token: string) {
    await databaseServices.refreshTokens.deleteOne({ token })
    return {
      message: USER_MESSAGE.LOGOUT_SUCCESS
    }
  }

  async emailVerifyToken(user_id: string) {
    const [token] = await Promise.all([
      this.signAccessAndRefreshToken(user_id),
      await databaseServices.users.updateOne(
        { _id: new ObjectId(user_id) },
        { $set: { email_verify_token: '', update_at: new Date(), verify: UserVerifyStatus.Verified } }
      )
    ])
    const [access_token, refresh_token] = token
    return {
      access_token,
      refresh_token
    }
  }

  async resendEmailVerify(user_id: string) {
    const newEmailVerifyToken = await this.signEmailVerifyToken(user_id)
    await databaseServices.users.updateOne(
      { _id: new ObjectId(user_id) },
      { $set: { email_verify_token: newEmailVerifyToken, update_at: new Date() } }
    )

    return {
      message: USER_MESSAGE.RESEND_EMAIL_VERIFY_TOKEN
    }
  }

  async forgotPassword(user_id: string) {
    const forgot_password_token = await this.signForgotPasswordToken(user_id)
    await databaseServices.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          forgot_password_token,
          update_at: '$$NOW'
        }
      }
    ])
    return {
      message: USER_MESSAGE.CHECK_EMAIL_TO_RESET_PASSWORD
    }
  }
}

export const userServices = new UserServices()
