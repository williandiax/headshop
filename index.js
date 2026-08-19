// O Vercel detecta automaticamente qualquer arquivo dentro de /api
// como uma função serverless. Aqui só reaproveitamos o mesmo app
// Express de app.js — nada de app.listen aqui, o Vercel cuida disso.
require("dotenv").config();
module.exports = require("../app");
