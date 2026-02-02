const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Token mancante' });
  }
  
  // Estrai il token da "Bearer TOKEN"
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Formato token non valido' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { Oggetto user : userId, username, role }
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token non valido o scaduto' });
  }
};

const requireRole = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    return res.status(403).json({ 
      error: `Accesso negato: ruolo richiesto "${role}", hai "${req.user.role}"` 
    });
  }
  next();
};

module.exports = { authMiddleware, requireRole };

