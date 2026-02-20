//importazione moduli
const express = require("express");
const app = express();
require('dotenv').config();
app.use(express.json());

const authRouter = require('./routes/auth');
const ateneoRouter = require('./routes/ateneo.js');
const tipologiaRouter = require('./routes/tipologia.js');
const corsoRouter = require('./routes/corso.js');
const corsoAteneoRouter = require('./routes/corsoAteneo.js');
const { globalErrorHandler } = require('./middleware/errorHandler');

app.use('/auth', authRouter);
app.use('/atenei',ateneoRouter);
app.use('/tipologie',tipologiaRouter);
app.use('/corsi',corsoRouter);
app.use('/corso-ateneo',corsoAteneoRouter);
app.use((req, res) => {
  res.status(404).json({ 
    error: "Route non trovata",
    path: req.path 
  });
});
app.use(globalErrorHandler);
app.listen(3000, () => console.log("server partito su porta 3000"));