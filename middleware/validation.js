const logger = require("../logger");

const validateId = (paramName = "id") => {
  return (req, res, next) => {
    const id = req.params[paramName];

    if (!id || isNaN(id)) {
      logger.warn(`Validazione fallita per parametro '${paramName}'`, {
        value: id,
        user: req.user?.username,
        path: req.path,
      });
      return res.status(400).json({
        error: `${paramName} vuoto o non valido`,
      });
    }

    req.params[paramName] = parseInt(id);
    next();
  };
};

const validateMultipleIds = (...paramNames) => {
  return (req, res, next) => {
    const invalidParams = [];

    for (const paramName of paramNames) {
      const id = req.params[paramName];
      if (!id || isNaN(id)) {
        invalidParams.push(paramName);
      } else {
        req.params[paramName] = parseInt(id);
      }
    }

    if (invalidParams.length > 0) {
      logger.warn("Validazione fallita per parametri multipli", {
        invalidParams,
        user: req.user?.username,
        path: req.path,
      });
      return res.status(400).json({
        error: `Parametri non validi: ${invalidParams.join(", ")}`,
      });
    }

    next();
  };
};

const validateName = (fieldName = "nome", minLength = 1) => {
  return (req, res, next) => {
    const value = req.body[fieldName];

    if (!value || typeof value !== "string") {
      logger.warn(
        `Validazione fallita per campo '${fieldName}' - campo mancante o non valido`,
        {
          value,
          user: req.user?.username,
          path: req.path,
        },
      );
      return res.status(400).json({
        error: `Il campo '${fieldName}' è obbligatorio e deve essere una stringa`,
      });
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length < minLength) {
      logger.warn(
        `Validazione fallita per campo '${fieldName}' - lunghezza insufficiente`,
        {
          value: trimmedValue,
          length: trimmedValue.length,
          minLength,
          user: req.user?.username,
          path: req.path,
        },
      );
      return res.status(400).json({
        error: `Il campo '${fieldName}' deve contenere almeno ${minLength} carattere${minLength > 1 ? "i" : ""}`,
      });
    }

    req.body[fieldName] = trimmedValue;
    next();
  };
};

const validateBodyId = (fieldName) => {
  return (req, res, next) => {
    const value = req.body[fieldName];

    if (
      value === undefined ||
      value === null ||
      isNaN(value) ||
      parseInt(value) <= 0
    ) {
      logger.warn(`Validazione fallita per campo body '${fieldName}'`, {
        value,
        user: req.user?.username,
        path: req.path,
      });
      return res.status(400).json({
        error: `Il campo '${fieldName}' deve essere un ID numerico valido`,
      });
    }

    req.body[fieldName] = parseInt(value);
    next();
  };
};

const validateLoginCredentials = () => {
  return (req, res, next) => {
    const { username, password } = req.body;

    if (
      !username ||
      typeof username !== "string" ||
      username.trim().length === 0
    ) {
      return res.status(400).json({ error: "Username non valido" });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({
        error: "Password deve essere almeno 6 caratteri",
      });
    }

    req.body.username = username.trim();
    next();
  };
};

module.exports = {
  validateId,
  validateName,
  validateBodyId,
  validateMultipleIds,
  validateLoginCredentials,
};
