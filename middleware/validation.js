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

module.exports = { validateId, validateMultipleIds };