import "dotenv/config";

export function adminMiddleware(req, res, next) {
	if (req.user.role !== "admin") {
		return res.status(403).json({
			success: false,
			message: "Access denied, admin only",
		});
	}
	next();
}
