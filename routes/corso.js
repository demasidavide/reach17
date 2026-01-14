const express = require("express");
const pool = require("../db");
const { authMiddleware, requireRole } = require('../middleware/auth');
const logger = require('../logger');
const router = express.Router();

//GET per read corso e tipologia associata--------------------------------
//aggiunto controllo totale righe,pagine,prew e next page
router.get("/read", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const [rows] = await pool.query(`
        SELECT 
        corso.id AS id_corso,
        corso.nome AS nome_corso,
        tipologia_corso.id AS id_tipologia,
        tipologia_corso.nome AS nome_tipologia
        FROM corso INNER JOIN tipologia_corso 
        ON corso.tipologia_id=tipologia_corso.id
        LIMIT ? OFFSET ?;`,[limit,offset]);
    const [countResult] = await pool.query(`
      SELECT COUNT(*) as total 
      FROM corso`);
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
      }
    })
  } catch (error) {
    logger.error('Errore GET /corso/read', { 
      error: error.message, 
      stack: error.stack 
    });
    res.status(500).json({ error: "Errore nel database" });
  }
});
//------------------------------------------------------------------------
//POST transazione per aggiunta corso-------------------------------------
//controlli: id,nome vuoti - lettura se tipologia presente - 
// lettura se nome corso gia presente
router.post("/add", authMiddleware, requireRole('admin'), async (req, res) => {
  let conn;
  try {
    const { nome, id } = req.body;
    if (!nome || !id) {
      logger.warn('POST /corso/add - Nome  o id non presente', { user: req.user?.username });
      res.status(400).json({ error: "Id o nome non valido" });
      return;
    }
    
    conn = await pool.getConnection();
    await conn.beginTransaction();
    //controllo se id tipologia esiste
    const [readTipo] = await conn.query(
      "SELECT id FROM tipologia_corso WHERE id = ?",
      [id]
    );
    if (readTipo.length === 0) {
      await conn.rollback();
      logger.warn('POST /corso/add -transaction- Id tipologia non trovato', { user: req.user?.username });
      return res
        .status(400)
        .json({ error: `Attenzione Id tipologia ${id} non trovato` });
    }
    const [readName] = await conn.query(
        "SELECT nome FROM corso WHERE nome = ? ",[nome]);
        if(readName.length > 0){
          logger.warn(`POST /corso/add - Nome gia presente`, {nome, user: req.user?.username });
            return res.status(401).json({error: `Attenzione nome ${nome} già presente`})
        }

    const [result] = await conn.query(
      "INSERT INTO corso (nome, tipologia_id) VALUES (?, ?)",
      [nome, id]
    );

    await conn.commit();
    res.status(201).json({message: `Corso creato con Id ${result.insertId}`});
  } catch (error) {
    logger.error('Errore POST /corso/add', { 
      error: error.message,
      username: req.user?.username 
    });
    res.status(500).json({ error: "Errore nel database" });
  } finally {
    if (conn) conn.release();
  }
});
//------------------------------------------------------------------------
//DELETE per cancellazione corso-------------------------------------------------
//controlli: id vuoto - id non convertibile in numero - id non trovato
router.delete("/delete", authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.body;
    if (!id || isNaN(id)) {
      logger.warn('DELETE /corso/delete - Id non valido', { user: req.user?.username });
      res.status(400).json({ error: "Id non trovato o non valido" });
      return;
    }
    const [result] = await pool.query(
      `
      DELETE FROM corso WHERE id = ?`,
      [id]
    );
    if (result.affectedRows === 0) {
      logger.warn('DELETE /corso/delete - Id non trovato', { id, user: req.user?.username });
      return res.status(404).json({ error: "Id non trovato" });
    }
    res.json({ message: `Corso con Id ${id} eliminato` });
  } catch (error) {
    logger.error('Errore DELETE /corso/delete', { 
      error: error.message 
    });
    res.status(500).json({ error: "Errore nel database" });
  }
});
//--------------------------------------------------------------------------------
//PUT per modifica nome corso----------------------------------------------------
//controlli:id e nome vuoti - id non convertibile in numero - id non trovato
router.put("/mod", authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { id, nome } = req.body;
    if (!id || !nome || isNaN(id)) {
      logger.warn('PUT /corso/mod - Id o nome non valido', { user: req.user?.username });
      res.status(400).json({ error: "Id o nome non valido" });
      return;
    }
    const [result] = await pool.query(
      `UPDATE corso SET nome = ? WHERE id = ?`,
      [nome, id]
    );
    if (result.affectedRows === 0) {
      logger.warn('PUT /corso/mod - Id corso non trovato', {id, user: req.user?.username });
      return res.status(404).json({ error: 'Corso non trovato' });
    }
    res.json({ message: `Corso ${id} aggiornato con nome "${nome}"` });
  } catch (error) {
    logger.error('Errore PUT /corso/mod', { 
      error: error.message,
      userId: req.user?.userId 
    });
    res.status(500).json({ error: 'Errore nel database' });
  }
});

module.exports = router;
