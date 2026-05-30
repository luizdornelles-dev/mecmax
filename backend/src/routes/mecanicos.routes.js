const express = require("express");
const router = express.Router();
const mecanicosController = require("../controllers/mecanicos.controller");

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

// Rota pública de login
router.post("/login", mecanicosController.login);

// Rotas administrativas protegidas
router.get("/", exigirGerente, mecanicosController.listarMecanicos);
router.post("/", exigirGerente, mecanicosController.criarMecanico);
router.get("/:id", exigirGerente, mecanicosController.buscarMecanico);
router.put("/:id", exigirGerente, mecanicosController.atualizarMecanico);
router.delete("/:id", exigirGerente, mecanicosController.excluirMecanico);

module.exports = router;