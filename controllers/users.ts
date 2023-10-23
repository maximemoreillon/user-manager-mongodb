import createHttpError from "http-errors"
import dotenv from "dotenv"
import User from "../models/user"
import { hash_password } from "../auth"
import { passwordUpdateSchema } from "../schemas/password"
import { send_activation_email, send_password_reset_email } from "../mail"
import {
  newUserSchema,
  userUpdateSchema,
  userAdminUpdateSchema,
} from "../schemas/user"
import { Request, Response } from "express"
import { getUserFromCache, setUserInCache, removeUserFromCache } from "../cache"

dotenv.config()

export const create_user = async (req: Request, res: Response) => {
  const properties = req.body

  try {
    await newUserSchema.validateAsync(properties)
  } catch (error) {
    throw createHttpError(400, error as any)
  }

  const { username, password, email_address } = properties

  const current_user = res.locals.user
  const current_user_is_admin = current_user?.isAdmin

  // Email activation only necessary if user registers himself
  const activated = current_user_is_admin ? true : false

  if (!process.env.ALLOW_REGISTRATION && !current_user_is_admin) {
    throw createHttpError(
      403,
      `Registration is not allowed unless administrator`
    )
  }

  const password_hashed = await hash_password(password)

  const user = await User.create({
    username,
    password_hashed,
    email_address,
    display_name: username,
    creation_date: new Date(),
    activated,
  })

  // Send activation email if necessary
  const mail_options = { url: req.headers.origin, user }
  if (!activated) await send_activation_email(mail_options)

  res.send(user)
  console.log(`[Mongoose] User ${user._id} created`)
}

export const get_users = async (req: Request, res: Response) => {
  // TODO: filters
  const {
    skip = 0,
    limit = 50,
    sort = "_id",
    order = 1,
    ids,
    search,
  } = req.query as any

  let query: any = {}
  if (search) {
    const searched_fields = ["username", "email_address", "display_name"]
    query["$or"] = searched_fields.map((item) => ({
      [item]: { $regex: search, $options: "i" },
    }))
  }

  // A list of user IDs can be passed as filter
  if (ids) query["$or"] = ids.map((_id: string) => ({ _id }))

  const count = await User.countDocuments(query)

  const users = await User.find(query)
    .skip(Number(skip))
    .sort({ [sort]: order })
    .limit(Number(limit))

  console.log(`[Mongoose] Users queried`)

  res.send({ users, count })
}

export const get_user = async (req: Request, res: Response) => {
  let { user_id } = req.params
  if (user_id === "self") return res.send(res.locals.user)
  if (!user_id) throw createHttpError(400, `User ID not defined`)

  let user = await getUserFromCache(user_id)
  if (user) {
    delete user.password_hashed
    return res.send(user)
  }

  user = await User.findById(user_id)
  if (!user) throw createHttpError(404, `User ${user_id} not found`)
  setUserInCache(user)
  user.cached = false
  delete user.password_hashed
  res.send(user)
}

export const delete_user = async (req: Request, res: Response) => {
  const { user } = res.locals
  let { user_id } = req.params

  if (user_id === "self") user_id = user._id
  if (!user_id) throw createHttpError(400, `User ID not defined`)

  if (user._id.toString() !== user_id.toString() && !user.isAdmin) {
    throw createHttpError(403, `Not allowed to delete another user`)
  }

  await User.deleteOne({ _id: user_id })

  console.log(`[Mongoose] User ${user_id} deleted`)
  removeUserFromCache(user_id)

  res.send({ _id: user_id })
}

export const update_user = async (req: Request, res: Response) => {
  const { user } = res.locals
  let { user_id } = req.params
  const properties = req.body

  if (user_id === "self") user_id = user._id
  if (!user_id) throw createHttpError(400, `User ID not defined`)

  if (user._id.toString() !== user_id.toString() && !user.isAdmin) {
    throw createHttpError(403, `Not allowed to update another user`)
  }

  try {
    if (user.isAdmin) await userAdminUpdateSchema.validateAsync(properties)
    else await userUpdateSchema.validateAsync(properties)
  } catch (error) {
    throw createHttpError(403, error as any)
  }

  const result = await User.updateOne({ _id: user_id }, properties)

  console.log(`[Mongoose] User ${user_id} updated`)
  removeUserFromCache(user_id)
  res.send(result)
}

export const update_password = async (req: Request, res: Response) => {
  try {
    await passwordUpdateSchema.validateAsync(req.body)
  } catch (error) {
    throw createHttpError(400, error as any)
  }

  const { new_password, new_password_confirm } = req.body
  // TODO: check with password confirm

  const current_user = res.locals.user

  let user_id = req.params.user_id
  if (user_id === "self") user_id = current_user._id

  if (String(user_id) !== String(current_user._id) && !current_user.isAdmin) {
    throw createHttpError(403, `Unauthorized to modify another user's password`)
  }

  const password_hashed = await hash_password(new_password)
  const result = await User.updateOne({ _id: user_id }, { password_hashed })

  console.log(`[Mongoose] Password of user ${user_id} updated`)
  res.send(result)
}

export const password_reset = async (req: Request, res: Response) => {
  const { email_address } = req.body
  if (!email_address) throw createHttpError(400, `Missing email_address`)
  const user = await User.findOne({ email_address })
  if (!user)
    throw createHttpError(
      404,
      `User with email_address ${email_address} not found`
    )

  const mail_options = { url: req.headers.origin, user }
  await send_password_reset_email(mail_options)

  res.send({ email_address })
}

export const create_admin_account = async () => {
  const {
    ADMIN_USERNAME: admin_username = "admin",
    ADMIN_PASSWORD: admin_password = "admin",
  } = process.env

  const password_hashed = await hash_password(admin_password)
  try {
    const admin = await User.create({
      username: admin_username,
      display_name: admin_username,
      isAdmin: true,
      activated: true,
      password_hashed,
      creation_date: new Date(),
    })

    console.log(`[Mongoose] Admin account created`)
  } catch (error: any) {
    if (error.code === 11000)
      console.log(`[Mongoose] Admin account already exists`)
    else console.log(error)
  }
}

export const rename_admin_property = async () => {
  // Used to rename field 'administrator' into 'isAdmin'
  // For compatibility with Neo4J version

  const actions = { $rename: { administrator: "isAdmin" } }
  const options = { multi: true }

  try {
    await User.updateMany({}, actions, options)
    console.log(`[Mongoose] administrator property renamed`)
  } catch (error) {
    console.log(error)
  }
}
