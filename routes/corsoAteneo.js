const express = require("express");
const router = express.Router();
const { authMiddleware, requireRole } = require("../middleware/auth");
const { validateMultipleIds, validateBodyId } = require("../middleware/validation");
const { asyncHandler } = require("../middleware/errorHandler");
const corsoAteneoController = require("../controllers/corsoAteneoController");

// GET / - Legge tutte le relazioni corso-ateneo
router.get("/", asyncHandler(corsoAteneoController.getAll));

// GET /search/name - Ricerca per nome corso
router.get("/search/name", asyncHandler(corsoAteneoController.searchByName));

// GET /search/type - Ricerca per tipologia
router.get("/search/type", asyncHandler(corsoAteneoController.searchByType));

// POST / - Crea una relazione corso-ateneo
router.post(
  "/",
  authMiddleware,
  requireRole("admin"),
  validateBodyId("idCorso"),
  validateBodyId("idAteneo"),
  asyncHandler(corsoAteneoController.create)
);

// DELETE /:corsoId/:ateneoId - Elimina una relazione
router.delete(
  "/:corsoId/:ateneoId",
  authMiddleware,
  requireRole("admin"),
  validateMultipleIds("corsoId", "ateneoId"),
  asyncHandler(corsoAteneoController.deleteRelation)
);

module.exports = router;
