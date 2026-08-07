// Ponto de entrada para rodar a API localmente ou em hospedagens
// tradicionais de Node (Railway, Render, uma VPS, etc).
// Para deploy no Vercel, quem é usado é api/index.js — este arquivo
// não roda lá, pois o Vercel não usa app.listen (é serverless).
require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`API da Mary Jane Head Shop rodando na porta ${PORT}`);
});
