const corsoAteneoRepo = require("../repositories/corsoAteneoRepository");
const { AppError } = require("../middleware/errorHandler");
const logger = require("../logger");
const pool = require("../db");

/**
 * Ottiene tutte le relazioni corso-ateneo con paginazione
 */
const getAllCorsiAtenei = async (page, limit, offset) => {
  const [corsiAtenei, total] = await Promise.all([
    corsoAteneoRepo.findAll(limit, offset),
    corsoAteneoRepo.count(),
  ]);

  return { corsiAtenei, total };
};

/**
 * Ricerca per nome corso
 */
const searchByNomeCorso = async (nome, page, limit, offset) => {
  if (!nome || nome.trim().length < 1) {
    throw new AppError("Il nome deve contenere almeno un carattere", 400);
  }

  const [corsiAtenei, total] = await Promise.all([
    corsoAteneoRepo.searchByNomeCorso(nome, limit, offset),
    corsoAteneoRepo.countByNomeCorso(nome),
  ]);

  return { corsiAtenei, total };
};

/**
 * Ricerca per tipologia
 */
const searchByTipologia = async (tipo, page, limit, offset) => {
  // Se tipo non è fornito, restituisci tutti
  if (!tipo || tipo.trim().length === 0) {
    return await getAllCorsiAtenei(page, limit, offset);
  }

  const [corsiAtenei, total] = await Promise.all([
    corsoAteneoRepo.searchByTipologia(tipo, limit, offset),
    corsoAteneoRepo.countByTipologia(tipo),
  ]);

  return { corsiAtenei, total };
};

/**
 * Crea una relazione corso-ateneo (con transazione)
 */
const createCorsoAteneo = async (idCorso, idAteneo, username) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();
    logger.debug("Transazione iniziata", { nome, user: username });
    // Verifica se il corso esiste
    const corsoExists = await corsoAteneoRepo.corsoExists(idCorso);
    if (!corsoExists) {
      await conn.rollback();
      logger.warn("Corso non trovato durante creazione relazione", {
        idCorso,
        user: username,
      });
      throw new AppError(`Corso con id ${idCorso} non trovato`, 404);
    }

    // Verifica se l'ateneo esiste
    const ateneoExists = await corsoAteneoRepo.ateneoExists(idAteneo);
    if (!ateneoExists) {
      await conn.rollback();
      logger.warn("Ateneo non trovato durante creazione relazione", {
        idAteneo,
        user: username,
      });
      throw new AppError(`Ateneo con id ${idAteneo} non trovato`, 404);
    }

    // Verifica se la relazione esiste già
    const relationExists = await corsoAteneoRepo.relationExists(idCorso, idAteneo);
    if (relationExists) {
      await conn.rollback();
      logger.warn("Tentativo di creare relazione duplicata", {
        idCorso,
        idAteneo,
        user: username,
      });
      throw new AppError(
        `Relazione tra corso ${idCorso} e ateneo ${idAteneo} già esistente`,
        409
      );
    }

    // Crea la relazione
    await corsoAteneoRepo.create(idCorso, idAteneo, conn);

    await conn.commit();

    logger.info("Relazione corso-ateneo creata", {
      idCorso,
      idAteneo,
      user: username,
    });

    return { idCorso, idAteneo };
  } catch (error) {
    if (conn) {
      await conn.rollback();
      logger.warn("Transazione rollback eseguito", {
          nome,
          user: username,
          error: error.message
        });
    }
    throw error;
  } finally {
    if (conn) conn.release();
  }
};

/**
 * Elimina una relazione corso-ateneo
 */
const deleteCorsoAteneo = async (corsoId, ateneoId, username) => {
  const affectedRows = await corsoAteneoRepo.deleteByCorsoAndAteneo(
    corsoId,
    ateneoId
  );

  if (affectedRows === 0) {
    logger.warn("Tentativo di eliminare relazione inesistente", {
      corsoId,
      ateneoId,
      user: username,
    });
    throw new AppError(
      `Relazione tra corso ${corsoId} e ateneo ${ateneoId} non trovata`,
      404
    );
  }

  logger.info("Relazione corso-ateneo eliminata", {
    corsoId,
    ateneoId,
    user: username,
  });
};

module.exports = {
  getAllCorsiAtenei,
  searchByNomeCorso,
  searchByTipologia,
  createCorsoAteneo,
  deleteCorsoAteneo,
};