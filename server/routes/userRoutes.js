import express from "express";
import { checkAuth, login, singup, updateProfile } from "../controllers/userController.js";
import { protectRoute } from "../controllers/middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/singup", singup);
userRouter.post("/login", login);
userRouter.put("/update-profile", protectRoute, updateProfile)
userRouter.get("/check", protectRoute, checkAuth)

export default userRouter;
