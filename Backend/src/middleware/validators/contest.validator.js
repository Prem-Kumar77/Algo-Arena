import { body, param } from "express-validator";
import mongoose from "mongoose";

// Validator for creating a contest
const contestCreationValidator = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isString()
    .withMessage("Title must be a string"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),

  body("startTime")
    .isISO8601()
    .withMessage("Invalid start time")
    .custom((value) => new Date(value) > new Date())
    .withMessage("Start time must be in the future"),

  body("endTime")
    .isISO8601()
    .withMessage("Invalid end time")
    .custom((value, { req }) => new Date(value) > new Date(req.body.startTime))
    .withMessage("End time must be after start time"),

  body("problems")
    .isArray({ min: 3 })
    .withMessage("At least 3 problems are required"),

  body("problems.*.problem")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Each problem must have a valid ObjectId"),

  body("problems.*.points")
    .optional()
    .isNumeric()
    .withMessage("Points must be a number"),
];

// Validator for updating a contest
const contestUpdateValidator = [
  body("title")
    .optional()
    .notEmpty()
    .withMessage("Title cannot be empty")
    .isString()
    .withMessage("Title must be a string"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),

  body("startTime")
    .optional()
    .isISO8601()
    .withMessage("Invalid start time")
    .custom((value) => new Date(value) > new Date())
    .withMessage("Start time must be in the future"),

  body("endTime")
    .optional()
    .isISO8601()
    .withMessage("Invalid end time")
    .custom(async (value, { req }) => {
      let startTime = req.body.startTime;

      // If startTime not provided in request, fetch it from DB
      if (!startTime && req.params.id) {
        const contest = await mongoose
          .model("Contest")
          .findById(req.params.id)
          .lean();
        if (contest) {
          startTime = contest.startTime;
        }
      }

      if (startTime && new Date(value) <= new Date(startTime)) {
        throw new Error("End time must be after start time");
      }
      return true;
    }),

  body("problems")
    .optional()
    .isArray({ min: 3 })
    .withMessage("At least 3 problems are required"),

  body("problems.*.problem")
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Each problem must have a valid ObjectId"),

  body("problems.*.points")
    .optional()
    .isNumeric()
    .withMessage("Points must be a number"),
];

const submitCodeValidator = [
  param("problemId")
    .notEmpty()
    .withMessage("Problem ID is required")
    .isMongoId()
    .withMessage("Invalid Problem ID"),

  param("id")
    .notEmpty()
    .withMessage("Contest ID is required")
    .isMongoId()
    .withMessage("Invalid Contest ID"),

  body("code")
    .notEmpty()
    .withMessage("Code is required")
    .isString()
    .withMessage("Code must be a string"),

  body("language")
    .notEmpty()
    .withMessage("Language is required")
    .isIn(["cpp", "python", "java"])
    .withMessage("Language must be one of: cpp, python, java"),
];

export {
  contestCreationValidator,
  contestUpdateValidator,
  submitCodeValidator,
};
