import express from "express";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
	addCharity,
	deleteCharity,
	getAllCharities,
	getSingleCharity,
	updateCharity,
} from "../controllers/charityController.js";

export const charityRouter = express.Router();
charityRouter.get("/get-all-charities", getAllCharities);
charityRouter.get("/get-single-charities/:id", getSingleCharity);

charityRouter.post("/add-charity", authMiddleware, adminMiddleware, addCharity);
charityRouter.put(
	"/update-charity/:id",
	authMiddleware,
	adminMiddleware,
	updateCharity,
);
charityRouter.delete(
	"/delete-charity/:id",
	authMiddleware,
	adminMiddleware,
	deleteCharity,
);
