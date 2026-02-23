const pool = require("../db");

/**
 * Trova tutti i corsi-ateneo con paginazione
 */
const findAll = async (limit, offset) => {
  const [rows] = await pool.query(
    `SELECT 
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
    LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  return rows;
};

/**
 * Conta il totale delle relazioni corso-ateneo
 */
const count = async () => {
  const [result] = await pool.query(
    `SELECT COUNT(*) as total FROM corso_ateneo`
  );
  return result[0].total;
};

/**
 * Trova per ID corso e ID ateneo
 */
const findByCorsoAndAteneo = async (corsoId, ateneoId) => {
  const [rows] = await pool.query(
    `SELECT 
      corso.id AS id_corso,
      corso.nome AS nome_corso,
      ateneo.id AS id_ateneo,
      ateneo.nome AS nome_ateneo
    FROM corso_ateneo
    INNER JOIN corso ON corso_ateneo.corso_id = corso.id
    INNER JOIN ateneo ON corso_ateneo.ateneo_id = ateneo.id
    WHERE corso_ateneo.corso_id = ? AND corso_ateneo.ateneo_id = ?`,
    [corsoId, ateneoId]
  );
  return rows[0] || null;
};

/**
 * Ricerca per nome corso con paginazione
 */
const searchByNomeCorso = async (nome, limit, offset) => {
  const [rows] = await pool.query(
    `SELECT 
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
    WHERE LOWER(corso.nome) LIKE LOWER(?)
    LIMIT ? OFFSET ?`,
    [`%${nome}%`, limit, offset]
  );
  return rows;
};

/**
 * Conta risultati ricerca per nome corso
 */
const countByNomeCorso = async (nome) => {
  const [result] = await pool.query(
    `SELECT COUNT(*) as total 
    FROM corso_ateneo
    INNER JOIN corso ON corso_ateneo.corso_id = corso.id
    WHERE LOWER(corso.nome) LIKE LOWER(?)`,
    [`%${nome}%`]
  );
  return result[0].total;
};

/**
 * Ricerca per tipologia corso con paginazione
 */
const searchByTipologia = async (tipo, limit, offset) => {
  const [rows] = await pool.query(
    `SELECT 
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
    [`%${tipo}%`, limit, offset]
  );
  return rows;
};

/**
 * Conta risultati ricerca per tipologia
 */
const countByTipologia = async (tipo) => {
  const [result] = await pool.query(
    `SELECT COUNT(*) as total 
    FROM corso_ateneo
    INNER JOIN corso ON corso_ateneo.corso_id = corso.id
    INNER JOIN tipologia_corso ON corso.tipologia_id = tipologia_corso.id
    WHERE LOWER(tipologia_corso.nome) LIKE LOWER(?)`,
    [`%${tipo}%`]
  );
  return result[0].total;
};

/**
 * Verifica se un corso esiste
 */
const corsoExists = async (corsoId) => {
  const [rows] = await pool.query(
    `SELECT id FROM corso WHERE id = ?`,
    [corsoId]
  );
  return rows.length > 0;
};

/**
 * Verifica se un ateneo esiste
 */
const ateneoExists = async (ateneoId) => {
  const [rows] = await pool.query(
    `SELECT id FROM ateneo WHERE id = ?`,
    [ateneoId]
  );
  return rows.length > 0;
};

/**
 * Verifica se la relazione corso-ateneo esiste già
 */
const relationExists = async (corsoId, ateneoId) => {
  const [rows] = await pool.query(
    `SELECT * FROM corso_ateneo WHERE corso_id = ? AND ateneo_id = ?`,
    [corsoId, ateneoId]
  );
  return rows.length > 0;
};

/**
 * Crea una relazione corso-ateneo (usa transazione esterna se fornita)
 */
const create = async (corsoId, ateneoId, connection = null) => {
  const conn = connection || pool;
  const [result] = await conn.query(
    `INSERT INTO corso_ateneo (corso_id, ateneo_id) VALUES (?, ?)`,
    [corsoId, ateneoId]
  );
  return result.insertId;
};

/**
 * Elimina una relazione corso-ateneo
 */
const deleteByCorsoAndAteneo = async (corsoId, ateneoId) => {
  const [result] = await pool.query(
    `DELETE FROM corso_ateneo WHERE corso_id = ? AND ateneo_id = ?`,
    [corsoId, ateneoId]
  );
  return result.affectedRows;
};

module.exports = {
  findAll,
  count,
  findByCorsoAndAteneo,
  searchByNomeCorso,
  countByNomeCorso,
  searchByTipologia,
  countByTipologia,
  corsoExists,
  ateneoExists,
  relationExists,
  create,
  deleteByCorsoAndAteneo,
};