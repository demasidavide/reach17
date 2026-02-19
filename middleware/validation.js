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
        error: `${paramName} vuoto o non valido` 
      });
    }
    
    // Converti in numero e salva
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
        error: `Parametri non validi: ${invalidParams.join(", ")}` 
      });
    }
    
    next();
  };
};

const validateName = (fieldName = "nome", minLength = 1) => {
  return (req, res, next) => {
    const value = req.body[fieldName];
    
    // Controlla se il campo esiste ed è una stringa
    if (!value || typeof value !== "string") {
      logger.warn(`Validazione fallita per campo '${fieldName}' - campo mancante o non valido`, {
        value,
        user: req.user?.username,
        path: req.path,
      });
      return res.status(400).json({ 
        error: `Il campo '${fieldName}' è obbligatorio e deve essere una stringa` 
      });
    }
    const trimmedValue = value.trim();
    if (trimmedValue.length < minLength) {
      logger.warn(`Validazione fallita per campo '${fieldName}' - lunghezza insufficiente`, {
        value: trimmedValue,
        length: trimmedValue.length,
        minLength,
        user: req.user?.username,
        path: req.path,
      });
      return res.status(400).json({ 
        error: `Il campo '${fieldName}' deve contenere almeno ${minLength} carattere${minLength > 1 ? 'i' : ''}` 
      });
    }
    
    req.body[fieldName] = trimmedValue;
    next();
  };
};
module.exports = { validateId, validateMultipleIds, validateName };