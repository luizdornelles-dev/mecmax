// backend/src/routes/index.js
const express = require("express");
const router = express.Router();

const mecanicosRoutes = require("./mecanicos.routes");
const ferramentasRoutes = require("./ferramentas.routes");
const emprestimosRoutes = require("./emprestimos.routes");
const reservasRoutes = require("./reservas.routes");
const localizacoesRoutes = require("./localizacoes.routes"); 

router.use("/mecanicos", mecanicosRoutes);
router.use("/ferramentas", ferramentasRoutes);
router.use("/emprestimos", emprestimosRoutes);
router.use("/reservas", reservasRoutes);
router.use("/localizacoes", localizacoesRoutes); 

module.exports = router;
