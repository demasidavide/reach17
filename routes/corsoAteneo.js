const express = require("express");
const pool = require("../db");
const router = express.Router();

//GET per lettura tabella e associazioni
router.get("/read", async (req, res) => {
  try {
    const [rows] = await pool.query(`
       SELECT 
    corso.id AS id_corso,
    corso.nome AS nome_corso,
    ateneo.id AS id_ateneo,
    ateneo.nome AS nome_ateneo
FROM corso_ateneo
INNER JOIN corso ON corso_ateneo.corso_id = corso.id
INNER JOIN ateneo ON corso_ateneo.ateneo_id = ateneo.id;`);
    res.json(rows);
  } catch (error) {
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

module.exports = router;
