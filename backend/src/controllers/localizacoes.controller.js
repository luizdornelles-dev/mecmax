const db = require("../config/db");

const extrairDados = (consulta) => {
  if (Array.isArray(consulta) && Array.isArray(consulta[0])) return consulta[0];
  if (Array.isArray(consulta)) return consulta;
  return [];
};

exports.listarLocalizacoes = async (req, res) => {
  try {
    const sql = "SELECT * FROM localizacoes ORDER BY nome_local";
    const consulta = await db.query(sql);
    return res.json({ success: true, data: extrairDados(consulta) });
  } catch (err) { return res.status(500).json({ success: false, message: "Erro." }); }
};

exports.criarLocalizacao = async (req, res) => {
  try {
    const { nome_local, tipo_local, codigo_local } = req.body;
    if (!nome_local || !codigo_local) return res.status(400).json({ success: false, message: "Dados incompletos." });

    // Validação do formato do código (3 números + 3 letras)
    if (!/^[0-9]{3}[A-Z]{3}$/.test(codigo_local)) {
      return res.status(400).json({ success: false, message: "Código deve ser 3 números e 3 letras (Ex: 001BOX)." });
    }

    await db.query("INSERT INTO localizacoes (nome_local, tipo_local, codigo_local) VALUES (?, ?, ?)", [nome_local, tipo_local, codigo_local]);
    return res.status(201).json({ success: true, message: "Local criado!" });
  } catch (err) { 
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: "Código já existe." });
    return res.status(500).json({ success: false, message: "Erro ao criar." });
  }
};

exports.buscarLocal = async (req, res) => {
  try {
    const { id } = req.params;
    const consulta = await db.query("SELECT * FROM localizacoes WHERE id_localizacao = ?", [id]);
    const resData = extrairDados(consulta);
    return res.json({ success: true, data: resData ? resData[0] : null });
  } catch (err) { return res.status(500).json({ success: false, message: "Erro." }); }
};

exports.atualizarLocal = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome_local, tipo_local, codigo_local } = req.body;
    
    if (!/^[0-9]{3}[A-Z]{3}$/.test(codigo_local)) {
      return res.status(400).json({ success: false, message: "Código inválido." });
    }

    await db.query("UPDATE localizacoes SET nome_local=?, tipo_local=?, codigo_local=? WHERE id_localizacao=?", [nome_local, tipo_local, codigo_local, id]);
    return res.json({ success: true, message: "Atualizado." });
  } catch (err) { return res.status(500).json({ success: false, message: "Erro." }); }
};

exports.excluirLocal = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM localizacoes WHERE id_localizacao = ?", [id]);
    return res.json({ success: true, message: "Excluído." });
  } catch (err) { return res.status(500).json({ success: false, message: "Erro (em uso?)." }); }
};