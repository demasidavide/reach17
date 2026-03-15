const express = require("express");
const router = express.Router();
const { authMiddleware, requireRole } = require("../middleware/auth");
const { validateId, validateName } = require("../middleware/validation");
const { asyncHandler } = require("../middleware/errorHandler");
const tipologiaController = require("../controllers/tipologiaController");


// GET / legge tutte le tipologie con paginazione
router.get(
  "/",
  asyncHandler(tipologiaController.getAll)
);
// GET /:id legge una tipologia per ID
router.get(
  "/:id",
  validateId(),
  asyncHandler(tipologiaController.getById)
);

// POST / crea una nuova tipologia
router.post(
  "/",
  authMiddleware,
  requireRole("admin"),
  validateName("nome", 3),
  asyncHandler(tipologiaController.create)
);

// PUT /:id aggiorna una tipologia
router.put(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  validateId(),
  validateName("nome", 3),
  asyncHandler(tipologiaController.update)
);

// DELETE /:id elimina una tipologia
router.delete(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  validateId(),
  asyncHandler(tipologiaController.deleteById)
);

module.exports = router;
