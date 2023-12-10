import { Router } from "express"
import {
  create_user,
  get_users,
  get_user,
  delete_user,
  update_user,
  update_password,
  password_reset,
} from "../controllers/users"
import { middleware_lax, admin_only_middlware, middleware } from "../auth"
import { revokeToken } from "../controllers/tokens"

const router = Router()

router
  .route("/")
  .post(middleware_lax, create_user)
  .get(middleware, admin_only_middlware, get_users)

router
  .route("/:user_id")
  .get(middleware, get_user)
  .delete(middleware, delete_user)
  .put(middleware, update_user)
  .patch(middleware, update_user)

// middleware lax here because reset using token
router
  .route("/:user_id/password")
  .put(middleware, update_password)
  .patch(middleware, update_password)

// :user_id is not used
router.route("/:user_id/password/reset").post(password_reset)

router
  .route("/:user_id/token")
  .put(middleware, revokeToken)
  .delete(middleware, revokeToken)

export default router
