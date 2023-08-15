import { Resquest } from 'express'
import User from './models/schemas/User.schema'
import { JwtPayload } from 'jsonwebtoken'
declare module 'express' {
  interface Request {
    user?: User
    decoded_email_verify_token?: JwtPayload
    decoded_authorization?: JwtPayload
  }
}
