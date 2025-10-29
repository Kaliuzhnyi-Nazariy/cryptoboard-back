import joi from "joi";

export const userSignUp = joi.object({
  name: joi.string().min(3).max(24).required(),
  email: joi.string().email().required(),
  password: joi
    .string()
    .pattern(
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must be at least 6 characters long, contain at least one uppercase letter, one number, and one special character.",
      "any.required": "Password is required",
    }),
  confirmPassword: joi
    .string()
    .pattern(
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must be at least 6 characters long, contain at least one uppercase letter, one number, and one special character.",
      "any.required": "Password is required",
    }),
});

export const userSignIn = joi.object({
  email: joi.string().email().required(),
  password: joi
    .string()
    .pattern(
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must be at least 6 characters long, contain at least one uppercase letter, one number, and one special character.",
      "any.required": "Password is required",
    }),
});
