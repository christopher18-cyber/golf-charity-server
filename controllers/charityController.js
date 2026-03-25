import supabase from "../config/supabase.js";
import logger from "../utils/logger.js";
import { charitiesValidator } from "../validators/charitiesValidator.js";

export async function getAllCharities(req, res) {
	logger.info("get all charities endpoint hitted");
	try {
		const { data, error } = await supabase
			.from("charities")
			.select("*")
			.order("created_at", { ascending: false });
		if (error) {
			return res.status(500).json({
				success: false,
				message: "Error fetvhing charities",
				error,
			});
		} else {
			return res.status(200).json({
				success: true,
				data,
			});
		}
	} catch (error) {
		logger.error("Server error", error);
		return res.status(500).json({
			success: false,
			message: "server error, pls try again.",
		});
	}
}

export async function getSingleCharity(req, res) {
	logger.info("Get a single charity endpoint hitted");
	try {
		const { id } = req.params;

		const { data, error } = await supabase
			.from("charities")
			.select("*")
			.eq("id", id)
			.single();

		if (error || !data) {
			return res.status(404).json({
				success: false,
				message: "Charity not found",
			});
		} else {
			res.status(200).json({
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

export async function addCharity(req, res) {
	logger.info("Admin add charity endpoint hitted");
	try {
		const { value, error: validationError } = charitiesValidator(req.body);
		if (validationError) {
			return res.status(400).json({
				success: false,
				message: validationError?.details?.[0]?.message,
			});
		} else {
			const { data, error } = await supabase
				.from("charities")
				.insert([value])
				.select()
				.single();
			if (error) {
				return res.status(500).json({
					success: false,
					message: "Error adding charity",
					error,
				});
			} else {
				res.status(201).json({
					success: true,
					message: "Charity added successfully",
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

export async function updateCharity(req, res) {
	logger.info("Admin update charity endpoint hitted");
	try {
		const { id } = req.params;
		const { value, error: validationError } = charitiesValidator(req.body);
		if (validationError) {
			return res.status(400).json({
				success: false,
				message: validationError?.details?.[0]?.message,
			});
		} else {
			const { data, error } = await supabase
				.from("charities")
				.update(value)
				.eq("id", id)
				.select()
				.single();

			if (error || !data) {
				return res.status(404).json({
					message: "Charity not found",
					success: false,
				});
			} else {
				return res.status(200).json({
					success: true,
					message: "Charity updated successfully.",
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

export async function deleteCharity(req, res) {
	logger.info("Admin delete charity endpoint hitted");
	try {
		const { id } = req.params;
		const { data: existing } = await supabase
			.from("charities")
			.select("*")
			.eq("id", id)
			.single();
		if (!existing) {
			return res.status(404).json({
				success: false,
				message: "Charity not found",
			});
		} else {
			await supabase.from("charities").delete().eq("id", id);

			return res.status(200).json({
				success: true,
				message: "Charity deleted succesffuly",
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
