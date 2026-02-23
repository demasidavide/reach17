const corsoRepo = require("../repositories/corsoRepository");
const { AppError } = require("../middleware/errorHandler");
const logger = require("../logger");
const pool = require("../db");

/**
 * Ottiene un singolo corso per ID con tipologia
 */
const getCorsoById = async (id) => {
  const corso = await corsoRepo.findById(id);

  if (!corso) {
    logger.warn("Corso non trovato", { id });
    throw new AppError("Corso non trovato", 404);
  }

  return corso;
};

/**
 * Ottiene tutti i corsi con paginazione
 */
const getAllCorsi = async (page, limit, offset) => {
  const [corsi, total] = await Promise.all([
    corsoRepo.findAll(limit, offset),
    corsoRepo.count(),
  ]);

  return { corsi, total };
};

/**
 * Crea un nuovo corso (con transazione)
 */
const createCorso = async (nome, tipologiaId, username) => {
  const conn = await pool.getConnection();
  
  try {
    await conn.beginTransaction();

    // Verifica se la tipologia esiste
    const tipologiaExists = await corsoRepo.tipologiaExists(tipologiaId);
    if (!tipologiaExists) {
      await conn.rollback();
      logger.warn("Tipologia non trovata durante creazione corso", {
        tipologiaId,
        user: username,
      });
      throw new AppError(`Tipologia con id ${tipologiaId} non trovata`, 404);
    }

    // Verifica duplicato nome
    const existing = await corsoRepo.findByName(nome);
    if (existing) {
      await conn.rollback();
      logger.warn("Tentativo di creare corso duplicato", { nome, user: username });
      throw new AppError(`Corso con nome "${nome}" già esistente`, 409);
    }

    // Crea il corso
    const id = await corsoRepo.create(nome, tipologiaId, conn);

    await conn.commit();

    logger.info("Corso creato", { id, nome, tipologiaId, user: username });

    return { id, nome, tipologiaId };
  } catch (error) {
    if (conn) {
      await conn.rollback();
    }
    throw error;
  } finally {
    if (conn) conn.release();
  }
};

/**
 * Aggiorna un corso esistente
 */
const updateCorso = async (id, nome, username) => {
  // Verifica esistenza
  await getCorsoById(id);

  // Verifica duplicato nome
  const existing = await corsoRepo.findByName(nome);
  if (existing && existing.id !== parseInt(id)) {
    throw new AppError(`Nome "${nome}" già utilizzato`, 409);
  }

  const affectedRows = await corsoRepo.update(id, nome);

  if (affectedRows === 0) {
    throw new AppError("Corso non trovato", 404);
  }

  logger.info("Corso aggiornato", { id, nome, user: username });

  return { id, nome };
};

/**
 * Elimina un corso
 */
const deleteCorso = async (id, username) => {
  const affectedRows = await corsoRepo.deleteById(id);

  if (affectedRows === 0) {
    logger.warn("Tentativo di eliminare corso inesistente", { id, user: username });
    throw new AppError("Corso non trovato", 404);
  }

  logger.info("Corso eliminato", { id, user: username });
};

module.exports = {
  getCorsoById,
  getAllCorsi,
  createCorso,
  updateCorso,
  deleteCorso,
};