const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../middleware/errorHandler");
const { validateLoginCredentials } = require("../middleware/validation");
const { authMiddleware } = require("../middleware/auth");
const authController = require("../controllers/authController");

router.post(
  "/login",
  validateLoginCredentials(),
  asyncHandler(authController.login),
);

router.get("/me", authMiddleware, asyncHandler(authController.getCurrentUser));

router.post("/verify", asyncHandler(authController.verifyToken));

module.exports = router;
