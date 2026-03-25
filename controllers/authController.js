import "dotenv/config";
import supabase from "../config/supabase.js";
import logger from "../utils/logger.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
	validateUserLoginSchema,
	validateUserRegisterSchema,
} from "../validators/authValidator.js";

export async function registerUser(req, res) {
	logger.info("Register user endpoint hitted.");
	try {
		const { error: validationError, value } = validateUserRegisterSchema(
			req.body,
		);
		if (validationError) {
			return res.status(400).json({
				success: false,
				message: validationError?.details?.[0]?.message,
			});
		} else {
			const { email, password } = value;
			const { data: existingUsers, error } = await supabase
				.from("users")
				.select("*")
				.eq("email", email)
				.single();
			if (existingUsers) {
				return res.status(400).json({
					success: false,
					message: "Email alreaady registered",
				});
			} else {
				const hashedPassword = await bcrypt.hash(password, 10);

				const { data, error } = await supabase
					.from("users")
					.insert([{ email, password: hashedPassword }])
					.select()
					.single();

				if (error) {
					return res.status(500).json({
						message: "Error creating user",
						error,
						success: false,
					});
				} else {
					const token = jwt.sign(
						{ id: data.id, role: data.role },
						process.env.JWT_SECRET,
						{ expiresIn: "7d" },
					);
					res.status(201).json({
						success: true,
						message: "User registered successfully.",
						token,
						user: { id: data.id, email: data.email, role: data.role },
					});
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

export async function loginUser(req, res) {
	logger.info("Login user endpoint hitted.");
	try {
		const { value, error: validationError } = validateUserLoginSchema(req.body);
		if (validationError) {
			return res.status(400).json({
				success: false,
				message: validationError?.details?.[0]?.message,
			});
		} else {
			const { password, email } = value;

			const { data: user } = await supabase
				.from("users")
				.select("*")
				.eq("email", email)
				.single();

			if (!user) {
				return res.status(400).json({
					success: false,
					message: "Invalid email or password",
				});
			} else {
				const isMatch = await bcrypt.compare(password, user.password);
				if (!isMatch) {
					return res.status(400).json({
						message: "Invalid email or password",
						success: false,
					});
				} else {
					const token = jwt.sign(
						{ id: user.id, role: user.role },
						process.env.JWT_SECRET,
						{ expiresIn: "7d" },
					);

					return res.status(200).json({
						success: true,
						message: "Login successful",
						token,
						user: { id: user.id, email: user.email, role: user.role },
					});
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
