const express = require("express");
const pool = require("../db");
const router = express.Router();

//GET per lettura tabella e associazioni
//aggiunto controllo totale righe,pagine,prew e next page
router.get("/read", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const [rows] = await pool.query(
      `
       SELECT 
    corso.id AS id_corso,
    corso.nome AS nome_corso,
    ateneo.id AS id_ateneo,
    ateneo.nome AS nome_ateneo
    FROM corso_ateneo
    INNER JOIN corso ON corso_ateneo.corso_id = corso.id
    INNER JOIN ateneo ON corso_ateneo.ateneo_id = ateneo.id
    LIMIT ? OFFSET ?;`,
      [limit, offset]
    );
    const [countResult] = await pool.query(`
      SELECT COUNT(*) as total 
      FROM corso_ateneo`);
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
//------------------------------------------------------------------------
//GET filtro per nome corso-----------------------------------------------
//aggiunto controllo totale righe,pagine,prew e next page
router.get("/search/name", async (req, res) => {
  try {
    const { nome } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    if (!nome || nome.trim().length < 1) {
      return res
        .status(400)
        .json({ error: "Il nome deve contenere almeno un carattere" });
    }
    const [rows] = await pool.query(
      `
      SELECT 
        corso.id AS id_corso,
        corso.nome AS nome_corso,
        ateneo.id AS id_ateneo,
        ateneo.nome AS nome_ateneo
      FROM corso_ateneo
      INNER JOIN corso ON corso_ateneo.corso_id = corso.id
      INNER JOIN ateneo ON corso_ateneo.ateneo_id = ateneo.id
      WHERE LOWER(corso.nome) LIKE LOWER(?)
      LIMIT ? OFFSET ?`,
      [`%${nome}%`, limit, offset]
    );
    const [countResult] = await pool.query(`
      SELECT COUNT(*) as total 
      FROM corso_ateneo`);
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
//------------------------------------------------------------------------
//GET filtro per tipologia corso-----------------------------------------------
//aggiunto controllo totale righe,pagine,prew e next page
router.get("/search/type", async (req, res) => {
  try {
    const { tipo } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    if (!tipo || tipo.trim().length === 0) {
      const [rows] = await pool.query(
        `
        SELECT 
          corso.id AS id_corso,
          corso.nome AS nome_corso,
          tipologia_corso.id AS id_tipologia,
          tipologia_corso.nome AS nome_tipologia,
          ateneo.id AS id_ateneo,
          ateneo.nome AS nome_ateneo
        FROM corso_ateneo
        INNER JOIN corso ON corso_ateneo.corso_id = corso.id
        INNER JOIN ateneo ON corso_ateneo.ateneo_id = ateneo.id
        INNER JOIN tipologia_corso ON corso.tipologia_id = tipologia_corso.id
        LIMIT ? OFFSET ?;`,
        [limit, offset]
      );
      const [countResult] = await pool.query(`
      SELECT COUNT(*) as total 
      FROM corso_ateneo`);
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
      return;
    }

    const [rows] = await pool.query(
      `
      SELECT 
        corso.id AS id_corso,
        corso.nome AS nome_corso,
        tipologia_corso.id AS id_tipologia,
        tipologia_corso.nome AS nome_tipologia,
        ateneo.id AS id_ateneo,
        ateneo.nome AS nome_ateneo
      FROM corso_ateneo
      INNER JOIN corso ON corso_ateneo.corso_id = corso.id
      INNER JOIN ateneo ON corso_ateneo.ateneo_id = ateneo.id
      INNER JOIN tipologia_corso ON corso.tipologia_id = tipologia_corso.id
      WHERE LOWER(tipologia_corso.nome) LIKE LOWER(?)
      LIMIT ? OFFSET ?`,
      [`%${tipo}%`,limit,offset]
    );
    const [countResult] = await pool.query(`
      SELECT COUNT(*) as total 
      FROM corso_ateneo`);
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
    console.error(error);
    res.status(500).json({ error: "Errore nel database" });
  }
});
//------------------------------------------------------------------------
//POST transazione per associazione corso-ateneo-------------------------------------
//controlli: id,nome vuoti - lettura se tipologia presente -

router.post("/add", async (req, res) => {
  let conn;
  try {
    const { idCorso, idAteneo } = req.body;
    if (!idCorso || !idAteneo) {
      res.status(400).json({ error: "Id Corso o Id Ateneo non valido" });
      return;
    }

    conn = await pool.getConnection();
    await conn.beginTransaction();
    //controllo se id corso esiste
    const [readCorso] = await conn.query("SELECT id FROM corso WHERE id = ?", [
      idCorso,
    ]);
    if (readCorso.length === 0) {
      await conn.rollback();
      return res
        .status(400)
        .json({ error: `Attenzione Id corso ${idCorso} non trovato` });
    }
    const [readAteneo] = await conn.query(
      "SELECT id FROM ateneo WHERE id = ? ",
      [idAteneo]
    );
    if (readAteneo.length === 0) {
      await conn.rollback();
      return res
        .status(401)
        .json({ error: `Attenzione Id Ateneo ${idAteneo} non trovato` });
    }

    const [result] = await conn.query(
      "INSERT INTO corso_ateneo (corso_id, ateneo_id) VALUES (?, ?)",
      [idCorso, idAteneo]
    );

    await conn.commit();
    res
      .status(201)
      .json({ message: `Corso ${idCorso} associato all'Ateneo ${idAteneo}` });
  } catch (error) {
    if (conn) {
      try {
        await conn.rollback();
      } catch (e) {} // aggiungi rollback
    }
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
    const { corso_id, ateneo_id } = req.body;
    if (!corso_id || !ateneo_id || isNaN(corso_id) || isNaN(ateneo_id)) {
      res.status(400).json({ error: "Id non trovato o non valido" });
      return;
    }
    const [result] = await pool.query(
      `
      DELETE FROM corso_ateneo WHERE corso_id = ? AND ateneo_id = ? `,
      [corso_id, ateneo_id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Id non trovato" });
    }
    res.json({
      message: `Corso con Id ${corso_id} eliminato da Ateneo con id ${ateneo_id}`,
    });
  } catch (error) {
    res.status(500).json({ error: "Errore nel database" });
  }
});
//--------------------------------------------------------------------------------

module.exports = router;
