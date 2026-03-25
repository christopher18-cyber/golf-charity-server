import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
	addScore,
	deleteScore,
	getMyScores,
} from "../controllers/scoreController.js";
export const scoreRouter = express.Router();

scoreRouter.post("/add-score", authMiddleware, addScore);
scoreRouter.get("/get-score", authMiddleware, getMyScores);
scoreRouter.delete("/delete-score/:id", authMiddleware, deleteScore);
