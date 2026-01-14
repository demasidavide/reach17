const express = require("express");
const pool = require("../db");
const { authMiddleware, requireRole } = require('../middleware/auth');
const logger = require('../logger');
const router = express.Router();

//GET per leggere tutti gli atenei------------------------------------------------
//aggiunto controllo totale righe,pagine,prew e next page
router.get("/read", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const [rows] = await pool.query(`SELECT * FROM ateneo LIMIT ? OFFSET ?`, [
      limit,
      offset,
    ]);
    const [countResult] = await pool.query(`
      SELECT COUNT(*) as total 
      FROM ateneo`);
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
    logger.error('Errore GET /ateneo/read', { 
      error: error.message, 
      stack: error.stack 
    });
    res.status(500).json({ error: "Errore nel database" });
  }
});
//--------------------------------------------------------------------------------
//POST per creare un ateneo-------------------------------------------------------
//controlli:campo 'nome' vuoto-
router.post("/add", authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { nome } = req.body;
    if (!nome) {
      logger.warn('POST /ateneo/add - Nome non presente', { user: req.user?.username });
      res.status(400).json({ error: "Campo 'nome' vuoto o non valido" });
      return;
    }
    const [result] = await pool.query(
      `
        INSERT INTO ateneo (nome) VALUES (?)`,
      nome
    );
    res.status(201).json({
      message: `Ateneo ${nome} con Id ${result.insertId} creato con successo`,
    });
  } catch (error) {
    logger.error('Errore POST /ateneo/add', { 
      error: error.message,
      username: req.user?.username 
    });
    res.status(500).json({ error: "Errore database" });
  }
});
//--------------------------------------------------------------------------------
//DELETE per cancellazione ateneo-------------------------------------------------
//passato con json e req.body
//controlli: id vuoto - id non convertibile in nuymero - id non trovato
router.delete("/delete", authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.body;
    if (!id || isNaN(id)) {
      logger.warn('DELETE /ateneo/delete - Id non valido', { user: req.user?.username });
      res.status(400).json({ error: "Id non trovato o non valido" });
      return;
    }
    const [result] = await pool.query(
      `
      DELETE FROM ateneo WHERE id = ?`,
      [id]
    );
    if (result.affectedRows === 0) {
      logger.warn('DELETE /ateneo/delete - ID non trovato nel DB', { id, user: req.user?.username });
      return res.status(404).json({ error: "Id non trovato" });
    }
    res.json({ message: `Ateneo con Id ${id} eliminato` });
  } catch (error) {
    logger.error('Errore DELETE /ateneo/delete', { 
      error: error.message 
    });
    res.status(500).json({ error: "Errore nel database" });
  }
});
//--------------------------------------------------------------------------------
//PUT per modifica nome ateneo----------------------------------------------------
//controlli:id e nome vuoti - id non convertibile in numero - id non trovato
router.put("/mod", authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { id, nome } = req.body;
    if (!id || !nome || isNaN(id)) {
      logger.warn('PUT /ateneo/mod - Id o nome non valido', { user: req.user?.username });
      res.status(400).json({ error: "Id o nome non valido" });
      return;
    }
    const [result] = await pool.query(
      `UPDATE ateneo SET nome = ? WHERE id = ?`,
      [nome, id]
    );
    if (result.affectedRows === 0) {
      logger.warn('DELETE /ateneo/mod - ID ateneo non trovato nel DB', { id, user: req.user?.username });
      return res.status(404).json({ error: "Ateneo non trovato" });
    }
    res.json({ message: `Ateneo ${id} aggiornato con nome "${nome}"` });
  } catch (error) {
    logger.error('Errore PUT /ateneo/mod', { 
      error: error.message,
      userId: req.user?.userId 
    });
    res.status(500).json({ error: "Errore nel database" });
  }
});

module.exports = router;
