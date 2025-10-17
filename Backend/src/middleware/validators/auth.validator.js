import { body } from "express-validator";
import User from "../../models/user.model.js";

const uniqueUsernameValidator = async (value, { req }) => {
  const user = await User.findOne({
    username: { $regex: new RegExp(`^${value}$`, "i") },
  });
  if (user) {
    if (!req.user) {
      throw new Error("Username already exists");
    }

    if (user._id.toString() !== req.user._id.toString()) {
      throw new Error("Username already exists");
    }
  }
  return true;
};

const uniqueEmailValidator = async (value, { req }) => {
  const user = await User.findOne({ email: value });
  if (user) {
    if (!req.user) {
      throw new Error("Email already exists");
    }

    if (user._id.toString() !== req.user._id.toString()) {
      throw new Error("Email already exists");
    }
  }

  return true;
};

const signupValidator = [
  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be at least 3 and at most 20 characters long")
    .matches(/^[a-zA-Z0-9_]{3,30}$/)
    .withMessage("Username must only contain letters, numbers, and underscores")
    .custom(uniqueUsernameValidator),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail()
    .custom((value) => {
      if (!value.endsWith("@gmail.com")) {
        throw new Error("Email must end with @gmail.com");
      }
      return true;
    })
    .custom(uniqueEmailValidator),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  // ✅ Safe replacement for .isURL()
  body("profilePicture")
    .optional()
    .custom((value) => {
      try {
        const url = new URL(value);
        // Only allow http/https URLs for safety
        if (!["http:", "https:"].includes(url.protocol)) {
          throw new Error();
        }
        return true;
      } catch {
        throw new Error("Profile picture must be a valid URL");
      }
    })
    .matches(/\.(jpg|jpeg|png|gif)$/i)
    .withMessage("Profile picture must be a valid image"),
];


const loginValidator = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail()
    .custom((value) => {
      if (!value.endsWith("@gmail.com")) {
        throw new Error("Email must end with @gmail.com");
      }
      return true;
    }),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

const updateProfileValidator = [
  body("username")
    .optional()
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be at least 3 and at most 20 characters long")
    .matches(/^[a-zA-Z0-9_]{3,30}$/)
    .withMessage("Username must only contain letters, numbers, and underscores")
    .custom(uniqueUsernameValidator),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail()
    .custom((value) => {
      if (!value.endsWith("@gmail.com")) {
        throw new Error("Email must end with @gmail.com");
      }
      return true;
    })
    .custom(uniqueEmailValidator),
  // .matches(/\.(jpg|jpeg|png|gif)$/i)
  // .withMessage("Profile picture must be a valid image"),
];

export { signupValidator, loginValidator, updateProfileValidator };
