import Joi from "joi";

export function drawValidator(data) {
	const schema = Joi.object({
		draw_date: Joi.date().required().messages({
			"any.required": "Draw date is required",
		}),
		jack_pool: Joi.number().optional(),
	});

	return schema.validate(data);
}
