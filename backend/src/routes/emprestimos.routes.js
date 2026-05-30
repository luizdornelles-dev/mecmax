// backend/src/routes/emprestimos.routes.js
const express = require("express");
const router = express.Router();
const emprestimosController = require("../controllers/emprestimos.controller");


router.get("/", emprestimosController.listarEmprestimos);

router.get("/relatorio", emprestimosController.relatorioGeral);

router.get("/mecanico/:idMecanico", emprestimosController.listarEmprestimosPorMecanico);

router.get("/:id", emprestimosController.buscarEmprestimo);


router.post("/", emprestimosController.criarEmprestimo);

router.put("/:id", emprestimosController.atualizarEmprestimo);

router.put("/:id/devolver", emprestimosController.devolverFerramenta);

module.exports = router;