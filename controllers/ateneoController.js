const ateneoService = require("../services/ateneoService");
const { getPaginationParams, getPaginationMeta } = require("../utility/pagination");

/**
 * GET /:id - Ottiene un singolo ateneo
 */
const getById = async (req, res) => {
  const { id } = req.params;
  const ateneo = await ateneoService.getAteneoById(id);
  res.json({ data: ateneo });
};

/**
 * GET / - Ottiene tutti gli atenei con paginazione
 */
const getAll = async (req, res) => {
  const { page, limit, offset } = getPaginationParams(req.query);
  const { atenei, total } = await ateneoService.getAllAtenei(page, limit, offset);
  const pagination = getPaginationMeta(total, page, limit);

  res.json({ data: atenei, pagination });
};

/**
 * POST / - Crea un nuovo ateneo
 */
const create = async (req, res) => {
  const { nome } = req.body;
  const username = req.user?.username;

  const ateneo = await ateneoService.createAteneo(nome, username);

  const location = `${req.baseUrl}/${ateneo.id}`;
  res.location(location).status(201).json({ data: ateneo });
};

/**
 * PUT /:id - Aggiorna un ateneo
 */
const update = async (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;
  const username = req.user?.username;

  const ateneo = await ateneoService.updateAteneo(id, nome, username);

  res.json({
    message: `Ateneo ${id} aggiornato con successo`,
    data: ateneo,
  });
};

/**
 * DELETE /:id - Elimina un ateneo
 */
const deleteById = async (req, res) => {
  const { id } = req.params;
  const username = req.user?.username;

  await ateneoService.deleteAteneo(id, username);

  res.status(204).end();
};

module.exports = {
  getById,
  getAll,
  create,
  update,
  deleteById,
};