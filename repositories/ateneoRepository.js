const pool = require("../db");

/**
 * Trova un ateneo per ID
 */
const findById = async (id) => {
  const [rows] = await pool.query(
    `SELECT * FROM ateneo WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
};

/**
 * Trova tutti gli atenei con paginazione
 */
const findAll = async (limit, offset) => {
  const [rows] = await pool.query(
    `SELECT * FROM ateneo LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  return rows;
};

/**
 * Conta il totale degli atenei
 */
const count = async () => {
  const [result] = await pool.query(
    `SELECT COUNT(*) as total FROM ateneo`
  );
  return result[0].total;
};

/**
 * Trova un ateneo per nome (case insensitive)
 */
const findByName = async (nome) => {
  const [rows] = await pool.query(
    `SELECT * FROM ateneo WHERE LOWER(nome) = LOWER(?)`,
    [nome]
  );
  return rows[0] || null;
};

/**
 * Crea un nuovo ateneo
 */
const create = async (nome) => {
  const [result] = await pool.query(
    `INSERT INTO ateneo (nome) VALUES (?)`,
    [nome]
  );
  return result.insertId;
};

/**
 * Aggiorna un ateneo per ID
 */
const update = async (id, nome) => {
  const [result] = await pool.query(
    `UPDATE ateneo SET nome = ? WHERE id = ?`,
    [nome, id]
  );
  return result.affectedRows;
};

/**
 * Elimina un ateneo per ID
 */
const deleteById = async (id) => {
  const [result] = await pool.query(
    `DELETE FROM ateneo WHERE id = ?`,
    [id]
  );
  return result.affectedRows;
};

module.exports = {
  findById,
  findAll,
  count,
  findByName,
  create,
  update,
  deleteById,
};