export interface RegisterReqbody {
  //   name: string
  email: string
  password: string
}

export interface JwtPayload {
  refresh_token: string
}

export interface ForgotPassWordBody {
  email: string
}
