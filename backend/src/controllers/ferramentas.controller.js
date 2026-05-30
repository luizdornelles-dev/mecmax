// backend/src/controllers/ferramentas.controller.js
const db = require("../config/db");

const extrairDados = (consulta) => {
  if (Array.isArray(consulta) && Array.isArray(consulta[0])) return consulta[0];
  if (Array.isArray(consulta)) return consulta;
  if (consulta && consulta.insertId) return consulta;
  if (Array.isArray(consulta) && consulta[0] && consulta[0].insertId) return consulta[0];
  return [];
};

exports.listarFerramentas = async (req, res) => {
  try {
    const sql = `
      SELECT f.*, c.nome_categoria, sf.descricao_status AS status_ferramenta 
      FROM ferramentas f
      LEFT JOIN categorias c ON f.id_categoria = c.id_categoria
      LEFT JOIN status_ferramenta sf ON f.id_status = sf.id_status
      ORDER BY f.nome_ferramenta ASC
    `;
    const consulta = await db.query(sql);
    return res.json({ success: true, data: extrairDados(consulta) });
  } catch (err) {
    console.error("Erro listarFerramentas:", err);
    return res.status(500).json({ success: false, message: "Erro." });
  }
};

exports.listarFerramentasCompleto = async (req, res) => {
  try {
    const sql = `
      SELECT 
        f.id_ferramenta,
        f.codigo_ferramenta,
        f.nome_ferramenta,
        f.marca,
        f.descricao,
        c.nome_categoria,
        sf.descricao_status AS status_ferramenta,
        f.id_status,
        e.id_emprestimo,
        l.nome_local AS local_uso,
        e.previsao_devolucao AS previsao,
        m.nome_completo AS mecanico,
        m.id_mecanico
      FROM ferramentas f
      LEFT JOIN categorias c ON f.id_categoria = c.id_categoria
      LEFT JOIN status_ferramenta sf ON f.id_status = sf.id_status
      LEFT JOIN emprestimos e 
        ON f.id_ferramenta = e.id_ferramenta 
        AND e.status_emprestimo IN ('ATIVO', 'ATRASADO')
      LEFT JOIN mecanicos m ON e.id_mecanico = m.id_mecanico
      LEFT JOIN localizacoes l ON e.id_localizacao = l.id_localizacao
      ORDER BY f.nome_ferramenta ASC
    `;

    const consulta = await db.query(sql);
    const results = extrairDados(consulta);

    const dados = Array.isArray(results)
      ? results.map((item) => {
          const statusSemEmprestimo = [1, 3, 5];

          return {
            ...item,
            status: item.status_ferramenta || "-",
            mecanico: statusSemEmprestimo.includes(Number(item.id_status))
              ? "-"
              : item.mecanico || "-",
            local_uso: statusSemEmprestimo.includes(Number(item.id_status))
              ? "-"
              : item.local_uso || "-"
          };
        })
      : [];

    return res.json({ success: true, data: dados });
  } catch (err) {
    console.error("Erro listarFerramentasCompleto:", err);
    return res.status(500).json({ success: false, message: "Erro." });
  }
};

exports.criarFerramenta = async (req, res) => {
  try {
    const {
      codigo_ferramenta,
      nome_ferramenta,
      marca,
      id_categoria,
      observacoes
    } = req.body;

    if (!codigo_ferramenta || !nome_ferramenta) {
      return res.status(400).json({
        success: false,
        message: "Dados incompletos."
      });
    }

    const regexCodigo = /^[A-Z]{3}[0-9]{3}$/;

    if (!regexCodigo.test(codigo_ferramenta)) {
      return res.status(400).json({
        success: false,
        message: "O código deve ter 3 letras e 3 números (Ex: CHP001)."
      });
    }

    const checkQuery = await db.query(
      "SELECT id_ferramenta FROM ferramentas WHERE codigo_ferramenta = ?",
      [codigo_ferramenta]
    );

    const existe = extrairDados(checkQuery);

    if (existe && existe.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Código já existe."
      });
    }

    await db.query(
      `
        INSERT INTO ferramentas
          (codigo_ferramenta, nome_ferramenta, marca, id_categoria, descricao, id_status, data_aquisicao)
        VALUES (?, ?, ?, ?, ?, 1, NOW())
      `,
      [
        codigo_ferramenta,
        nome_ferramenta,
        marca,
        id_categoria,
        observacoes
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Cadastrado!"
    });
  } catch (err) {
    console.error("Erro criarFerramenta:", err);
    return res.status(500).json({
      success: false,
      message: "Erro ao cadastrar."
    });
  }
};

exports.buscarFerramenta = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        f.*,
        c.nome_categoria,
        sf.descricao_status
      FROM ferramentas f
      LEFT JOIN categorias c ON f.id_categoria = c.id_categoria
      LEFT JOIN status_ferramenta sf ON f.id_status = sf.id_status
      WHERE f.id_ferramenta = ?
    `;

    const consulta = await db.query(sql, [id]);
    const result = extrairDados(consulta);

    return res.json({
      success: true,
      data: result ? result[0] : null
    });
  } catch (err) {
    console.error("Erro buscarFerramenta:", err);
    return res.status(500).json({
      success: false,
      message: "Erro."
    });
  }
};

exports.atualizarFerramenta = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      nome_ferramenta,
      marca,
      id_categoria,
      observacoes,
      id_status,
      codigo_ferramenta
    } = req.body;

    const consultaFerramentaAtual = await db.query(
      `
        SELECT id_ferramenta, id_status
        FROM ferramentas
        WHERE id_ferramenta = ?
      `,
      [id]
    );

    const ferramentaAtual = extrairDados(consultaFerramentaAtual);

    if (!ferramentaAtual || ferramentaAtual.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ferramenta não encontrada."
      });
    }

    const statusAtual = Number(ferramentaAtual[0].id_status);
    const statusAutomaticos = [2, 4];
    const statusPermitidos = [1, 3, 5];

    let statusParaSalvar = statusAtual;

    if (statusAutomaticos.includes(statusAtual)) {
      // Ferramentas emprestadas ou atrasadas podem ter dados cadastrais editados,
      // mas o status automático deve ser preservado.
      statusParaSalvar = statusAtual;
    } else {
      const novoStatus = Number(id_status || statusAtual);

      if (!statusPermitidos.includes(novoStatus)) {
        return res.status(400).json({
          success: false,
          message: "Este status é controlado automaticamente pelo sistema."
        });
      }

      statusParaSalvar = novoStatus;
    }

    if (codigo_ferramenta) {
      const regexCodigo = /^[A-Z]{3}[0-9]{3}$/;

      if (!regexCodigo.test(codigo_ferramenta)) {
        return res.status(400).json({
          success: false,
          message: "Código inválido. Utilize o formato CHP001."
        });
      }

      const checkDuplicate = await db.query(
        `
          SELECT id_ferramenta
          FROM ferramentas
          WHERE codigo_ferramenta = ?
            AND id_ferramenta != ?
        `,
        [codigo_ferramenta, id]
      );

      const duplicada = extrairDados(checkDuplicate);

      if (duplicada && duplicada.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Este código já está em uso por outra ferramenta."
        });
      }
    }

    await db.query(
      `
        UPDATE ferramentas
        SET
          nome_ferramenta = ?,
          marca = ?,
          id_categoria = ?,
          descricao = ?,
          id_status = ?,
          codigo_ferramenta = ?
        WHERE id_ferramenta = ?
      `,
      [
        nome_ferramenta,
        marca,
        id_categoria,
        observacoes,
        statusParaSalvar,
        codigo_ferramenta,
        id
      ]
    );

    return res.json({
      success: true,
      message: "Ferramenta atualizada com sucesso."
    });
  } catch (err) {
    console.error("Erro atualizarFerramenta:", err);

    return res.status(500).json({
      success: false,
      message: "Erro ao atualizar ferramenta."
    });
  }
};

exports.excluirFerramenta = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      "DELETE FROM ferramentas WHERE id_ferramenta = ?",
      [id]
    );

    return res.json({
      success: true,
      message: "Ferramenta excluída permanentemente."
    });
  } catch (err) {
    if (err.code === "ER_ROW_IS_REFERENCED_2" || err.errno === 1451) {
      return res.status(400).json({
        success: false,
        message:
          "Não é possível excluir: Esta ferramenta tem histórico de uso. Inative-a em vez disso."
      });
    }

    console.error("Erro excluirFerramenta:", err);

    return res.status(500).json({
      success: false,
      message: "Erro ao excluir."
    });
  }
};

exports.enviarManutencao = async (req, res) => {
  try {
    const { id } = req.params;

    const consultaFerramenta = await db.query(
      `
        SELECT id_ferramenta, id_status
        FROM ferramentas
        WHERE id_ferramenta = ?
      `,
      [id]
    );

    const ferramenta = extrairDados(consultaFerramenta);

    if (!ferramenta || ferramenta.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ferramenta não encontrada."
      });
    }

    if ([2, 4].includes(Number(ferramenta[0].id_status))) {
      return res.status(400).json({
        success: false,
        message: "Ferramenta emprestada ou atrasada não pode ser enviada para manutenção."
      });
    }

    const consultaEmprestimoAtivo = await db.query(
      `
        SELECT id_emprestimo
        FROM emprestimos
        WHERE id_ferramenta = ?
          AND status_emprestimo IN ('ATIVO', 'ATRASADO')
          AND data_devolucao IS NULL
        LIMIT 1
      `,
      [id]
    );

    const emprestimoAtivo = extrairDados(consultaEmprestimoAtivo);

    if (emprestimoAtivo && emprestimoAtivo.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Ferramenta com empréstimo ativo ou atrasado não pode ser enviada para manutenção."
      });
    }

    await db.query(
      "UPDATE ferramentas SET id_status = 3 WHERE id_ferramenta = ?",
      [id]
    );

    return res.json({
      success: true,
      message: "Ferramenta enviada para manutenção."
    });
  } catch (err) {
    console.error("Erro enviarManutencao:", err);

    return res.status(500).json({
      success: false,
      message: "Erro ao enviar ferramenta para manutenção."
    });
  }
};