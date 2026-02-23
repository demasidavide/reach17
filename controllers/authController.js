const authService = require('../services/authService');

/**
 * POST /auth/login - Effettua login
 */
const login = async (req, res) => {
  const { username, password } = req.body;
  
  const result = await authService.login(username, password);
  
  res.json({
    message: 'Login effettuato con successo',
    token: result.token,
    user: result.user
  });
};

/**
 * GET /auth/me - Ottiene info utente corrente
 */
const getCurrentUser = async (req, res) => {
  // req.user è già popolato dal middleware authMiddleware
  res.json({
    user: {
      id: req.user.userId,
      username: req.user.username,
      role: req.user.role
    }
  });
};

/**
 * POST /auth/verify - Verifica validità token
 */
const verifyToken = async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: 'Token mancante' });
  }

  const result = authService.verifyToken(token);
  
  if (!result.valid) {
    return res.status(401).json({ 
      valid: false, 
      error: result.error 
    });
  }

  res.json({ 
    valid: true, 
    user: result.payload 
  });
};

module.exports = {
  login,
  getCurrentUser,
  verifyToken,
};