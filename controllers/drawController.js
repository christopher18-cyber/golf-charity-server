import { drawValidator } from "../validators/drawValidator.js";
import supabase from "../config/supabase.js";
import { countMatches } from "../helpers/countMatches.js";
import { generateDrawNumbers } from "../helpers/generateDrawNumbers.js";
import logger from "../utils/logger.js";

export async function createDraws(req, res) {
	logger.info("Create draw endpoint hitted");
	try {
		// const { value, error: validationError } = drawValidator(req.body);
		// return res.status(400).json({
		// 	success: false,
		// 	message: validationError?.details?.[0]?.message,
		// });
		const draw_date = new Date().toISOString().split("T")[0];
		const drawn_numbers = generateDrawNumbers();

		const { count } = await supabase
			.from("users")
			.select("*", { count: "exact" })
			.eq("plan_status", "active");

		const subscriptionFee = 10;
		const totalPool = (count || 0) * subscriptionFee;
		const jackpot_pool = totalPool * 0.4;

		const { data, error } = await supabase
			.from("draws")
			.insert([{ draw_date, drawn_numbers, jackpot_pool, status: "pending" }])
			.select()
			.single();

		if (error) {
			return res.status(500).json({
				success: false,
				message: "Error creating draw",
				error,
			});
		} else {
			return res.status(201).json({
				success: true,
				message: "Draw created successfullly",
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

export async function runDraws(req, res) {
	logger.info("Run draws endpoint hitted");
	try {
		const { id } = req.params;

		const { data: draw } = await supabase
			.from("draws")
			.select("*")
			.eq("id", id)
			.single();

		if (!draw) {
			return res.status(404).json({
				success: false,
				message: "Draw not found.",
			});
		} else {
			if (draw.status !== "pending") {
				return res.status(400).json({
					success: false,
					message: "Draw has already been run",
				});
			} else {
				const { data: subscribers } = await supabase
					.from("users")
					.select("id")
					.eq("plan_status", "active");

				const activeSubscribers = subscribers || [];
				if (activeSubscribers.length === 0) {
					return res.status(400).json({
						success: false,
						message: "No active subscribers",
					});
				} else {
					const totalPool = Number(draw.jackpot_pool) / 0.4;
					const jackpotShare = totalPool * 0.4;
					const fourMatchShare = totalPool * 0.35;
					const threeMatchShare = totalPool * 0.25;

					const winners = [];

					for (const subscriber of activeSubscribers) {
						const { data: userScores } = await supabase
							.from("scores")
							.select("score")
							.eq("user_id", subscriber.id);

						const userScoreList = userScores || [];
						const matched = userScoreList.filter((s) =>
							draw.drawn_numbers.includes(s.score),
						).length;

						if (matched >= 3) {
							winners.push({ user_id: subscriber.id, matched });
						}
					}
					const fiveMatches = winners.filter((w) => w.matched === 5);
					const fourMatches = winners.filter((w) => w.matched === 4);
					const threeMatches = winners.filter((w) => w.matched === 3);

					const fivePrize =
						fiveMatches.length > 0 ? jackpotShare / fiveMatches.length : 0;
					const fourPrize =
						fourMatches.length > 0 ? fourMatchShare / fourMatches.length : 0;
					const threePrize =
						threeMatches.length > 0 ? threeMatchShare / threeMatches.length : 0;

					const entries = winners.map((w) => ({
						draw_id: id,
						user_id: w.user_id,
						matched: w.matched,
						prize_won:
							w.matched === 5
								? fivePrize
								: w.matched === 4
									? fourPrize
									: threePrize,
					}));
					if (entries.length > 0) {
						await supabase.from("draw_entries").insert(entries);
					}
					const jackpotRolledOver = fiveMatches.length === 0;
					if (jackpotRolledOver) {
						const { data: nextDraw } = await supabase
							.from("draws")
							.select("*")
							.eq("status", "pending")
							.neq("id", id)
							.order("draw_date", { ascending: true })
							.limit(1)
							.single();
						if (nextDraw) {
							await supabase
								.from("draws")
								.update({
									jackpot_pool: Number(nextDraw.jackpot_pool) + jackpotShare,
								})
								.eq("id", nextDraw.id);
						}
					} else {
						await supabase
							.from("draws")
							.update({ status: "simulated" })
							.eq("id", id);

						return res.status(200).json({
							success: true,
							message: "Draw simulated successfully",
							data: {
								drawn_numbers: draw.drawn_numbers,
								total_winners: draw.winners,
								five_match_winners: fiveMatches.length,
								four_match_winners: fourMatches.length,
								three_match_winners: threeMatches.length,
								jackpot_rolled_over: jackpotRolledOver,
							},
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

export async function getSingleDraw(req, res) {
	logger.info("Get single draw endpoint hitted");
	try {
		const { id } = req.params;

		const { data, error } = await supabase
			.from("draws")
			.select("*")
			.eq("id", id)
			.single();

		if (error || !data) {
			return res.status(404).json({
				success: false,
				message: "Draw not found",
			});
		} else {
			return res.status(200).json({
				success: true,
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

export async function getAllDraws(req, res) {
	logger.info("Get all draws endpoint hitted");
	try {
		const { data, error } = await supabase
			.from("draws")
			.select("*")
			.order("created_at", { ascending: false });
		if (error) {
			return res.status(500).json({
				success: false,
				message: "Error fetching draws",
				error,
			});
		} else {
			return res.status(200).json({
				success: true,
				message: "Draws drawn successfully",
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

export async function publishDraws(req, res) {
	logger.info("Publish draw endpoint hitted");
	try {
		const { id } = req.params;

		const { data: draw } = await supabase
			.from("draws")
			.select("*")
			.eq("id", id)
			.single();
		if (!draw) {
			return res.status(404).json({
				success: false,
				message: "Draw not found",
			});
		} else {
			if (draw.status !== "simulated") {
				return res.status(400).json({
					success: false,
					message: "Draw must be simulated before publiishing",
				});
			} else {
				const { data: entries } = await supabase
					.from("draw_entries")
					.select("*")
					.eq("draw_id", id);

				const winnerEntries = entries || [];

				if (winnerEntries.length > 0) {
					const winnersToInsert = winnerEntries.map((e) => ({
						draw_id: e.draw_id,
						user_id: e.user_id,
						match_type: e.matched,
						prize_amount: e.prize_won,
						status: "pending",
					}));

					await supabase.from("winners").insert(winnersToInsert);
				}
				await supabase
					.from("draws")
					.update({ status: "published" })
					.eq("id", id);

				return res.status(200).json({
					success: true,
					message: "Draw published successfully",
					data: {
						total_winners: winnerEntries.length,
					},
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

// GET PUBLISHED DRAWS (public)
export async function getPublishedDraws(req, res) {
	logger.info("Get published draws endpoint hitted");
	try {
		const { data, error } = await supabase
			.from("draws")
			.select("*")
			.eq("status", "published")
			.order("created_at", { ascending: false });

		if (error) {
			return res.status(500).json({
				success: false,
				message: "Error fetching draws",
				error,
			});
		}

		return res.status(200).json({
			success: true,
			data,
		});
	} catch (err) {
		return res.status(500).json({
			success: false,
			message: "Server error, pls try again.",
		});
	}
}
