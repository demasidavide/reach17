const corsoService = require("../services/corsoService");
const { getPaginationParams, getPaginationMeta } = require("../utility/pagination");

/**
 * GET /:id - Ottiene un singolo corso con tipologia
 */
const getById = async (req, res) => {
  const { id } = req.params;
  const corso = await corsoService.getCorsoById(id);
  res.json({ data: corso });
};

/**
 * GET / - Ottiene tutti i corsi con paginazione
 */
const getAll = async (req, res) => {
  const { page, limit, offset } = getPaginationParams(req.query);
  const { corsi, total } = await corsoService.getAllCorsi(page, limit, offset);
  const pagination = getPaginationMeta(total, page, limit);

  res.json({ data: corsi, pagination });
};

/**
 * POST / - Crea un nuovo corso
 */
const create = async (req, res) => {
  const { nome, id } = req.body;
  const tipologiaId = id;
  const username = req.user?.username;

  const corso = await corsoService.createCorso(nome, tipologiaId, username);

  const location = `${req.baseUrl}/${corso.id}`;
  res.location(location).status(201).json({ data: corso });
};

/**
 * PUT /:id - Aggiorna un corso
 */
const update = async (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;
  const username = req.user?.username;

  const corso = await corsoService.updateCorso(id, nome, username);

  res.json({
    message: `Corso ${id} aggiornato con successo`,
    data: corso,
  });
};

/**
 * DELETE /:id - Elimina un corso
 */
const deleteById = async (req, res) => {
  const { id } = req.params;
  const username = req.user?.username;

  await corsoService.deleteCorso(id, username);

  res.status(204).end();
};

module.exports = {
  getById,
  getAll,
  create,
  update,
  deleteById,
};