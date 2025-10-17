import { body, param } from "express-validator";
import mongoose from "mongoose";

const createProblemValidator = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isString()
    .withMessage("Title must be a string"),

  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isString()
    .withMessage("Description must be a string"),

  body("difficulty")
    .notEmpty()
    .withMessage("Difficulty is required")
    .isIn(["Easy", "Medium", "Hard"])
    .withMessage("Difficulty must be one of: Easy, Medium, Hard"),

  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array of strings"),

  body("tags.*").optional().isString().withMessage("Each tag must be a string"),

  body("author")
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Author must be a valid ObjectId"),

  body("testCases")
    .notEmpty()
    .withMessage("Test cases are required")
    .isArray({ min: 1 })
    .withMessage("Test cases must be an array with at least one test case"),

  body("testCases.*.input")
    .notEmpty()
    .withMessage("Each test case must have input")
    .isString()
    .withMessage("Test case input must be a string"),

  body("testCases.*.output")
    .notEmpty()
    .withMessage("Each test case must have output")
    .isString()
    .withMessage("Test case output must be a string"),
];

const patchProblemValidator = [
  param("id")
    .notEmpty()
    .withMessage("Problem ID is required")
    .isMongoId()
    .withMessage("Invalid Problem ID"),

  body("title")
    .optional()
    .notEmpty()
    .withMessage("Title cannot be empty")
    .isString()
    .withMessage("Title must be a string"),

  body("description")
    .optional()
    .notEmpty()
    .withMessage("Description cannot be empty")
    .isString()
    .withMessage("Description must be a string"),

  body("difficulty")
    .optional()
    .isIn(["Easy", "Medium", "Hard"])
    .withMessage("Difficulty must be one of: Easy, Medium, Hard"),

  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array of strings"),

  body("tags.*").optional().isString().withMessage("Each tag must be a string"),

  body("author")
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Author must be a valid ObjectId"),

  body("testCases")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Test cases must be an array with at least one test case"),

  body("testCases.*.input")
    .optional()
    .notEmpty()
    .withMessage("Each test case must have input")
    .isString()
    .withMessage("Test case input must be a string"),

  body("testCases.*.output")
    .optional()
    .notEmpty()
    .withMessage("Each test case must have output")
    .isString()
    .withMessage("Test case output must be a string"),
];

export { createProblemValidator, patchProblemValidator };
