const pool = require("../db");

/**
 * Trova un corso per ID con la tipologia associata
 */
const findById = async (id) => {
  const [rows] = await pool.query(
    `SELECT 
      corso.id AS id_corso,
      corso.nome AS nome_corso,
      tipologia_corso.id AS id_tipologia,
      tipologia_corso.nome AS nome_tipologia
    FROM corso 
    INNER JOIN tipologia_corso ON corso.tipologia_id = tipologia_corso.id
    WHERE corso.id = ?`,
    [id]
  );
  return rows[0] || null;
};

/**
 * Trova tutti i corsi con tipologia e paginazione
 */
const findAll = async (limit, offset) => {
  const [rows] = await pool.query(
    `SELECT 
      corso.id AS id_corso,
      corso.nome AS nome_corso,
      tipologia_corso.id AS id_tipologia,
      tipologia_corso.nome AS nome_tipologia
    FROM corso 
    INNER JOIN tipologia_corso ON corso.tipologia_id = tipologia_corso.id
    LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  return rows;
};

/**
 * Conta il totale dei corsi
 */
const count = async () => {
  const [result] = await pool.query(
    `SELECT COUNT(*) as total FROM corso`
  );
  return result[0].total;
};

/**
 * Trova un corso per nome (case insensitive)
 */
const findByName = async (nome) => {
  const [rows] = await pool.query(
    `SELECT * FROM corso WHERE LOWER(nome) = LOWER(?)`,
    [nome]
  );
  return rows[0] || null;
};

/**
 * Verifica se una tipologia esiste
 */
const tipologiaExists = async (tipologiaId) => {
  const [rows] = await pool.query(
    `SELECT id FROM tipologia_corso WHERE id = ?`,
    [tipologiaId]
  );
  return rows.length > 0;
};

/**
 * Crea un nuovo corso (usa transazione esterna se fornita)
 */
const create = async (nome, tipologiaId, connection = null) => {
  const conn = connection || pool;
  const [result] = await conn.query(
    `INSERT INTO corso (nome, tipologia_id) VALUES (?, ?)`,
    [nome, tipologiaId]
  );
  return result.insertId;
};

/**
 * Aggiorna un corso per ID
 */
const update = async (id, nome) => {
  const [result] = await pool.query(
    `UPDATE corso SET nome = ? WHERE id = ?`,
    [nome, id]
  );
  return result.affectedRows;
};

/**
 * Elimina un corso per ID
 */
const deleteById = async (id) => {
  const [result] = await pool.query(
    `DELETE FROM corso WHERE id = ?`,
    [id]
  );
  return result.affectedRows;
};

module.exports = {
  findById,
  findAll,
  count,
  findByName,
  tipologiaExists,
  create,
  update,
  deleteById,
};