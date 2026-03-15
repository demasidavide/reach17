const winston = require('winston');
const path = require('path');

const isDev = process.env.NODE_ENV !== 'production';

const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  })
];

if (isDev) {
  const logsDir = path.join(__dirname, 'logs');
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      options: { flags: 'a' },
      dirname: logsDir,
      createSymlink: false
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      dirname: logsDir
    })
  );
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'reach17-api' },
  transports
});

module.exports = logger;