//importazione moduli
const express = require("express");
const app = express();
require('dotenv').config();
app.use(express.json());
const authRouter = require('./routes/auth');
app.use('/auth', authRouter);

//importo da ateneo.js
const ateneoRouter = require('./routes/ateneo.js');
app.use('/atenei',ateneoRouter);
//importo da tipologia.js
const tipologiaRouter = require('./routes/tipologia.js');
app.use('/tipologie',tipologiaRouter);
//importo da corso.js
const corsoRouter = require('./routes/corso.js');
app.use('/corsi',corsoRouter);
//importo da corsoAteneo.js
const corsoAteneoRouter = require('./routes/corsoAteneo.js');
app.use('/corso-ateneo',corsoAteneoRouter);


app.listen(3000, () => console.log("server partito su porta 3000"));