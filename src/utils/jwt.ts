import jwt, { SignOptions, VerifyOptions, JwtPayload } from 'jsonwebtoken'
import 'dotenv/config'
export const signToken = ({
  payload,
  secretOrPrivateKey,
  options = { algorithm: 'HS256', expiresIn: '1d' }
}: {
  payload: string | Buffer | object
  secretOrPrivateKey: string
  options?: SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, secretOrPrivateKey, options, function (err, token) {
      if (err) {
        throw reject(err)
      }

      resolve(token as string)
    })
  })
}

export function verifyToken({ token, secretOrPublicKey }: { token: string; secretOrPublicKey: string }): JwtPayload {
  return new Promise<jwt.JwtPayload>((resolve, reject) => {
    jwt.verify(token, secretOrPublicKey, (err, decoded) => {
      if (err) throw reject(err)
      resolve(decoded as jwt.JwtPayload)
    })
  })
}
