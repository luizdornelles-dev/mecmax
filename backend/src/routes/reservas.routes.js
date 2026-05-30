const express = require("express");
const router = express.Router();
const reservasController = require("../controllers/reservas.controller");

router.get("/", reservasController.listarReservas);  
router.post("/", reservasController.criarReserva); 
router.get("/:id", reservasController.buscarReserva);
router.put("/:id", reservasController.atualizarReserva);
router.delete("/:id", reservasController.cancelarReserva);

module.exports = router;