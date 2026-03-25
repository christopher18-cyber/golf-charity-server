import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import {
	getAllMywinners,
	getMyWinnings,
	markAsPaid,
	uploadProof,
	verifyWinner,
} from "../controllers/winnersController.js";

export const winnerRouter = express.Router();

winnerRouter.get("/my-winnings", authMiddleware, getMyWinnings);
winnerRouter.put("/upload-proof/:id", authMiddleware, uploadProof);

winnerRouter.get(
	"/get-all-winners",
	authMiddleware,
	adminMiddleware,
	getAllMywinners,
);
winnerRouter.put("/verify/:id", authMiddleware, adminMiddleware, verifyWinner);
winnerRouter.put("/mark-paid/:id", authMiddleware, adminMiddleware, markAsPaid);

// {
//   "email": "admin@golfcharity.com",
//   "password": "admin123"
// }
