const express = require("express");
const pool = require("../db");
const { authMiddleware, requireRole } = require("../middleware/auth");
const logger = require("../logger");
const router = express.Router();
const { validateId, validateName } = require("../middleware/validation");
const {
  getPaginationParams,
  getPaginationMeta,
} = require("../utility/pagination");

//GET per leggere ateneo singolo da id--------------------------------------------
router.get("/:id", validateId(), async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`SELECT * FROM ateneo WHERE id = ?`, [id]);
    if (rows.length === 0) {
      logger.warn("GET /ateneo/:id - Ateneo non trovato", {
        id,
        user: req.user?.username,
      });
      return res.status(404).json({ error: "Ateneo non trovato" });
    }
    res.json({ data: rows[0] });
  } catch (error) {
    logger.error("Errore GET /ateneo/read", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "Errore nel database" });
  }
});
//--------------------------------------------------------------------------------
//GET per leggere tutti gli atenei------------------------------------------------
//aggiunto controllo totale righe,pagine,prew e next page
router.get("/", async (req, res) => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const [rows] = await pool.query(`SELECT * FROM ateneo LIMIT ? OFFSET ?`, [
      limit,
      offset,
    ]);
    const [countResult] = await pool.query(`
      SELECT COUNT(*) as total 
      FROM ateneo`);
    const total = countResult[0].total;
    const pagination = getPaginationMeta(total, page, limit);
    res.json({
      data: rows,
      pagination,
    });
  } catch (error) {
    logger.error("Errore GET /ateneo/read", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "Errore nel database" });
  }
});
//--------------------------------------------------------------------------------
//POST per creare un ateneo-------------------------------------------------------
//controlli:campo 'nome' vuoto- nome gia presente
router.post(
  "/",
  validateName("nome", 3),
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { nome } = req.body;
      const [readName] = await pool.query(
        "SELECT nome FROM ateneo WHERE nome = ? ",
        [nome],
      );
      if (readName.length > 0) {
        logger.warn(`POST /ateneo/add - Nome gia presente`, {
          nome,
          user: req.user?.username,
        });
        return res
          .status(409)
          .json({ error: `Attenzione nome ${nome} già presente` });
      }
      const [result] = await pool.query(
        `
        INSERT INTO ateneo (nome) VALUES (?)`,
        [nome],
      );

      const location = `${req.baseUrl}/${result.insertId}`;
      res
        .location(location)
        .status(201)
        .json({ data: { id: result.insertId, nome } });
    } catch (error) {
      logger.error("Errore POST /ateneo/add", {
        error: error.message,
        username: req.user?.username,
      });
      res.status(500).json({ error: "Errore database" });
    }
  },
);
//--------------------------------------------------------------------------------
//DELETE per cancellazione ateneo-------------------------------------------------
//passato con json e req.body
//controlli: id vuoto - id non convertibile in nuymero - id non trovato
router.delete(
  "/:id",
  validateId(),
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const [result] = await pool.query(
        `
      DELETE FROM ateneo WHERE id = ?`,
        [id],
      );
      if (result.affectedRows === 0) {
        logger.warn("DELETE /ateneo/delete - ID non trovato nel DB", {
          id,
          user: req.user?.username,
        });
        return res.status(404).json({ error: "Id non trovato" });
      }
      return res.status(204).end();
    } catch (error) {
      logger.error("Errore DELETE /ateneo/delete", {
        error: error.message,
      });
      res.status(500).json({ error: "Errore nel database" });
    }
  },
);
//--------------------------------------------------------------------------------
//PUT per modifica nome ateneo----------------------------------------------------
//controlli:id e nome vuoti - id non convertibile in numero - id non trovato
router.put(
  "/:id",
  validateId(),
  validateName("nome", 3),
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { nome } = req.body;
      const [result] = await pool.query(
        `UPDATE ateneo SET nome = ? WHERE id = ?`,
        [nome, id],
      );
      if (result.affectedRows === 0) {
        logger.warn("PUT /ateneo/mod - ID ateneo non trovato nel DB", {
          id,
          user: req.user?.username,
        });
        return res.status(404).json({ error: "Ateneo non trovato" });
      }
      res.json({ message: `Ateneo ${id} aggiornato con nome "${nome}"` });
    } catch (error) {
      logger.error("Errore PUT /ateneo/mod", {
        error: error.message,
        userId: req.user?.userId,
      });
      res.status(500).json({ error: "Errore nel database" });
    }
  },
);

module.exports = router;
