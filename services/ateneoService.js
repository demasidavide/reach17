const ateneoRepo = require("../repositories/ateneoRepository");
const { AppError } = require("../middleware/errorHandler");
const logger = require("../logger");

/**
 * Ottiene un singolo ateneo per ID
 */
const getAteneoById = async (id) => {
  const ateneo = await ateneoRepo.findById(id);

  if (!ateneo) {
    logger.warn("Ateneo non trovato", { id });
    throw new AppError("Ateneo non trovato", 404);
  }

  return ateneo;
};

/**
 * Ottiene tutti gli atenei con paginazione
 */
const getAllAtenei = async (page, limit, offset) => {
  const [atenei, total] = await Promise.all([
    ateneoRepo.findAll(limit, offset),
    ateneoRepo.count(),
  ]);

  return { atenei, total };
};

/**
 * Crea un nuovo ateneo
 */
const createAteneo = async (nome, username) => {
  // Verifica duplicato
  const existing = await ateneoRepo.findByName(nome);

  if (existing) {
    logger.warn("Tentativo di creare ateneo duplicato", { nome, user: username });
    throw new AppError(`Ateneo con nome "${nome}" già esistente`, 409);
  }

  const id = await ateneoRepo.create(nome);

  logger.info("Ateneo creato", { id, nome, user: username });

  return { id, nome };
};

/**
 * Aggiorna un ateneo esistente
 */
const updateAteneo = async (id, nome, username) => {
  // Verifica esistenza
  await getAteneoById(id);

  // Verifica duplicato nome
  const existing = await ateneoRepo.findByName(nome);
  if (existing && existing.id !== parseInt(id)) {
    throw new AppError(`Nome "${nome}" già utilizzato`, 409);
  }

  const affectedRows = await ateneoRepo.update(id, nome);

  if (affectedRows === 0) {
    throw new AppError("Ateneo non trovato", 404);
  }

  logger.info("Ateneo aggiornato", { id, nome, user: username });

  return { id, nome };
};

/**
 * Elimina un ateneo
 */
const deleteAteneo = async (id, username) => {
  const affectedRows = await ateneoRepo.deleteById(id);

  if (affectedRows === 0) {
    logger.warn("Tentativo di eliminare ateneo inesistente", { id, user: username });
    throw new AppError("Ateneo non trovato", 404);
  }

  logger.info("Ateneo eliminato", { id, user: username });
};

module.exports = {
  getAteneoById,
  getAllAtenei,
  createAteneo,
  updateAteneo,
  deleteAteneo,
};