import supabase from "../config/supabase.js";
import { validateScoreSchema } from "../validators/scoreValidator.js";
import logger from "../utils/logger.js";

export async function addScore(req, res) {
	logger.info("Add score endpoint hitted.");
	try {
		const { error: validationError, value } = validateScoreSchema(req.body);
		if (validationError) {
			return res.status(400).json({
				success: false,
				message: validationError?.details?.[0]?.message,
			});
		} else {
			const { score } = value;
			const played_on = new Date().toISOString().split("T")[0];
			const userId = req.user.id;

			const { data: currentScores } = await supabase
				.from("scores")
				.select("*")
				.eq("user_id", userId)
				.order("created_at", { ascending: true });
			const scores = currentScores || [];
			if (scores.length >= 5) {
				const oldest = scores[0];
				await supabase.from("scores").delete().eq("id", oldest.id);
			}
			const { data, error } = await supabase
				.from("scores")
				.insert([{ user_id: userId, score, played_on }])
				.select()
				.single();
			if (error) {
				return res.status(500).json({
					success: false,
					message: "Error adding score",
					error,
				});
			} else {
				return res.status(201).json({
					success: true,
					message: "Score added successfully",
					data,
				});
			}
		}
	} catch (err) {
		logger.error("Server error", err);
		return res.status(500).json({
			success: false,
			message: "server error, pls try again.",
		});
	}
}

export async function getMyScores(req, res) {
	logger.info("Get my score endpoint hiited");
	try {
		const userId = req.user.id;

		const { data, error } = await supabase
			.from("scores")
			.select("*")
			.eq("user_id", userId)
			.order("played_on", { ascending: false });

		if (error) {
			return res.status(500).json({
				success: false,
				message: "Error fetching scores",
			});
		} else {
			return res.status(200).json({
				success: true,
				message: "Scores successfully retrieved",
				data,
			});
		}
	} catch (err) {
		logger.error("Server error", err);
		return res.status(500).json({
			success: false,
			message: "server error, pls try again.",
		});
	}
}

export async function deleteScore(req, res) {
	logger.info("Delete score endpoint hitted.");
	try {
		const { id } = req.params;
		const userId = req.user.id;

		const { data: score } = await supabase
			.from("scores")
			.select("*")
			.eq("id", id)
			.eq("user_id", userId)
			.single();

		if (!score) {
			return res.status(404).json({
				success: false,
				message: "Score not found",
			});
		} else {
			await supabase.from("scores").delete().eq("id", id);
			return res.status(200).json({
				success: true,
				message: "Score deleted successfully.",
			});
		}
	} catch (err) {
		logger.error("Server error", err);
		return res.status(500).json({
			success: false,
			message: "server error, pls try again.",
		});
	}
}
