const express = require("express");
const router = express.Router();
const localizacoesController = require("../controllers/localizacoes.controller");

// Middleware simples para proteger ações administrativas
const exigirGerente = (req, res, next) => {
  const perfil = req.headers["x-user-perfil"];

  if (perfil !== "GERENTE") {
    return res.status(403).json({
      success: false,
      message: "Acesso negado. Esta ação é exclusiva para gerente."
    });
  }

  next();
};

// Rotas de consulta
router.get("/", localizacoesController.listarLocalizacoes);
router.get("/:id", exigirGerente, localizacoesController.buscarLocal);

// Rotas administrativas protegidas
router.post("/", exigirGerente, localizacoesController.criarLocalizacao);
router.put("/:id", exigirGerente, localizacoesController.atualizarLocal);
router.delete("/:id", exigirGerente, localizacoesController.excluirLocal);

module.exports = router;