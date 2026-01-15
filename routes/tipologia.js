const express = require("express");
const pool = require("../db");
const { authMiddleware, requireRole } = require('../middleware/auth');
const logger = require('../logger');
const router = express.Router();

//GET per per leggere una tipologia in base a un id----------------------------
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if(!id || isNaN(id)){
      logger.warn('GET /tipologie/:id - Id non valido', { user: req.user?.username });
      res.status(400).json({ error: "Id vuoto o non valido" });
      return;
    }
    const [row] = await pool.query(`SELECT * FROM tipologia_corso WHERE id = ?`, [id]);
    if (row.length === 0) {
  logger.warn('GET /tipologie/:id - Tipologia non trovata', { id, user: req.user?.username });
  return res.status(404).json({ error: "Tipologia non trovata" });
    }
  res.json(row);
  } catch (error) {
    logger.error('Errore GET /tipologie/:id', { 
      error: error.message, 
      stack: error.stack 
    });
    res.status(500).json({ error: "Errore nel database" });
  }
});
//------------------------------------------------------------------------

//GET per leggere tutte le tipologie------------------------------------------------
//aggiunto controllo totale righe,pagine,prew e next page
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const [rows] = await pool.query(
      `
        SELECT * FROM tipologia_corso LIMIT ? OFFSET ?;`,
      [limit, offset]
    );
    const [countResult] = await pool.query(`
      SELECT COUNT(*) as total 
      FROM tipologia_corso`);
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    logger.error('Errore GET /tipologia/read', { 
      error: error.message, 
      stack: error.stack 
    });
    res.status(500).json({ error: "Errore nel database" });
  }
});
//--------------------------------------------------------------------------------
//POST per creare una tipologia---------------------------------------------------
//controlli:campo 'nome' vuoto-
router.post("/", authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { nome } = req.body;
    if (!nome) {
      logger.warn('POST /tipologia/add - Nome non valido', { user: req.user?.username });
      res.status(400).json({ error: "Campo 'nome' vuoto o non valido" });
      return;
    }
    const [readName] = await conn.query(
        "SELECT nome FROM tipologia_corso WHERE nome = ? ",[nome]);
        if(readName.length > 0){
          logger.warn(`POST /tipologia_corso/add - Nome gia presente`, {nome, user: req.user?.username });
            return res.status(409).json({error: `Attenzione nome ${nome} già presente`});
        }

    const [result] = await pool.query(
      `
        INSERT INTO tipologia_corso (nome) VALUES (?)`,
      nome
    );
    res.status(201).json({
      message: `Tipologia ${nome} con Id ${result.insertId} creata con successo`,
    });
  } catch (error) {
    logger.error('Errore POST /tipologia/add', { 
      error: error.message,
      username: req.user?.username 
    });
    res.status(500).json({ error: "Errore database" });
  }
});
//--------------------------------------------------------------------------------
//DELETE per cancellazione tipologia-------------------------------------------------
//passato con json e req.body
//controlli: id vuoto - id non convertibile in numero - id non trovato
router.delete("/:id", authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      logger.warn('DELETE /tipologia/delete - Id non valido', { user: req.user?.username });
      res.status(400).json({ error: "Id non trovato o non valido" });
      return;
    }
    const [result] = await pool.query(
      `
      DELETE FROM tipologia_corso WHERE id = ?`,
      [id]
    );
    if (result.affectedRows === 0) {
      logger.warn('DELETE /tipologia/delete - Id non trovato', { id,user: req.user?.username });
      return res.status(404).json({ error: "Id non trovato" });
    }
    res.json({ message: `Tipologia con Id ${id} eliminata` });
  } catch (error) {
    logger.error('Errore DELETE /tipologia/delete', { 
      error: error.message 
    });
    res.status(500).json({ error: "Errore nel database" });
  }
});
//--------------------------------------------------------------------------------
//PUT per modifica nome tipologia----------------------------------------------------
//controlli:id e nome vuoti - id non convertibile in numero - id non trovato
router.put("/:id", authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { nome } = req.body;
    const { id } = req.params;
    if (!id || !nome || isNaN(id)) {
      logger.warn('PUT /tipologia/mod - Id o Nome non valido', { user: req.user?.username });
      res.status(400).json({ error: "Id o nome non valido" });
      return;
    }
    const [result] = await pool.query(
      `UPDATE tipologia_corso SET nome = ? WHERE id = ?`,
      [nome, id]
    );
    if (result.affectedRows === 0) {
      logger.warn('PUT /tipologia/mod - Id o Nome non trovato', { id,nome,user: req.user?.username });
      return res.status(404).json({ error: "Tipologia non trovata" });
    }
    res.json({ message: `Tipologia ${id} aggiornata con nome "${nome}"` });
  } catch (error) {
    logger.error('Errore PUT /tipologia/mod', { 
      error: error.message,
      userId: req.user?.userId 
    });
    res.status(500).json({ error: "Errore nel database" });
  }
});
module.exports = router;
