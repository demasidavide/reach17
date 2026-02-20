const pool = require("../db");

//trovare una tipologia per ID
const findById = async(id) =>{
    const[rows] = await pool.query(
    `SELECT * FROM tipologia_corso WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
};

//trova tutte le tipologie con paginazione
const findAll = async (limit, offset) => {
  const [rows] = await pool.query(
    `SELECT * FROM tipologia_corso LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  return rows;
};


//conta il totale delle tipologie
const count = async () => {
  const [result] = await pool.query(
    `SELECT COUNT(*) as total FROM tipologia_corso`
  );
  return result[0].total;
};


//trova una tipologia con filtro per nome 

const findByName = async (nome) => {
  const [rows] = await pool.query(
    `SELECT * FROM tipologia_corso WHERE LOWER(nome) = LOWER(?)`,
    [nome]
  );
  return rows[0] || null;
};


//crea una nuova tipologia
const create = async (nome) => {
  const [result] = await pool.query(
    `INSERT INTO tipologia_corso (nome) VALUES (?)`,
    [nome]
  );
  return result.insertId;
};


//aggiorna una tipologia per ID
const update = async (id, nome) => {
  const [result] = await pool.query(
    `UPDATE tipologia_corso SET nome = ? WHERE id = ?`,
    [nome, id]
  );
  return result.affectedRows;
};


//elimina una tipologia per ID
const deleteById = async (id) => {
  const [result] = await pool.query(
    `DELETE FROM tipologia_corso WHERE id = ?`,
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