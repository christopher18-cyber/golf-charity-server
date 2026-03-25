import Joi from "joi";

export function charitiesValidator(data) {
	const schema = Joi.object({
		name: Joi.string()
			.required()
			.messages({ "any.message": "Charity name is required" }),
		description: Joi.string().optional(),
		image_url: Joi.string().uri().optional().messages({
			"string.uri": "Image URL must be a valid URL",
		}),
		is_featured: Joi.boolean().optional(),
	});

	return schema.validate(data);
}
