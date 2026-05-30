const express = require('express');
const router = express.Router();
const ferramentasController = require('../controllers/ferramentas.controller');

// Middleware simples para proteger ações administrativas
const exigirGerente = (req, res, next) => {
  const perfil = req.headers['x-user-perfil'];

  if (perfil !== 'GERENTE') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Esta ação é exclusiva para gerente.'
    });
  }

  next();
};

// Rotas de consulta
router.get('/', ferramentasController.listarFerramentas);
router.get('/completo', ferramentasController.listarFerramentasCompleto);
router.get('/:id', ferramentasController.buscarFerramenta);

// Rotas administrativas protegidas
router.post('/', exigirGerente, ferramentasController.criarFerramenta);
router.put('/:id', exigirGerente, ferramentasController.atualizarFerramenta);
router.put('/:id/excluir', exigirGerente, ferramentasController.excluirFerramenta);
router.put('/:id/manutencao', exigirGerente, ferramentasController.enviarManutencao);

module.exports = router;