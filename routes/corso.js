const express = require("express");
const pool = require("../db");
const router = express.Router();

//GET per read corso e tipologia associata--------------------------------
router.get("/read", async (req, res) => {
  try {
    const [rows] = await pool.query(`
        SELECT 
        corso.id AS id_corso,
        corso.nome AS nome_corso,
        tipologia_corso.id AS id_tipologia,
        tipologia_corso.nome AS nome_tipologia
        FROM corso INNER JOIN tipologia_corso 
        ON corso.tipologia_id=tipologia_corso.id;`);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Errore nel database" });
  }
});
//------------------------------------------------------------------------
//POST transazione per aggiunta corso-------------------------------------
//controlli: id,nome vuoti - lettura se tipologia presente - 
// lettura se nome corso gia presente
router.post("/add", async (req, res) => {
  let conn;
  try {
    const { nome, id } = req.body;
    if (!nome || !id) {
      req.status(400).json({ error: "Id o nome non valido" });
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
      return res
        .status(400)
        .json({ error: `Attenzione Id tipologia ${id} non trovato` });
    }
    const [readName] = await conn.query(
        "SELECT nome FROM corso WHERE nome = ? ",[nome]);
        if(readName.length > 0){
            return res.status(401).json({error: `Attenzione nome ${nome} già presente`})
        }

    const [result] = await conn.query(
      "INSERT INTO corso (nome, tipologia_id) VALUES (?, ?)",
      [nome, id]
    );

    await conn.commit();
    res.status(201).json({message: `Corso creato con Id ${result.insertId}`});
  } catch (error) {
    res.status(500).json({ error: "Errore nel database" });
  } finally {
    if (conn) conn.release();
  }
});
//------------------------------------------------------------------------
//DELETE per cancellazione corso-------------------------------------------------
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
      DELETE FROM corso WHERE id = ?`,
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Id non trovato" });
    }
    res.json({ message: `Corso con Id ${id} eliminato` });
  } catch (error) {
    res.status(500).json({ error: "Errore nel database" });
  }
});
//--------------------------------------------------------------------------------
//PUT per modifica nome corso----------------------------------------------------
//controlli:id e nome vuoti - id non convertibile in numero - id non trovato
router.put("/mod", async (req, res) => {
  try {
    const { id, nome } = req.body;
    if (!id || !nome || isNaN(id)) {
      res.status(400).json({ error: "Id o nome non valido" });
      return;
    }
    const [result] = await pool.query(
      `UPDATE corso SET nome = ? WHERE id = ?`,
      [nome, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Corso non trovato' });
    }
    res.json({ message: `Corso ${id} aggiornato con nome "${nome}"` });
  } catch (error) {
    res.status(500).json({ error: 'Errore nel database' });
  }
});

module.exports = router;
