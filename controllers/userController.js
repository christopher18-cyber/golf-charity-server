import supabase from "../config/supabase.js";
import logger from "../utils/logger.js";
import Joi from "joi";

export async function getMyProfile(req, res) {
	logger.info("Get my profile endpoint hitted");
	try {
		const userId = req.user.id;

		const { data, error } = await supabase
			.from("users")
			.select(
				"id, email, role, plan, plan_status, charity, charity_pct, created_at",
			)
			.eq("id", userId)
			.single();

		if (error || !data) {
			return res.status(404).json({
				success: false,
				message: "User not found",
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

// SELECT CHARITY
export async function selectCharity(req, res) {
	logger.info("Select charity endpoint hitted");
	try {
		const userId = req.user.id;
		const { charity_id, charity_pct } = req.body;

		// Validate
		const schema = Joi.object({
			charity_id: Joi.string().required().messages({
				"any.required": "Charity ID is required",
			}),
			charity_pct: Joi.number().integer().min(10).max(100).optional().messages({
				"number.min": "Charity percentage must be at least 10%",
				"number.max": "Charity percentage cannot exceed 100%",
			}),
		});

		const { error: validationError, value } = schema.validate(req.body);

		if (validationError) {
			return res.status(400).json({
				success: false,
				message: validationError?.details?.[0]?.message,
			});
		}

		// Check charity exists
		const { data: charity } = await supabase
			.from("charities")
			.select("*")
			.eq("id", value.charity_id)
			.single();

		if (!charity) {
			return res.status(404).json({
				success: false,
				message: "Charity not found",
			});
		}

		// Update user
		const { data, error } = await supabase
			.from("users")
			.update({
				charity: value.charity_id,
				charity_pct: value.charity_pct || 10,
			})
			.eq("id", userId)
			.select()
			.single();

		if (error) {
			return res.status(500).json({
				success: false,
				message: "Error selecting charity",
				error,
			});
		}

		return res.status(200).json({
			success: true,
			message: "Charity selected successfully",
			data,
		});
	} catch (err) {
		return res.status(500).json({
			success: false,
			message: "Server error, pls try again.",
		});
	}
}

// SELECT PLAN
export async function selectPlan(req, res) {
	logger.info("Select plan endpoint hitted");
	try {
		const userId = req.user.id;

		const schema = Joi.object({
			plan: Joi.string().valid("monthly", "yearly").required().messages({
				"any.only": "Plan must be monthly or yearly",
				"any.required": "Plan is required",
			}),
		});

		const { error: validationError, value } = schema.validate(req.body);

		if (validationError) {
			return res.status(400).json({
				success: false,
				message: validationError?.details?.[0]?.message,
			});
		}

		const { data, error } = await supabase
			.from("users")
			.update({
				plan: value.plan,
				plan_status: "active",
			})
			.eq("id", userId)
			.select()
			.single();

		if (error) {
			return res.status(500).json({
				success: false,
				message: "Error selecting plan",
				error,
			});
		}

		return res.status(200).json({
			success: true,
			message: "Plan selected successfully",
			data,
		});
	} catch (err) {
		return res.status(500).json({
			success: false,
			message: "Server error, pls try again.",
		});
	}
}

// GET ALL USERS (admin only)
export async function getAllUsers(req, res) {
	logger.info("Get all users endpoint hitted");
	try {
		const { data, error } = await supabase
			.from("users")
			.select(
				"id, email, role, plan, plan_status, charity, charity_pct, created_at",
			)
			.order("created_at", { ascending: false });

		if (error) {
			return res.status(500).json({
				success: false,
				message: "Error fetching users",
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

// DELETE USER (admin only)
export async function deleteUser(req, res) {
	logger.info("Delete user endpoint hitted");
	try {
		const { id } = req.params;

		const { data: user } = await supabase
			.from("users")
			.select("*")
			.eq("id", id)
			.single();

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		await supabase.from("users").delete().eq("id", id);

		return res.status(200).json({
			success: true,
			message: "User deleted successfully",
		});
	} catch (err) {
		return res.status(500).json({
			success: false,
			message: "Server error, pls try again.",
		});
	}
}
