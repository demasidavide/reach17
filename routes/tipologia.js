const express = require("express");
const pool = require("../db");
const router = express.Router();

//GET per leggere tutte le tipologie------------------------------------------------
//aggiunto controllo totale righe,pagine,prew e next page
router.get("/read", async (req, res) => {
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
    res.status(500).json({ error: "Errore nel database" });
  }
});
//--------------------------------------------------------------------------------
//POST per creare una tipologia---------------------------------------------------
//controlli:campo 'nome' vuoto-
router.post("/add", async (req, res) => {
  try {
    const { nome } = req.body;
    if (!nome) {
      res.status(400).json({ error: "Campo 'nome' vuoto o non valido" });
      return;
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
    console.error(error);
    res.status(500).json({ error: "Errore database" });
  }
});
//--------------------------------------------------------------------------------
//DELETE per cancellazione tipologia-------------------------------------------------
//passato con json e req.body
//controlli: id vuoto - id non convertibile in numero - id non trovato
router.delete("/delete", async (req, res) => {
  try {
    const { id } = req.body;
    if (!id || isNaN(id)) {
      res.status(400).json({ error: "Id non trovato o non valido" });
      return;
    }
    const [result] = await pool.query(
      `
      DELETE FROM tipologia_corso WHERE id = ?`,
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Id non trovato" });
    }
    res.json({ message: `Tipologia con Id ${id} eliminata` });
  } catch (error) {
    res.status(500).json({ error: "Errore nel database" });
  }
});
//--------------------------------------------------------------------------------
//PUT per modifica nome tipologia----------------------------------------------------
//controlli:id e nome vuoti - id non convertibile in numero - id non trovato
router.put("/mod", async (req, res) => {
  try {
    const { id, nome } = req.body;
    if (!id || !nome || isNaN(id)) {
      res.status(400).json({ error: "Id o nome non valido" });
      return;
    }
    const [result] = await pool.query(
      `UPDATE tipologia_corso SET nome = ? WHERE id = ?`,
      [nome, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Tipologia non trovata" });
    }
    res.json({ message: `Tipologia ${id} aggiornata con nome "${nome}"` });
  } catch (error) {
    res.status(500).json({ error: "Errore nel database" });
  }
});
module.exports = router;
