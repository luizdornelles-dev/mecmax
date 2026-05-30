// backend/src/server.js
const express = require("express");
const cors = require("cors");
const db = require("./config/db"); 

const app = express();

app.use(cors());
app.use(express.json()); 

app.use((req, res, next) => {
  console.log(`>>> [SERVIDOR] Recebi requisição: ${req.method} ${req.url}`);
  next();
});

const mecanicosRoutes = require("./routes/mecanicos.routes");
const ferramentasRoutes = require("./routes/ferramentas.routes");
const emprestimosRoutes = require("./routes/emprestimos.routes");
const localizacoesRoutes = require("./routes/localizacoes.routes");
const reservasRoutes = require("./routes/reservas.routes"); 


app.use("/api/mecanicos", mecanicosRoutes);
app.use("/api/ferramentas", ferramentasRoutes);
app.use("/api/emprestimos", emprestimosRoutes);
app.use("/api/localizacoes", localizacoesRoutes);
app.use("/api/reservas", reservasRoutes); 


app.get("/", (req, res) => {
  res.send("Backend MecMax rodando!");
});


app.use((err, req, res, next) => {
  console.error("!!! [SERVIDOR] Erro não tratado:", err);
  res.status(500).json({ success: false, message: "Erro interno do servidor." });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Backend MecMax rodando na porta ${PORT}`);
});