import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
	addScore,
	deleteScore,
	getMyScores,
} from "../controllers/scoreController.js";
export const scoreRouter = express.Router();

scoreRouter.post("/", authMiddleware, addScore);
scoreRouter.get("/", authMiddleware, getMyScores);
scoreRouter.delete("/:id", authMiddleware, deleteScore);
