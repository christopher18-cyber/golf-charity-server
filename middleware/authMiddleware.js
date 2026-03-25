import jwt from "jsonwebtoken";
import "dotenv/config";

export function authMiddleware(req, res, next) {
	try {
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			return res.status(401).json({
				success: false,
				message: "No token, access denied",
			});
		}
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded;
		next();
	} catch (err) {
		return res.status(401).json({
			success: false,
			message: "Invalid token",
		});
	}
}
