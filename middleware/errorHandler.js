const logger = require("../logger");

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};


const globalErrorHandler = (err, req, res, next) => {
  logger.error("Errore gestito da globalErrorHandler", {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    user: req.user?.username,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      error: "Risorsa già esistente",
      details: err.message,
    });
  }

  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    return res.status(404).json({
      error: "Riferimento non trovato",
      details: "La risorsa referenziata non esiste",
    });
  }

  
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }


  res.status(500).json({
    error: "Errore interno del server",
  });
};

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  asyncHandler,
  globalErrorHandler,
  AppError,
};