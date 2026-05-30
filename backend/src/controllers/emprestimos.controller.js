// backend/src/controllers/emprestimos.controller.js
const db = require("../config/db");

const extrairDados = (consulta) => {
  if (Array.isArray(consulta) && Array.isArray(consulta[0])) return consulta[0];
  if (Array.isArray(consulta)) return consulta;
  return [];
};

// Atualiza automaticamente empréstimos vencidos
const atualizarEmprestimosAtrasados = async () => {
  await db.query(`
    UPDATE emprestimos
    SET status_emprestimo = 'ATRASADO'
    WHERE status_emprestimo = 'ATIVO'
      AND previsao_devolucao < NOW()
      AND data_devolucao IS NULL
  `);

  await db.query(`
    UPDATE ferramentas f
    JOIN emprestimos e
      ON e.id_ferramenta = f.id_ferramenta
    SET f.id_status = 4
    WHERE e.status_emprestimo = 'ATRASADO'
      AND e.data_devolucao IS NULL
      AND f.id_status = 2
  `);
};

// Converte texto (nome do local) em ID numérico
const obterIdLocalizacao = async (valor) => {
  if (!valor) return null;
  if (!isNaN(valor)) return parseInt(valor);

  const sql = "SELECT id_localizacao FROM localizacoes WHERE nome_local = ?";
  const consulta = await db.query(sql, [valor]);
  const result = extrairDados(consulta);

  if (result && result.length > 0) {
    return result[0].id_localizacao;
  }

  return null;
};

// Busca reserva ativa do próprio mecânico para a ferramenta no momento da retirada
const obterReservaAtivaDoMecanico = async (idFerramenta, idMecanico) => {
  const sql = `
    SELECT id_reserva
    FROM reservas
    WHERE id_ferramenta = ?
      AND id_mecanico = ?
      AND status_reserva = 'ATIVA'
      AND data_reserva_inicio <= NOW()
      AND data_reserva_fim >= NOW()
    ORDER BY data_reserva_inicio ASC
    LIMIT 1
  `;

  const consulta = await db.query(sql, [idFerramenta, idMecanico]);
  const reservas = extrairDados(consulta);

  if (!reservas || reservas.length === 0) {
    return null;
  }

  return reservas[0];
};

// Verifica conflito entre um período e reservas ativas da ferramenta
const existeReservaConflitante = async (
  idFerramenta,
  inicio,
  fim,
  ignorarReserva = null
) => {
  let sql = `
    SELECT id_reserva
    FROM reservas
    WHERE id_ferramenta = ?
      AND status_reserva = 'ATIVA'
      AND data_reserva_inicio < ?
      AND data_reserva_fim > ?
  `;

  const params = [idFerramenta, fim, inicio];

  if (ignorarReserva) {
    sql += ` AND id_reserva != ?`;
    params.push(ignorarReserva);
  }

  sql += ` LIMIT 1`;

  const consulta = await db.query(sql, params);
  const reservas = extrairDados(consulta);

  return reservas && reservas.length > 0;
};

exports.listarEmprestimos = async (req, res) => {
  try {
    await atualizarEmprestimosAtrasados();

    const sql = `
      SELECT 
        e.id_emprestimo,
        e.data_retirada,
        e.previsao_devolucao,
        e.data_devolucao,
        e.status_emprestimo,
        f.codigo_ferramenta,
        f.nome_ferramenta,
        m.nome_completo AS nome_mecanico
      FROM emprestimos e
      JOIN ferramentas f ON e.id_ferramenta = f.id_ferramenta
      JOIN mecanicos m ON e.id_mecanico = m.id_mecanico
      ORDER BY e.data_retirada DESC
    `;

    const consulta = await db.query(sql);
    return res.json({ success: true, data: extrairDados(consulta) });
  } catch (err) {
    console.error("Erro listarEmprestimos:", err);
    return res.status(500).json({ success: false, message: "Erro interno." });
  }
};

exports.listarEmprestimosPorMecanico = async (req, res) => {
  try {
    await atualizarEmprestimosAtrasados();

    const { idMecanico } = req.params;

    const sql = `
      SELECT 
        e.id_emprestimo,
        e.data_retirada,
        e.previsao_devolucao,
        e.data_devolucao,
        e.status_emprestimo,
        l.nome_local AS local_uso,
        f.codigo_ferramenta,
        f.nome_ferramenta
      FROM emprestimos e
      JOIN ferramentas f ON e.id_ferramenta = f.id_ferramenta
      LEFT JOIN localizacoes l ON e.id_localizacao = l.id_localizacao
      WHERE e.id_mecanico = ?
      ORDER BY e.data_retirada DESC
    `;

    const consulta = await db.query(sql, [idMecanico]);
    return res.json({ success: true, data: extrairDados(consulta) });
  } catch (err) {
    console.error("Erro listarEmprestimosPorMecanico:", err);
    return res.status(500).json({ success: false, message: "Erro interno." });
  }
};

exports.criarEmprestimo = async (req, res) => {
  try {
    await atualizarEmprestimosAtrasados();

    const {
      id_mecanico,
      codigo_ferramenta,
      previsao_devolucao,
      local_uso,
      id_localizacao
    } = req.body;

    const id_local_final = await obterIdLocalizacao(id_localizacao || local_uso);

    if (!id_mecanico || !codigo_ferramenta || !previsao_devolucao || !id_local_final) {
      return res.status(400).json({
        success: false,
        message: "Dados incompletos. Informe ferramenta, previsão de devolução e local de uso."
      });
    }

    const dataPrevisao = new Date(previsao_devolucao);
    const agora = new Date();

    if (Number.isNaN(dataPrevisao.getTime()) || dataPrevisao <= agora) {
      return res.status(400).json({
        success: false,
        message: "A previsão de devolução deve ser uma data futura."
      });
    }

    const consultaFerr = await db.query(
      "SELECT id_ferramenta, id_status FROM ferramentas WHERE codigo_ferramenta = ?",
      [codigo_ferramenta]
    );

    const ferramentas = extrairDados(consultaFerr);

    if (!ferramentas || ferramentas.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ferramenta não encontrada."
      });
    }

    const ferramenta = ferramentas[0];

    if (Number(ferramenta.id_status) !== 1) {
      return res.status(400).json({
        success: false,
        message: "Ferramenta não está disponível."
      });
    }

    const reservaDoMecanico = await obterReservaAtivaDoMecanico(
      ferramenta.id_ferramenta,
      id_mecanico
    );

    const idReservaLiberada = reservaDoMecanico
      ? reservaDoMecanico.id_reserva
      : null;

    const haReservaConflitante = await existeReservaConflitante(
      ferramenta.id_ferramenta,
      new Date(),
      previsao_devolucao,
      idReservaLiberada
    );

    if (haReservaConflitante) {
      return res.status(400).json({
        success: false,
        message: "Não é possível registrar o empréstimo: existe reserva ativa para esta ferramenta dentro do período informado."
      });
    }

    const sqlInsert = `
      INSERT INTO emprestimos
        (id_mecanico, id_ferramenta, previsao_devolucao, id_localizacao, status_emprestimo)
      VALUES (?, ?, ?, ?, 'ATIVO')
    `;

    await db.query(sqlInsert, [
      id_mecanico,
      ferramenta.id_ferramenta,
      previsao_devolucao,
      id_local_final
    ]);

    await db.query(
      "UPDATE ferramentas SET id_status = 2 WHERE id_ferramenta = ?",
      [ferramenta.id_ferramenta]
    );

    if (idReservaLiberada) {
      await db.query(
        `
          UPDATE reservas
          SET status_reserva = 'CUMPRIDA'
          WHERE id_reserva = ?
            AND status_reserva = 'ATIVA'
        `,
        [idReservaLiberada]
      );
    }

    return res.json({
      success: true,
      message: "Empréstimo registrado com sucesso."
    });
  } catch (err) {
    console.error("Erro criarEmprestimo:", err);
    return res.status(500).json({
      success: false,
      message: "Erro ao registrar empréstimo."
    });
  }
};

exports.buscarEmprestimo = async (req, res) => {
  try {
    await atualizarEmprestimosAtrasados();

    const { id } = req.params;

    const sql = `
      SELECT 
        e.*,
        f.codigo_ferramenta,
        f.nome_ferramenta,
        l.nome_local AS local_uso
      FROM emprestimos e
      JOIN ferramentas f ON e.id_ferramenta = f.id_ferramenta
      LEFT JOIN localizacoes l ON e.id_localizacao = l.id_localizacao
      WHERE e.id_emprestimo = ?
    `;

    const consulta = await db.query(sql, [id]);
    const results = extrairDados(consulta);

    if (!results || results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Empréstimo não encontrado."
      });
    }

    return res.json({ success: true, data: results[0] });
  } catch (err) {
    console.error("Erro buscarEmprestimo:", err);
    return res.status(500).json({ success: false, message: "Erro interno." });
  }
};

exports.atualizarEmprestimo = async (req, res) => {
  try {
    await atualizarEmprestimosAtrasados();

    const { id } = req.params;
    const { previsao_devolucao, local_uso, id_localizacao } = req.body;

    const id_local_final = await obterIdLocalizacao(id_localizacao || local_uso);

    if (!previsao_devolucao || !id_local_final) {
      return res.status(400).json({
        success: false,
        message: "Informe a previsão de devolução e o local de uso."
      });
    }

    const consultaEmprestimo = await db.query(
      `
        SELECT id_emprestimo, id_ferramenta, data_retirada, status_emprestimo
        FROM emprestimos
        WHERE id_emprestimo = ?
      `,
      [id]
    );

    const emprestimos = extrairDados(consultaEmprestimo);

    if (!emprestimos || emprestimos.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Empréstimo não encontrado."
      });
    }

    const emprestimo = emprestimos[0];

    if (!["ATIVO", "ATRASADO"].includes(emprestimo.status_emprestimo)) {
      return res.status(400).json({
        success: false,
        message: "Só é possível editar empréstimos ativos ou atrasados."
      });
    }

    const novaPrevisao = new Date(previsao_devolucao);
    const dataRetirada = new Date(emprestimo.data_retirada);

    if (Number.isNaN(novaPrevisao.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Data de previsão inválida."
      });
    }

    if (novaPrevisao <= dataRetirada) {
      return res.status(400).json({
        success: false,
        message: "A previsão de devolução deve ser posterior à data de retirada."
      });
    }

    const haReservaConflitante = await existeReservaConflitante(
      emprestimo.id_ferramenta,
      emprestimo.data_retirada,
      previsao_devolucao
    );

    if (haReservaConflitante) {
      return res.status(400).json({
        success: false,
        message: "Não é possível alterar a previsão: existe reserva ativa para esta ferramenta dentro do novo período."
      });
    }

    const novoStatus = novaPrevisao < new Date() ? "ATRASADO" : "ATIVO";
    const novoStatusFerramenta = novoStatus === "ATRASADO" ? 4 : 2;

    await db.query(
      `
        UPDATE emprestimos
        SET previsao_devolucao = ?,
            id_localizacao = ?,
            status_emprestimo = ?
        WHERE id_emprestimo = ?
      `,
      [previsao_devolucao, id_local_final, novoStatus, id]
    );

    await db.query(
      "UPDATE ferramentas SET id_status = ? WHERE id_ferramenta = ?",
      [novoStatusFerramenta, emprestimo.id_ferramenta]
    );

    return res.json({
      success: true,
      message: "Atualizado com sucesso."
    });
  } catch (err) {
    console.error("Erro atualizarEmprestimo:", err);
    return res.status(500).json({
      success: false,
      message: "Erro ao atualizar."
    });
  }
};

exports.devolverFerramenta = async (req, res) => {
  try {
    await atualizarEmprestimosAtrasados();

    const { id } = req.params;

    const consulta = await db.query(
      `
        SELECT id_emprestimo, id_ferramenta, status_emprestimo
        FROM emprestimos
        WHERE id_emprestimo = ?
      `,
      [id]
    );

    const emprestimos = extrairDados(consulta);

    if (!emprestimos || emprestimos.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Empréstimo não encontrado."
      });
    }

    const emprestimo = emprestimos[0];

    if (!["ATIVO", "ATRASADO"].includes(emprestimo.status_emprestimo)) {
      return res.status(400).json({
        success: false,
        message: "Somente empréstimos ativos ou atrasados podem ser devolvidos."
      });
    }

    await db.query(
      `
        UPDATE emprestimos
        SET status_emprestimo = 'FINALIZADO',
            data_devolucao = NOW()
        WHERE id_emprestimo = ?
      `,
      [id]
    );

    await db.query(
      `
        UPDATE ferramentas
        SET id_status = 1
        WHERE id_ferramenta = ?
          AND id_status IN (2, 4)
      `,
      [emprestimo.id_ferramenta]
    );

    return res.json({
      success: true,
      message: "Devolução registrada com sucesso."
    });
  } catch (err) {
    console.error("Erro devolverFerramenta:", err);

    return res.status(500).json({
      success: false,
      message: "Erro ao devolver ferramenta."
    });
  }
};

exports.relatorioGeral = async (req, res) => {
  try {
    await atualizarEmprestimosAtrasados();

    const sql = `
      SELECT 
        e.id_emprestimo,
        f.codigo_ferramenta,
        f.nome_ferramenta,
        m.nome_completo AS mecanico,
        e.data_retirada,
        e.data_devolucao,
        e.status_emprestimo,
        l.nome_local AS local_uso
      FROM emprestimos e
      JOIN ferramentas f ON e.id_ferramenta = f.id_ferramenta
      JOIN mecanicos m ON e.id_mecanico = m.id_mecanico
      LEFT JOIN localizacoes l ON e.id_localizacao = l.id_localizacao
      ORDER BY e.data_retirada DESC
    `;

    const consulta = await db.query(sql);

    return res.json({
      success: true,
      data: extrairDados(consulta)
    });
  } catch (err) {
    console.error("Erro relatorioGeral:", err);
    return res.status(500).json({
      success: false,
      message: "Erro ao gerar relatório."
    });
  }
};