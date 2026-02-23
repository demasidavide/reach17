const corsoAteneoService = require("../services/corsoAteneoService");
const { getPaginationParams, getPaginationMeta } = require("../utility/pagination");

/**
 * GET / - Ottiene tutte le relazioni corso-ateneo
 */
const getAll = async (req, res) => {
  const { page, limit, offset } = getPaginationParams(req.query);
  const { corsiAtenei, total } = await corsoAteneoService.getAllCorsiAtenei(
    page,
    limit,
    offset
  );
  const pagination = getPaginationMeta(total, page, limit);

  res.json({ data: corsiAtenei, pagination });
};

/**
 * GET /search/name - Ricerca per nome corso
 */
const searchByName = async (req, res) => {
  const { name } = req.query;
  const { page, limit, offset } = getPaginationParams(req.query);

  const { corsiAtenei, total } = await corsoAteneoService.searchByNomeCorso(
    name,
    page,
    limit,
    offset
  );
  const pagination = getPaginationMeta(total, page, limit);

  res.json({ data: corsiAtenei, pagination });
};

/**
 * GET /search/type - Ricerca per tipologia
 */
const searchByType = async (req, res) => {
  const { tipo } = req.query;
  const { page, limit, offset } = getPaginationParams(req.query);

  const { corsiAtenei, total } = await corsoAteneoService.searchByTipologia(
    tipo,
    page,
    limit,
    offset
  );
  const pagination = getPaginationMeta(total, page, limit);

  res.json({ data: corsiAtenei, pagination });
};

/**
 * POST / - Crea una relazione corso-ateneo
 */
const create = async (req, res) => {
  const { idCorso, idAteneo } = req.body;
  const username = req.user?.username;

  const relazione = await corsoAteneoService.createCorsoAteneo(
    idCorso,
    idAteneo,
    username
  );

  const location = `${req.baseUrl}/${relazione.idCorso}/${relazione.idAteneo}`;
  res.location(location).status(201).json({ data: relazione });
};

/**
 * DELETE /:corsoId/:ateneoId - Elimina una relazione
 */
const deleteRelation = async (req, res) => {
  const { corsoId, ateneoId } = req.params;
  const username = req.user?.username;

  await corsoAteneoService.deleteCorsoAteneo(corsoId, ateneoId, username);

  res.status(204).end();
};

module.exports = {
  getAll,
  searchByName,
  searchByType,
  create,
  deleteRelation,
};