import express from "express";
import {
	getMyProfile,
	selectCharity,
	selectPlan,
	getAllUsers,
	deleteUser,
} from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
export const userRouter = express.Router();

userRouter.get("/profile", authMiddleware, getMyProfile);
userRouter.put("/select-charity", authMiddleware, selectCharity);
userRouter.put("/select-plan", authMiddleware, selectPlan);

userRouter.get("/", authMiddleware, adminMiddleware, getAllUsers);
userRouter.delete("/:id", authMiddleware, adminMiddleware, deleteUser);
