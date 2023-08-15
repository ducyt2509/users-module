import { ObjectId } from 'mongodb'

export interface RefreshTokenType {
  _id?: ObjectId
  token: string
  create_at?: Date
  userId: ObjectId
}
export default class RefreshToken {
  _id?: ObjectId
  token: string
  create_at?: Date
  userId: ObjectId

  constructor({ _id, token, create_at, userId }: RefreshTokenType) {
    this._id = _id
    this.token = token
    this.create_at = create_at || new Date()
    this.userId = userId
  }
}
