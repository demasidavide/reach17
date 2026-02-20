const tipologiaRepo = require("../repositories/tipologiaRepository");
const { AppError } = require("../middleware/errorHandler");
const logger = require("../logger");

//ottiene una singola tipologia per ID
const getTipologiaById = async (id) => {
  const tipologia = await tipologiaRepo.findById(id);

  if (!tipologia) {
    logger.warn("Tipologia non trovata", { id });
    throw new AppError("Tipologia non trovata", 404);
  }

  return tipologia;
};

//ottiene tutte le tipologie con paginazione
const getAllTipologie = async (page, limit, offset) => {
  const [tipologie, total] = await Promise.all([
    tipologiaRepo.findAll(limit, offset),
    tipologiaRepo.count(),
  ]);

  return { tipologie, total };
};


//crea una nuova tipologia
const createTipologia = async (nome, username) => {

  const existing = await tipologiaRepo.findByName(nome);//controllo gia presente

  if (existing) {
    logger.warn("Tentativo di creare tipologia duplicata", { nome, user: username });
    throw new AppError(`Tipologia con nome "${nome}" già esistente`, 409);
  }

  const id = await tipologiaRepo.create(nome);

  logger.info("Tipologia creata", { id, nome, user: username });

  return { id, nome };
};


//aggiorna una tipologia esistente
const updateTipologia = async (id, nome, username) => {

  await getTipologiaById(id);

  const existing = await tipologiaRepo.findByName(nome);
  if (existing && existing.id !== parseInt(id)) {
    throw new AppError(`Nome "${nome}" già utilizzato`, 409);
  }

  const affectedRows = await tipologiaRepo.update(id, nome);

  if (affectedRows === 0) {
    throw new AppError("Tipologia non trovata", 404);
  }

  logger.info("Tipologia aggiornata", { id, nome, user: username });

  return { id, nome };
};

//elimina tipologia
const deleteTipologia = async (id, username) => {
  const affectedRows = await tipologiaRepo.deleteById(id);

  if (affectedRows === 0) {
    logger.warn("Tentativo di eliminare tipologia inesistente", { id, user: username });
    throw new AppError("Tipologia non trovata", 404);
  }

  logger.info("Tipologia eliminata", { id, user: username });
};

module.exports = {
  getTipologiaById,
  getAllTipologie,
  createTipologia,
  updateTipologia,
  deleteTipologia,
};