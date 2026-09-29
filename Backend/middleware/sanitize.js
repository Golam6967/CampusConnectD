const { body } = require("express-validator");

exports.validateFeedback = [
    body("category").notEmpty().withMessage("Category is required"),
    body("message")
        .trim()
        .notEmpty()
        .withMessage("Message is required")
        .isLength({ min: 5 })
        .withMessage("Message must be at least 5 characters long"),
    body("title").optional().trim().escape()
];

exports.validateComment = [
    body("message")
        .trim()
        .notEmpty()
        .withMessage("Comment message is required")
        .isLength({ min: 1, max: 500 })
        .withMessage("Comment must be between 1 and 500 characters"),
    body("author")
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage("Author name must not exceed 50 characters")
        .escape()
];
