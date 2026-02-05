import { Router } from "express";
import {
  getAllUsers,
  loginUser,
  registerUser,
} from "../controllers/userController.js";
import { protect } from "../middleware/users.middleware.js";

const userRouter = new Router();

userRouter.post("/", registerUser).get("/", protect, getAllUsers);

userRouter.post("/login", loginUser);

export default userRouter;
