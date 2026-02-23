const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../middleware/errorHandler");
const { validateLoginCredentials } = require("../middleware/validation");
const { authMiddleware } = require("../middleware/auth");
const authController = require("../controllers/authController");

router.post(
  "/login",
  validateLoginCredentials(),
  asyncHandler(authController.login),
);

router.get("/me", authMiddleware, asyncHandler(authController.getCurrentUser));

router.post("/verify", asyncHandler(authController.verifyToken));

module.exports = router;

//                              VECCHIO CODICE MANTENUTO PER CONFRONTO

// const express = require('express');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
// const router = express.Router();

// Password salvata con hash per sicurezza
// const users = [
//   {
//     id: 1,
//     username: 'admin',
//     password: bcrypt.hashSync('admin123', 10),
//     role: 'admin'
//   },
//   {
//     id: 2,
//     username: 'user',
//     password: bcrypt.hashSync('user123', 10),
//     role: 'user'
//   }
// ];

// POST /auth/login — rilascia token
// router.post('/login', (req, res) => {
//   try {
//     const { username, password } = req.body;

//     if (!username || !password) {
//       return res.status(400).json({ error: 'Username e password obbligatori' });
//     }

// Cerca utente
// const user = users.find(u => u.username === username);

// if (!user) {
//   return res.status(401).json({ error: 'Utente non trovato' });
// }

// Verifica password
// const isValidPassword = bcrypt.compareSync(password, user.password);
// if (!isValidPassword) {
//   return res.status(401).json({ error: 'Password non valida' });
// }

// Genera token JWT
//     const token = jwt.sign(
//       { userId: user.id, username: user.username, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.JWT_EXPIRY || '24h' }
//     );

//     res.json({
//       message: 'Login effettuato con successo',
//       token,
//       user: {
//         id: user.id,
//         username: user.username,
//         role: user.role
//       }
//     });
//   } catch (error) {
//     console.error('[ERROR POST /auth/login]', error.message);
//     res.status(500).json({ error: 'Errore server' });
//   }
// });

// module.exports = router;
