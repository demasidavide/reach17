const bcrypt = require('bcryptjs');

// Simulazione DB utenti (in produzione userai MySQL)
const users = [
  { 
    id: 1, 
    username: 'admin', 
    password: bcrypt.hashSync('admin123', 10),  
    role: 'admin' 
  },
  { 
    id: 2, 
    username: 'user', 
    password: bcrypt.hashSync('user123', 10), 
    role: 'user' 
  }
];

/**
 * Trova un utente per username
 */
const findByUsername = async (username) => {
  return users.find(u => u.username === username) || null;
};

/**
 * Trova un utente per ID
 */
const findById = async (id) => {
  return users.find(u => u.id === id) || null;
};

/**
 * Verifica password hashata
 */
const verifyPassword = (plainPassword, hashedPassword) => {
  return bcrypt.compareSync(plainPassword, hashedPassword);
};

/**
 * Ottiene tutti gli utenti (senza password)
 */
const findAll = async () => {
  return users.map(({ password, ...user }) => user);
};

module.exports = {
  findByUsername,
  findById,
  verifyPassword,
  findAll,
};