enum UserVerifyStatus {
  Unverified,
  Verified,
  Banned
}

enum TokenType {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EmailVerifyToken
}

export { UserVerifyStatus, TokenType }
