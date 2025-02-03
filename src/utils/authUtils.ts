import { IUser } from "../models/user";

export const setRefreshToken = async (refreshToken: string, tokenData: {user: IUser; expiry: Date}) => {
  // store the refresh token in db and later retrieve when refreshing is needed
  // DELETE the old one if exists
  return
}

export const getTokenData = async (refreshToken: string) => {
  // store the refresh token in db and later retrieve when refreshing is needed
  return {user: {googleId: 'breh', email: 'john@doe.com', displayName: 'john', createdAt: new Date()}, 'expiry': new Date()}
}
