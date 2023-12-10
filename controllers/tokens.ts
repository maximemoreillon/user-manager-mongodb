import { Request, Response } from "express";
import createHttpError from "http-errors"
import User from "../models/user"
import { v4 as uuidv4 } from 'uuid';
import { removeUserFromCache } from "../cache"

export const revokeToken = async (req: Request, res: Response) => {
  const { user } = res.locals
  let { user_id } = req.params
  
  if (user_id === "self") user_id = user._id
  if (!user_id) throw createHttpError(400, `User ID not defined`)
  
  if (user._id.toString() !== user_id.toString() && !user.isAdmin) {
    throw createHttpError(403, `Not allowed to update another user`)
  }
  
  const properties = {token_id: uuidv4()}

  const result = await User.updateOne({ _id: user_id }, properties)

  console.log(`[Mongoose] Token of user ${user_id} revoked`)
  removeUserFromCache(user_id)
  res.send(result)
}