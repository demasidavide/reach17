//importazione moduli
const express = require("express");
const app = express();
require('dotenv').config();
app.use(express.json());


//importo da ateneo.js
const ateneoRouter = require('./routes/ateneo.js');
app.use('/ateneo',ateneoRouter);



app.listen(3000, () => console.log("server partito su porta 3000"));