const tipologiaService = require("../services/tipologiaService");
const { getPaginationParams, getPaginationMeta } = require("../utility/pagination");


//GET /:id - Ottiene una singola tipologia

const getById = async (req, res) => {
  const { id } = req.params;
  const tipologia = await tipologiaService.getTipologiaById(id);
  res.json({ data: tipologia });
};


//GET / - Ottiene tutte le tipologie con paginazione

const getAll = async (req, res) => {
  const { page, limit, offset } = getPaginationParams(req.query);
  const { tipologie, total } = await tipologiaService.getAllTipologie(page, limit, offset);
  const pagination = getPaginationMeta(total, page, limit);

  res.json({ data: tipologie, pagination });
};


//POST / - Crea una nuova tipologia

const create = async (req, res) => {
  const { nome } = req.body;
  const username = req.user?.username;

  const tipologia = await tipologiaService.createTipologia(nome, username);

  const location = `${req.baseUrl}/${tipologia.id}`;
  res.location(location).status(201).json({ data: tipologia });
};


//PUT /:id - Aggiorna una tipologia

const update = async (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;
  const username = req.user?.username;

  const tipologia = await tipologiaService.updateTipologia(id, nome, username);

  res.json({
    message: `Tipologia ${id} aggiornata con successo`,
    data: tipologia,
  });
};


//DELETE /:id - Elimina una tipologia

const deleteById = async (req, res) => {
  const { id } = req.params;
  const username = req.user?.username;

  await tipologiaService.deleteTipologia(id, username);

  res.status(204).end();
};

module.exports = {
  getById,
  getAll,
  create,
  update,
  deleteById,
};