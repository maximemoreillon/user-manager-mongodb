import User from "./models/user"
import Cookies from "cookies"
import createHttpError from "http-errors"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"
import { getUserFromCache, setUserInCache, removeUserFromCache } from "./cache"

// aliases for bcrypt functions
export const hash_password = (password_plain: string) =>
  bcrypt.hash(password_plain, 10)
export const check_password = (
  password_plain: string,
  password_hashed: string
) => bcrypt.compare(password_plain, password_hashed)

const retrieve_jwt = (req: Request, res: Response) => {
  return (
    req.headers.authorization?.split(" ")[1] ||
    new Cookies(req, res).get("jwt") ||
    req.query.jwt ||
    req.query.token
  )
}

export const generate_token = (user: any) =>
  new Promise((resolve, reject) => {
    const { JWT_SECRET } = process.env
    if (!JWT_SECRET) return reject(createHttpError(500, `Token secret not set`))
    const {_id: user_id, token_id} = user
    const token_content = { user_id, token_id }
    console.log({token_content})
    jwt.sign(token_content, JWT_SECRET, (error: any, token: any) => {
      if (error) return reject(createHttpError(500, error))
      resolve(token)
      console.log(`[Auth] Token generated for user ${user._id}`)
    })
  })

export const decode_token = (token: string) =>
  new Promise((resolve, reject) => {
    const { JWT_SECRET } = process.env
    if (!JWT_SECRET) return reject(createHttpError(500, `Token secret not set`))
    jwt.verify(token, JWT_SECRET, (error: any, decoded_token: any) => {
      if (error) return reject(createHttpError(403, `Invalid JWT`))
      resolve(decoded_token)
    })
  })

export const login = async (req: Request, res: Response) => {
  // Todo: Register last login time
  const username = req.body.username || req.body.identifier
  const { password } = req.body

  // Todo: use JOY
  if (!username) throw createHttpError(400, `Missing username`)
  if (!password) throw createHttpError(400, `Missing password`)

  // currently, can only login using username
  const query = { username }

  const user = await User.findOne(query).select("+password_hashed")

  if (!user) throw createHttpError(403, `User ${username} does not exist`)

  // Prevent deactivated users from loggign in
  if (!user.activated && !user.isAdmin)
    throw createHttpError(403, `User ${username} is not activated`)
  if (user.locked && !user.isAdmin)
    throw createHttpError(403, `Account ${username} is locked`)

  const password_correct = await check_password(password, user.password_hashed)

  if (!password_correct) throw createHttpError(403, `Incorrect password`)

  user.last_login = new Date()
  await user.save()

  const jwt = await generate_token(user)
  console.log(`[Auth] Successful login for user ${user._id}`)
  removeUserFromCache(user._id)

  res.send({ jwt })
}

export const get_user_from_jwt = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(501).send("not implemented")
}

export const middleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = retrieve_jwt(req, res) as string
    if (!token) throw `Missing JWT`

    const { user_id, token_id: tokenIdFromJwt} = (await decode_token(token)) as { user_id: string, token_id: string}

    let user: any = await getUserFromCache(user_id)
    if (!user) {
      user = await User.findOne({ _id: user_id }).select("+password_hashed")
      if (!user) throw `User ${user_id} not found`
      setUserInCache(user)
    }

    const {token_id: tokenIfFromUser} = user

    if(tokenIdFromJwt !== tokenIfFromUser) throw `Token revoked`

    res.locals.user = user

    next()
  } catch (error) {
    next(error)
  }
}

export const middleware_lax = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = retrieve_jwt(req, res) as string
    if (!token) throw `Missing JWT`
    const { user_id } = (await decode_token(token)) as { user_id: string }

    const user = await User.findOne({ _id: user_id }).select("+password_hashed")

    res.locals.user = user
  } catch (error) {
    // Nothing
  } finally {
    next()
  }
}

export const admin_only_middlware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!res.locals.user?.isAdmin) {
    const message = `This resource is only available to administrators`
    console.log(`[Auth] ${message}`)
    res.status(403).send(message)
    return
  }

  next()
}
