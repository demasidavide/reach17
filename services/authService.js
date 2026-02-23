const jwt = require('jsonwebtoken');
const userRepo = require('../repositories/userRepository');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../logger');

/**
 * Effettua login e genera JWT token
 */
const login = async (username, password) => {
  // Validazione input
  if (!username || !password) {
    throw new AppError('Username e password obbligatori', 400);
  }

  // Cerca utente
  const user = await userRepo.findByUsername(username);
  
  if (!user) {
    logger.warn('Tentativo di login con utente inesistente', { username });
    throw new AppError('Credenziali non valide', 401);
  }

  // Verifica password
  const isValidPassword = userRepo.verifyPassword(password, user.password);
  
  if (!isValidPassword) {
    logger.warn('Tentativo di login con password errata', { 
      username,
      userId: user.id 
    });
    throw new AppError('Credenziali non valide', 401);
  }

  // Genera token JWT
  const token = jwt.sign(
    { 
      userId: user.id, 
      username: user.username, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '24h' }
  );

  logger.info('Login effettuato con successo', { 
    userId: user.id, 
    username: user.username,
    role: user.role
  });

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  };
};

/**
 * Verifica validità del token JWT
 */
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { valid: true, payload: decoded };
  } catch (error) {
    logger.warn('Token non valido o scaduto', { error: error.message });
    return { valid: false, error: error.message };
  }
};

/**
 * Ottiene informazioni utente da token
 */
const getUserFromToken = async (token) => {
  const { valid, payload } = verifyToken(token);
  
  if (!valid) {
    throw new AppError('Token non valido', 401);
  }

  const user = await userRepo.findById(payload.userId);
  
  if (!user) {
    throw new AppError('Utente non trovato', 404);
  }

  return {
    id: user.id,
    username: user.username,
    role: user.role
  };
};

module.exports = {
  login,
  verifyToken,
  getUserFromToken,
};