import express from "express";
import "dotenv/config";
import logger from "./utils/logger.js";
import supabase from "./config/supabase.js";
import { authRouter } from "./routes/authRoutes.js";
import { configCors } from "./middleware/cors.js";
import { scoreRouter } from "./routes/scoreRoutes.js";
import helmet from "helmet";
import { charityRouter } from "./routes/charityRoutes.js";
import { winnerRouter } from "./routes/winnerRoutes.js";
import { drawRouter } from "./routes/drawRoutes.js";
import { userRouter } from "./routes/userRoutes.js";
const app = express();

const PORT = process.env.PORT || 3000;
const { data, error } = await supabase.from("users").select("*");
console.log("DB connected ", data, error);

app.use(configCors());
app.use(express.json());
app.use(helmet());

app.use("/api/auth", authRouter);
app.use("/api/scores", scoreRouter);
app.use("/api/charities", charityRouter);
app.use("/api/winners", winnerRouter);
app.use("/api/draws", drawRouter);
app.use("/api/users", userRouter);

app.listen(PORT, () => {
	logger.info(`Server is listening in the port ${PORT}`);
});
