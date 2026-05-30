// backend/src/controllers/mecanicos.controller.js
const db = require("../config/db");

const extrairDados = (consulta) => {
  if (Array.isArray(consulta) && Array.isArray(consulta[0])) return consulta[0];
  if (Array.isArray(consulta)) return consulta;
  return [];
};

// ==========================================
// LOGIN
// ==========================================
exports.login = async (req, res) => {
  try {
    const { matricula, senha } = req.body;
    
    if (!matricula || !senha) {
      return res.status(400).json({ success: false, message: "Informe a matrícula e a senha." });
    }

    const sql = "SELECT id_mecanico, matricula, nome_completo, perfil, status_usuario FROM mecanicos WHERE matricula = ? AND senha = ?";
    const consulta = await db.query(sql, [matricula, senha]);
    const results = extrairDados(consulta);

    if (results && results.length > 0) {
      const mecanico = results[0];
      
      if (mecanico.status_usuario === 'INATIVO') {
        return res.status(403).json({ success: false, message: "Acesso bloqueado: Usuário inativo." });
      }
      
      return res.json({ success: true, message: "Login autorizado!", data: mecanico });
    } else {
      return res.status(401).json({ success: false, message: "Matrícula ou senha incorretos." });
    }
  } catch (err) { 
    return res.status(500).json({ success: false, message: "Erro interno no servidor." }); 
  }
};

// ==========================================
// LISTAR
// ==========================================
exports.listarMecanicos = async (req, res) => {
  try {
    const sql = "SELECT id_mecanico, matricula, nome_completo, perfil, status_usuario FROM mecanicos WHERE status_usuario = 'ATIVO' ORDER BY nome_completo";
    const consulta = await db.query(sql);
    return res.json({ success: true, data: extrairDados(consulta) });
  } catch (err) { return res.status(500).json({ success: false, message: "Erro interno." }); }
};

// ==========================================
// CRIAR (Permite nomes iguais, bloqueia apenas matrícula igual)
// ==========================================
exports.criarMecanico = async (req, res) => {
  try {
    const { matricula, nome_completo, senha, perfil } = req.body;
    
    if (!matricula || !nome_completo || !senha) {
      return res.status(400).json({ success: false, message: "Dados incompletos. A senha é obrigatória." });
    }

    const perfilFinal = perfil || 'MECANICO';

    // A VALIDAÇÃO AQUI CHECA APENAS A MATRÍCULA
    const consultaExistente = await db.query("SELECT id_mecanico FROM mecanicos WHERE matricula = ?", [matricula]);
    const existente = extrairDados(consultaExistente);

    if (existente && existente.length > 0) {
      return res.status(409).json({ success: false, message: "Esta matrícula já existe no sistema." });
    }

    await db.query(
      "INSERT INTO mecanicos (matricula, nome_completo, senha, perfil, status_usuario) VALUES (?, ?, ?, ?, 'ATIVO')", 
      [matricula, nome_completo, senha, perfilFinal]
    );
    return res.status(201).json({ success: true, message: "Usuário cadastrado com sucesso!" });
  } catch (err) { 
    return res.status(500).json({ success: false, message: "Erro ao cadastrar usuário." }); 
  }
};

// ==========================================
// BUSCAR POR ID
// ==========================================
exports.buscarMecanico = async (req, res) => {
  try {
    const { id } = req.params;
    const consulta = await db.query("SELECT id_mecanico, nome_completo, matricula, perfil, status_usuario FROM mecanicos WHERE id_mecanico = ?", [id]);
    const results = extrairDados(consulta);
    if (results && results.length > 0) return res.json({ success: true, data: results[0] });
    return res.status(404).json({ success: false, message: "Usuário não encontrado." });
  } catch (err) { return res.status(500).json({ success: false, message: "Erro de busca." }); }
};

// ==========================================
// ATUALIZAR
// ==========================================
exports.atualizarMecanico = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome_completo, matricula, senha, perfil } = req.body; 
    
    // A VALIDAÇÃO AQUI CHECA APENAS SE A MATRÍCULA JÁ PERTENCE A OUTRO ID
    const checkSql = "SELECT id_mecanico FROM mecanicos WHERE matricula = ? AND id_mecanico != ?";
    const checkQuery = await db.query(checkSql, [matricula, id]);
    const existe = extrairDados(checkQuery);

    if (existe && existe.length > 0) {
      return res.status(409).json({ success: false, message: "Erro: Matrícula já pertence a outro usuário." });
    }

    const perfilFinal = perfil || 'MECANICO';

    if (senha && senha.trim() !== "") {
      await db.query(
        "UPDATE mecanicos SET nome_completo = ?, matricula = ?, senha = ?, perfil = ? WHERE id_mecanico = ?", 
        [nome_completo, matricula, senha, perfilFinal, id]
      );
    } else {
      await db.query(
        "UPDATE mecanicos SET nome_completo = ?, matricula = ?, perfil = ? WHERE id_mecanico = ?", 
        [nome_completo, matricula, perfilFinal, id]
      );
    }

    return res.json({ success: true, message: "Usuário atualizado com sucesso." });
  } catch (err) { 
    console.error(err);
    return res.status(500).json({ success: false, message: "Erro ao atualizar usuário." }); 
  }
};

// ==========================================
// EXCLUIR (Inativar)
// ==========================================
exports.excluirMecanico = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("UPDATE mecanicos SET status_usuario = 'INATIVO' WHERE id_mecanico = ?", [id]);
    return res.json({ success: true, message: "Usuário inativado." });
  } catch (err) { return res.status(500).json({ success: false, message: "Erro ao excluir." }); }
};