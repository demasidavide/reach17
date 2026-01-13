//importazione moduli
const express = require("express");
const app = express();
require('dotenv').config();
app.use(express.json());


//importo da ateneo.js
const ateneoRouter = require('./routes/ateneo.js');
app.use('/ateneo',ateneoRouter);
//importo da tipologia.js
const tipologiaRouter = require('./routes/tipologia.js');
app.use('/tipologia',tipologiaRouter);



app.listen(3000, () => console.log("server partito su porta 3000"));