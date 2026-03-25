import "dotenv/config";
import winston from "winston";

const logger = winston.createLogger({
	level: process.env.NODE_ENV === "production" ? "info" : "debug",
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.json(),
		winston.format.errors({ stacks: true }),
		winston.format.splat(),
	),
	defaultMeta: { service: "LOTTERY_PROJECT" },
	transports: [
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.simple(),
			),
		}),
		new winston.transports.File({
			filename: "error.log",
			level: "error",
		}),
		new winston.transports.File({
			filename: "combined.log",
		}),
	],
});

export default logger;
