
const express = require("express");
const router = express.Router();
const { authMiddleware, requireRole } = require("../middleware/auth");
const { validateId, validateName, validateBodyId } = require("../middleware/validation");
const { asyncHandler } = require("../middleware/errorHandler");
const corsoController = require("../controllers/corsoController");


// GET / - Legge tutti i corsi con paginazione
router.get(
  "/",
  asyncHandler(corsoController.getAll)
);
// GET /:id - Legge un corso per ID con tipologia
router.get(
  "/:id",
  validateId(),
  asyncHandler(corsoController.getById)
);

// POST / - Crea un nuovo corso
router.post(
  "/",
  authMiddleware,
  requireRole("admin"),
  validateName("nome", 1),
  validateBodyId("id"), // id della tipologia
  asyncHandler(corsoController.create)
);

// PUT /:id - Aggiorna un corso
router.put(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  validateId(),
  validateName("nome", 1),
  asyncHandler(corsoController.update)
);

// DELETE /:id - Elimina un corso
router.delete(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  validateId(),
  asyncHandler(corsoController.deleteById)
);

module.exports = router;
