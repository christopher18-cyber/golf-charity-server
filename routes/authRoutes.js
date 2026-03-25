import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";

export const authRouter = express.Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
