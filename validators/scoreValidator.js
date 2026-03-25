import Joi from "joi";

export function validateScoreSchema(data) {
	const schema = Joi.object({
		score: Joi.number().integer().min(1).max(45).required().messages({
			"number.min": "score must be at least 1",
			"number.max": "Score must not be greater than 45",
			"any.required": "Score is required.",
		}),
	});
	return schema.validate(data);
}
