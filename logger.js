const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Crea cartella logs se non esiste
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'reach17-api' },
  transports: [
    // Log degli errori → file error.log
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error'
    }),
    // Tutti i log → file combined.log
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log')
    }),
    // Anche in console (per sviluppo)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

module.exports = logger;