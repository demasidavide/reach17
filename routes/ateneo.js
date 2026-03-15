const express = require("express");
const router = express.Router();
const { authMiddleware, requireRole } = require("../middleware/auth");
const { validateId, validateName } = require("../middleware/validation");
const { asyncHandler } = require("../middleware/errorHandler");
const ateneoController = require("../controllers/ateneoController");


// GET / - Legge tutti gli atenei con paginazione
router.get(
  "/",
  asyncHandler(ateneoController.getAll)
);

// GET /:id - Legge un ateneo per ID
router.get(
  "/:id",
  validateId(),
  asyncHandler(ateneoController.getById)
);
// POST / - Crea un nuovo ateneo
router.post(
  "/",
  authMiddleware,
  requireRole("admin"),
  validateName("nome", 3),
  asyncHandler(ateneoController.create)
);

// PUT /:id - Aggiorna un ateneo
router.put(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  validateId(),
  validateName("nome", 3),
  asyncHandler(ateneoController.update)
);

// DELETE /:id - Elimina un ateneo
router.delete(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  validateId(),
  asyncHandler(ateneoController.deleteById)
);

module.exports = router;
