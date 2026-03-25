import Joi from "joi";

export function validateUserRegisterSchema(data) {
	const schema = Joi.object({
		email: Joi.string().email().required().messages({
			"string.email": "Please provide a valid email",
			"any.required": "Email is required",
		}),
		password: Joi.string().min(6).required().messages({
			"string.min": "Password must be at least 6 characters",
			"any.required": "Password is required",
		}),
	});

	return schema.validate(data);
}

export function validateUserLoginSchema(data) {
	const schema = Joi.object({
		email: Joi.string().email().required().messages({
			"string.email": "Please provide a valid email",
			"any.required": "Email is required",
		}),
		password: Joi.string().required().messages({
			"any.required": "Password is required",
		}),
	});

	return schema.validate(data);
}
