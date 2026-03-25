import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import {
	createDraws,
	getAllDraws,
	getPublishedDraws,
	getSingleDraw,
	publishDraws,
	runDraws,
} from "../controllers/drawController.js";

export const drawRouter = express.Router();

drawRouter.post("/create-draw", authMiddleware, adminMiddleware, createDraws);
drawRouter.get("/get-published", getPublishedDraws);
drawRouter.get("/get-single-draw/:id", getSingleDraw);
drawRouter.get("/get-all-draws", authMiddleware, adminMiddleware, getAllDraws);
drawRouter.post("/run/:id", authMiddleware, adminMiddleware, runDraws);
drawRouter.post("/publish/:id", authMiddleware, adminMiddleware, publishDraws);
