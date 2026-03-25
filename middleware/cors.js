import cors from "cors";
import "dotenv/config";
export function configCors() {
	const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");

	return cors({
		origin: (origin, callback) => {
			if (!origin || allowedOrigins.indexOf(origin) != -1) {
				callback(null, true);
			} else {
				callback(new Error("Not allowed by cors"));
			}
		},

		methods: ["GET", "POST", "PUT", "DELETE"],
		allowedHeaders: ["Content-type", "Authorization", "Accept-Version"],
		exposedHeaders: ["X-Total-Count", "Content-Range"],
		credentials: true,
		// preflightContinue: false,
		maxAge: 600,
		optionsSuccessStatus: 204,
	});
}
