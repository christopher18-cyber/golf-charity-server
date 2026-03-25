import supabase from "../config/supabase.js";
import logger from "../utils/logger.js";

export async function getMyWinnings(req, res) {
	logger.info("Get my winning endpoint hitted");
	try {
		const userId = req.user.id;
		const { data, error } = await supabase
			.from("winners")
			.select("*")
			.eq("user_id", userId)
			.order("created_at", { ascending: false });

		if (error) {
			return res.status(500).json({
				success: false,
				message: "Error fetching winnings",
			});
		} else {
			return res.status(200).json({
				success: true,
				message: "Winning fetched successfully.",
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

export async function getAllMywinners(req, res) {
	logger.info("Admin get all winners endpoint hitted.");
	try {
		const { data, error } = await supabase
			.from("winners")
			.select("*")
			.order("created_at", { ascending: false });
		if (error) {
			return res.status(500).json({
				success: false,
				message: "Error fetching winners",
			});
		} else {
			return res.status(200).json({
				success: false,
				message: "Winners fetched",
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

export async function uploadProof(req, res) {
	logger.info("User upload proof endpoint hitted");
	try {
		const userId = req.user.id;
		const { id } = req.params;
		const { proof_url } = req.body;

		if (!proof_url) {
			return res.status(400).json({
				success: false,
				message: "Proof Url is required.",
			});
		} else {
			const { data: winner } = await supabase
				.from("winners")
				.select("*")
				.eq("id", id)
				.eq("user_id", userId)
				.single();
			if (!winner) {
				return res.status(404).json({
					success: false,
					message: "Winner record not found.",
				});
			} else {
				if (winner.status !== "pending") {
					return res.status(400).json({
						success: false,
						message: "Proof already submitted",
					});
				} else {
					const { data, error } = await supabase
						.from("winners")
						.update({ proof_url })
						.eq("id", id)
						.select()
						.single();

					if (error) {
						return res.status(500).json({
							success: false,
							message: "Error uploading proof",
						});
					} else {
						return res.status(200).json({
							message: "Proof Uploaded succesfully",
							success: true,
							data,
						});
					}
				}
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

export async function verifyWinner(req, res) {
	logger.info("Admin verify winner endpoin hitted");
	try {
		const { id } = req.params;
		const { status } = req.body;
		if (!["approved", "rejected"].includes(status)) {
			return res.status(400).json({
				success: false,
				message: "Status must be approved or rejected",
			});
		}

		const { data: winner } = await supabase
			.from("winners")
			.select("*")
			.eq("id", id)
			.single();

		if (!winner) {
			return res.status(404).json({
				success: false,
				message: "Winner not found",
			});
		}

		if (!winner.proof_url) {
			return res.status(400).json({
				success: false,
				message: "Winner has not uploaded proof yet",
			});
		}

		const { data, error } = await supabase
			.from("winners")
			.update({ status })
			.eq("id", id)
			.select()
			.single();

		if (error) {
			return res.status(500).json({
				success: false,
				message: "Error verifying winner",
				error,
			});
		}

		return res.status(200).json({
			success: true,
			message: `Winner ${status} successfully`,
			data,
		});
	} catch (err) {
		logger.error("Server error", err);
		return res.status(500).json({
			success: false,
			message: "server error, pls try again.",
		});
	}
}

export async function markAsPaid(req, res) {
	logger.info("Mark as paid endpoint hitted");
	try {
		const { id } = req.params;

		const { data: winner } = await supabase
			.from("winners")
			.select("*")
			.eq("id", id)
			.single();

		if (!winner) {
			return res.status(404).json({
				success: false,
				message: "Winner not found",
			});
		}

		if (winner.status !== "approved") {
			return res.status(400).json({
				success: false,
				message: "Winner must be approved before marking as paid",
			});
		}

		const { data, error } = await supabase
			.from("winners")
			.update({ status: "paid" })
			.eq("id", id)
			.select()
			.single();

		if (error) {
			return res.status(500).json({
				success: false,
				message: "Error marking as paid",
				error,
			});
		}

		return res.status(200).json({
			success: true,
			message: "Winner marked as paid successfully",
			data,
		});
	} catch (err) {
		return res.status(500).json({
			success: false,
			message: "Server error, pls try again.",
		});
	}
}
