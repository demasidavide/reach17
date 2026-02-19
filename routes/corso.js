const express = require("express");
const pool = require("../db");
const { authMiddleware, requireRole } = require("../middleware/auth");
const logger = require("../logger");
const router = express.Router();    
const { validateId, validateName } = require("../middleware/validation");
const { getPaginationParams, getPaginationMeta } = require("../utility/pagination");

//GET per per leggere un corso in base a un id----------------------------
router.get("/:id", validateId(), async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`SELECT * FROM corso WHERE id = ?`, [id]);
    if (rows.length === 0) {
      logger.warn("GET /corsi/:id - Corso non trovato", {
        id,
        user: req.user?.username,
      });
      return res.status(404).json({ error: "Corso non trovato" });
    }
    res.json({ data: rows[0] });
  } catch (error) {
    logger.error("Errore GET /corso/:id", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "Errore nel database" });
  }
});
//------------------------------------------------------------------------
//GET per read corso e tipologia associata--------------------------------
//aggiunto controllo totale righe,pagine,prew e next page
router.get("/", async (req, res) => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
      const [rows] = await pool.query(
      `
        SELECT 
        corso.id AS id_corso,
        corso.nome AS nome_corso,
        tipologia_corso.id AS id_tipologia,
        tipologia_corso.nome AS nome_tipologia
        FROM corso INNER JOIN tipologia_corso 
        ON corso.tipologia_id=tipologia_corso.id
        LIMIT ? OFFSET ?;`,
      [limit, offset],
    );
    const [countResult] = await pool.query(`
      SELECT COUNT(*) as total 
      FROM corso`);
    const total = countResult[0].total;
    const pagination = getPaginationMeta(total, page, limit);
    res.json({ data: rows, pagination});
  } catch (error) {
    logger.error("Errore GET /corso/read", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "Errore nel database" });
  }
});
//------------------------------------------------------------------------
//POST transazione per aggiunta corso-------------------------------------
//controlli: id,nome vuoti - lettura se tipologia presente -
// lettura se nome corso gia presente
router.post("/", authMiddleware, requireRole("admin"), async (req, res) => {
  let conn;
  try {
    const { nome, id } = req.body;
    const tipologiaId = Number(id);
    if (!nome || typeof nome !== "string" || !tipologiaId) {
      logger.warn("POST /corso/add - Nome  o id non presente", {
        user: req.user?.username,
      });
      return res.status(400).json({ error: "Id o nome non valido" });
    }
    conn = await pool.getConnection();
    await conn.beginTransaction();
    //controllo se id tipologia esiste
    const [readTipo] = await conn.query(
      "SELECT id FROM tipologia_corso WHERE id = ?",
      [tipologiaId],
    );
    if (readTipo.length === 0) {
      await conn.rollback();
      logger.warn("POST /corso/add -transaction- Id tipologia non trovato", {
        user: req.user?.username,
      });
      return res
        .status(404)
        .json({ error: `Attenzione Id tipologia ${tipologiaId} non trovato` });
    }

    const [result] = await conn.query(
      "INSERT INTO corso (nome, tipologia_id) VALUES (?, ?)",
      [nome, tipologiaId],
    );

    const location = `${req.baseUrl}/${result.insertId}`;
    res.location(location);
    await conn.commit();
    res.status(201).json({ data: { id: result.insertId, nome, tipologiaId } });
  } catch (error) {
    if (conn) {
      try {
        await conn.rollback();
      } catch (e) {}
    }
    if (error.code === "ER_DUP_ENTRY") {
      logger.warn("POST /corso - Duplicato rilevato da DB", {
        nome,
        tipologiaId,
      });
      return res.status(409).json({
        error: `Corso "${nome}" con tipologia ${tipologiaId} già esistente`,
      });
    }
    logger.error("Errore POST /corso/add", {
      error: error.message,
      username: req.user?.username,
    });
    res.status(500).json({ error: "Errore nel database" });
  } finally {
    if (conn) conn.release();
  }
});
//------------------------------------------------------------------------
//DELETE per cancellazione corso-------------------------------------------------
//controlli: id vuoto - id non convertibile in numero - id non trovato
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
      DELETE FROM corso WHERE id = ?`,
        [id],
      );
      if (result.affectedRows === 0) {
        logger.warn("DELETE /corso/delete - Id non trovato", {
          id,
          user: req.user?.username,
        });
        return res.status(404).json({ error: "Id non trovato" });
      }
      res.status(204).end();
    } catch (error) {
      logger.error("Errore DELETE /corso/delete", {
        error: error.message,
      });
      res.status(500).json({ error: "Errore nel database" });
    }
  },
);
//--------------------------------------------------------------------------------
//PUT per modifica nome corso----------------------------------------------------
//controlli:id e nome vuoti - id non convertibile in numero - id non trovato
router.put(
  "/:id",
  validateId(),
  validateName("nome",1),
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { nome } = req.body;
      const { id } = req.params;
      const [result] = await pool.query(
        `UPDATE corso SET nome = ? WHERE id = ?`,
        [nome, corsoId],
      );
      if (result.affectedRows === 0) {
        logger.warn("PUT /corso/mod - Id corso non trovato", {
          corsoId,
          user: req.user?.username,
        });
        return res.status(404).json({ error: "Corso non trovato" });
      }
      res.json({ message: `Corso ${corsoId} aggiornato con nome "${nome}"` });
    } catch (error) {
      logger.error("Errore PUT /corso/mod", {
        error: error.message,
        userId: req.user?.userId,
      });
      res.status(500).json({ error: "Errore nel database" });
    }
  },
);

module.exports = router;
