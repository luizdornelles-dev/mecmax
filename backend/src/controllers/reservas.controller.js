// backend/src/controllers/reservas.controller.js
const db = require('../config/db');

const extrairDados = (consulta) => {
  if (Array.isArray(consulta) && Array.isArray(consulta[0])) return consulta[0];
  if (Array.isArray(consulta)) return consulta;
  if (consulta && typeof consulta === 'object' && 'insertId' in consulta) return consulta;
  if (Array.isArray(consulta) && consulta[0] && 'insertId' in consulta[0]) return consulta[0];
  return [];
};

// FUNÇÕES AUXILIARES

const periodoInvalido = (inicio, fim) => {
  const dataInicio = new Date(inicio);
  const dataFim = new Date(fim);

  if (Number.isNaN(dataInicio.getTime())) return true;
  if (Number.isNaN(dataFim.getTime())) return true;

  return dataFim <= dataInicio;
};

const dataNoPassado = (inicio) => {
  return new Date(inicio) < new Date();
};

// Atualiza automaticamente reservas vencidas que não foram utilizadas
const atualizarReservasExpiradas = async () => {
  await db.query(`
    UPDATE reservas
    SET status_reserva = 'EXPIRADA'
    WHERE status_reserva = 'ATIVA'
      AND data_reserva_fim < NOW()
  `);
};

const ferramentaReservavel = async (id_ferramenta) => {
  const consulta = await db.query(
    `
      SELECT 
        id_ferramenta,
        id_status
      FROM ferramentas
      WHERE id_ferramenta = ?
    `,
    [id_ferramenta]
  );

  const ferramentas = extrairDados(consulta);

  if (!ferramentas || ferramentas.length === 0) {
    return {
      existe: false
    };
  }

  const ferramenta = ferramentas[0];

    if ([3, 5].includes(Number(ferramenta.id_status))) {
    return {
      existe: true,
      reservavel: false
    };
  }

  return {
    existe: true,
    reservavel: true
  };
};

const existeConflitoEmprestimo = async (
  id_ferramenta,
  inicio,
  fim
) => {
  const sql = `
    SELECT id_emprestimo
    FROM emprestimos
    WHERE id_ferramenta = ?
      AND status_emprestimo IN ('ATIVO', 'ATRASADO')
      AND data_retirada < ?
      AND previsao_devolucao > ?
    LIMIT 1
  `;

  const consulta = await db.query(sql, [
    id_ferramenta,
    fim,
    inicio
  ]);

  const conflitos = extrairDados(consulta);

  return conflitos && conflitos.length > 0;
};

const existeConflitoReserva = async (
  id_ferramenta,
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

  const params = [id_ferramenta, fim, inicio];

  if (ignorarReserva) {
    sql += ` AND id_reserva != ?`;
    params.push(ignorarReserva);
  }

  sql += ` LIMIT 1`;

  const consulta = await db.query(sql, params);

  const conflitos = extrairDados(consulta);

  return conflitos && conflitos.length > 0;
};

// 1. LISTAR RESERVAS

exports.listarReservas = async (req, res) => {
  try {
    await atualizarReservasExpiradas();

    const sql = `
      SELECT 
        r.id_reserva,
        r.id_mecanico,
        r.id_ferramenta,
        r.data_reserva_inicio AS data_hora_inicio,
        r.data_reserva_fim AS data_hora_fim,
        r.data_reserva_inicio,
        r.data_reserva_fim,
        r.status_reserva,
        m.nome_completo AS nome_mecanico,
        f.nome_ferramenta,
        f.codigo_ferramenta
      FROM reservas r
      JOIN mecanicos m
        ON r.id_mecanico = m.id_mecanico
      JOIN ferramentas f
        ON r.id_ferramenta = f.id_ferramenta
      ORDER BY f.nome_ferramenta ASC,
               r.data_reserva_inicio DESC
    `;

    const consulta = await db.query(sql);

    return res.json({
      success: true,
      data: extrairDados(consulta)
    });

  } catch (err) {
    console.error('Erro listarReservas:', err);

    return res.status(500).json({
      success: false,
      message: 'Erro no servidor.'
    });
  }
};

// 2. CRIAR RESERVA

exports.criarReserva = async (req, res) => {
  try {
    await atualizarReservasExpiradas();

    const id_mecanico = req.body.id_mecanico;

    let id_ferramenta = req.body.id_ferramenta;

    const codigo_ferramenta =
      req.body.codigo_ferramenta;

    const inicio =
      req.body.data_inicio ||
      req.body.data_reserva_inicio;

    const fim =
      req.body.data_fim ||
      req.body.data_reserva_fim;

    // validação básica

    if (
      !id_mecanico ||
      (!id_ferramenta && !codigo_ferramenta) ||
      !inicio ||
      !fim
    ) {
      return res.status(400).json({
        success: false,
        message: 'Dados incompletos.'
      });
    }

    // datas inválidas

    if (periodoInvalido(inicio, fim)) {
      return res.status(400).json({
        success: false,
        message:
          'A data final deve ser posterior à data inicial.'
      });
    }

    // reserva no passado

    if (dataNoPassado(inicio)) {
      return res.status(400).json({
        success: false,
        message:
          'Não é permitido reservar em datas passadas.'
      });
    }

    // busca ferramenta

    if (!id_ferramenta) {
      const consultaBusca = await db.query(
        `
          SELECT id_ferramenta
          FROM ferramentas
          WHERE codigo_ferramenta = ?
        `,
        [codigo_ferramenta]
      );

      const ferramentas = extrairDados(consultaBusca);

      if (!ferramentas || ferramentas.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Ferramenta não encontrada.'
        });
      }

      id_ferramenta =
        ferramentas[0].id_ferramenta;
    }

    // status ferramenta

    const validacaoFerramenta =
      await ferramentaReservavel(id_ferramenta);

    if (!validacaoFerramenta.existe) {
      return res.status(404).json({
        success: false,
        message: 'Ferramenta não encontrada.'
      });
    }

    if (!validacaoFerramenta.reservavel) {
      return res.status(400).json({
        success: false,
        message:
          'Ferramentas em manutenção ou inativas não podem ser reservadas.'
      });
    }

    // conflito empréstimo

    const conflitoEmprestimo =
      await existeConflitoEmprestimo(
        id_ferramenta,
        inicio,
        fim
      );

    if (conflitoEmprestimo) {
      return res.status(400).json({
        success: false,
        message:
          'Conflito: ferramenta emprestada neste período.'
      });
    }

    // conflito reserva

    const conflitoReserva =
      await existeConflitoReserva(
        id_ferramenta,
        inicio,
        fim
      );

    if (conflitoReserva) {
      return res.status(400).json({
        success: false,
        message:
          'Conflito: já existe reserva ativa neste horário.'
      });
    }

    // insert

    const sqlInsert = `
      INSERT INTO reservas
        (
          id_mecanico,
          id_ferramenta,
          data_reserva_inicio,
          data_reserva_fim,
          status_reserva
        )
      VALUES (?, ?, ?, ?, 'ATIVA')
    `;

    const consultaInsert = await db.query(
      sqlInsert,
      [
        id_mecanico,
        id_ferramenta,
        inicio,
        fim
      ]
    );

    const result =
      extrairDados(consultaInsert);

    const insertId =
      result.insertId ||
      (result[0]
        ? result[0].insertId
        : 0);

    return res.json({
      success: true,
      message: 'Reserva criada com sucesso!',
      id_reserva: insertId
    });

  } catch (err) {
    console.error('Erro criarReserva:', err);

    return res.status(500).json({
      success: false,
      message: 'Erro ao processar reserva.'
    });
  }
};

// 3. CANCELAR RESERVA

exports.cancelarReserva = async (req, res) => {
  try {
    await atualizarReservasExpiradas();

    const { id } = req.params;

    const consultaReserva = await db.query(
      `
        SELECT
          id_reserva,
          status_reserva
        FROM reservas
        WHERE id_reserva = ?
      `,
      [id]
    );

    const reservas =
      extrairDados(consultaReserva);

    if (!reservas || reservas.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reserva não encontrada.'
      });
    }

    const reserva = reservas[0];

    if (reserva.status_reserva !== 'ATIVA') {
      return res.status(400).json({
        success: false,
        message:
          'Somente reservas ativas podem ser canceladas.'
      });
    }

    await db.query(
      `
        UPDATE reservas
        SET status_reserva = 'CANCELADA'
        WHERE id_reserva = ?
      `,
      [id]
    );

    return res.json({
      success: true,
      message: 'Reserva cancelada.'
    });

  } catch (err) {
    console.error('Erro cancelarReserva:', err);

    return res.status(500).json({
      success: false,
      message: 'Erro ao cancelar reserva.'
    });
  }
};

// 4. BUSCAR RESERVA

exports.buscarReserva = async (req, res) => {
  try {
    await atualizarReservasExpiradas();

    const { id } = req.params;

    const sql = `
      SELECT
        r.*,
        f.nome_ferramenta,
        f.codigo_ferramenta
      FROM reservas r
      JOIN ferramentas f
        ON r.id_ferramenta = f.id_ferramenta
      WHERE r.id_reserva = ?
    `;

    const consulta = await db.query(sql, [id]);

    const result = extrairDados(consulta);

    return res.json({
      success: true,
      data: result ? result[0] : null
    });

  } catch (err) {
    console.error('Erro buscarReserva:', err);

    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar reserva.'
    });
  }
};

// 5. ATUALIZAR RESERVA

exports.atualizarReserva = async (req, res) => {
  try {
    await atualizarReservasExpiradas();

    const { id } = req.params;

    const id_ferramenta =
      req.body.id_ferramenta;

    const inicio =
      req.body.inicio ||
      req.body.data_inicio ||
      req.body.data_reserva_inicio;

    const fim =
      req.body.fim ||
      req.body.data_fim ||
      req.body.data_reserva_fim;

    // validação básica

    if (!id_ferramenta || !inicio || !fim) {
      return res.status(400).json({
        success: false,
        message:
          'Dados inválidos para atualização.'
      });
    }

    // verifica reserva

    const consultaReserva = await db.query(
      `
        SELECT
          id_reserva,
          status_reserva
        FROM reservas
        WHERE id_reserva = ?
      `,
      [id]
    );

    const reservas =
      extrairDados(consultaReserva);

    if (!reservas || reservas.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reserva não encontrada.'
      });
    }

    const reserva = reservas[0];

    // status permitido

    if (reserva.status_reserva !== 'ATIVA') {
      return res.status(400).json({
        success: false,
        message:
          'Somente reservas ativas podem ser editadas.'
      });
    }

    // datas inválidas

    if (periodoInvalido(inicio, fim)) {
      return res.status(400).json({
        success: false,
        message:
          'A data final deve ser posterior à inicial.'
      });
    }

    // passado

    if (dataNoPassado(inicio)) {
      return res.status(400).json({
        success: false,
        message:
          'Não é permitido reservar datas passadas.'
      });
    }

    // conflito empréstimo

    const conflitoEmprestimo =
      await existeConflitoEmprestimo(
        id_ferramenta,
        inicio,
        fim
      );

    if (conflitoEmprestimo) {
      return res.status(400).json({
        success: false,
        message:
          'Conflito: ferramenta emprestada neste período.'
      });
    }

    // conflito reserva

    const conflitoReserva =
      await existeConflitoReserva(
        id_ferramenta,
        inicio,
        fim,
        id
      );

    if (conflitoReserva) {
      return res.status(400).json({
        success: false,
        message:
          'Conflito: já existe reserva ativa neste horário.'
      });
    }

    // update

    await db.query(
      `
        UPDATE reservas
        SET
          data_reserva_inicio = ?,
          data_reserva_fim = ?
        WHERE id_reserva = ?
      `,
      [
        inicio,
        fim,
        id
      ]
    );

    return res.json({
      success: true,
      message: 'Reserva atualizada com sucesso.'
    });

  } catch (err) {
    console.error('Erro atualizarReserva:', err);

    return res.status(500).json({
      success: false,
      message: 'Erro ao atualizar reserva.'
    });
  }
};