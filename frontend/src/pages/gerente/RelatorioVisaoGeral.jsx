// frontend/src/pages/gerente/RelatorioVisaoGeral.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "../../styles/layoutMecanico.css";

function contarPorStatus(lista, campo, status) {
  return lista.filter((item) => item[campo] === status).length;
}

function RelatorioVisaoGeral() {
  const navigate = useNavigate();

  const [ferramentas, setFerramentas] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [emprestimos, setEmprestimos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        const [respFerramentas, respReservas, respEmprestimos] =
          await Promise.all([
            api.get("/ferramentas/completo"),
            api.get("/reservas"),
            api.get("/emprestimos/relatorio")
          ]);

        setFerramentas(respFerramentas.data?.data || []);
        setReservas(respReservas.data?.data || []);
        setEmprestimos(respEmprestimos.data?.data || []);
      } catch (e) {
        console.error("Erro ao carregar visão geral:", e);
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  const totalFerramentas = ferramentas.length;

  const ferramentasDisponiveis = ferramentas.filter(
    (f) => Number(f.id_status) === 1
  ).length;

  const ferramentasEmprestadas = ferramentas.filter(
    (f) => Number(f.id_status) === 2
  ).length;

  const ferramentasManutencao = ferramentas.filter(
    (f) => Number(f.id_status) === 3
  ).length;

  const ferramentasAtrasadas = ferramentas.filter(
    (f) => Number(f.id_status) === 4
  ).length;

  const ferramentasInativas = ferramentas.filter(
    (f) => Number(f.id_status) === 5
  ).length;

  const reservasAtivas = contarPorStatus(reservas, "status_reserva", "ATIVA");
  const reservasCumpridas = contarPorStatus(reservas, "status_reserva", "CUMPRIDA");
  const reservasExpiradas = contarPorStatus(reservas, "status_reserva", "EXPIRADA");
  const reservasCanceladas = contarPorStatus(reservas, "status_reserva", "CANCELADA");

  const emprestimosAtivos = contarPorStatus(emprestimos, "status_emprestimo", "ATIVO");
  const emprestimosAtrasados = contarPorStatus(emprestimos, "status_emprestimo", "ATRASADO");
  const emprestimosFinalizados = contarPorStatus(emprestimos, "status_emprestimo", "FINALIZADO");

  const cardsFerramentas = [
    {
      titulo: "Total de Ferramentas",
      valor: totalFerramentas,
      detalhe: "Itens cadastrados no acervo",
      icone: "🔧"
    },
    {
      titulo: "Disponíveis",
      valor: ferramentasDisponiveis,
      detalhe: "Prontas para empréstimo ou reserva",
      icone: "🟢"
    },
    {
      titulo: "Emprestadas",
      valor: ferramentasEmprestadas,
      detalhe: "Em uso no momento",
      icone: "🟠"
    },
    {
      titulo: "Atrasadas",
      valor: ferramentasAtrasadas,
      detalhe: "Com devolução vencida",
      icone: "⚠️"
    },
    {
      titulo: "Manutenção",
      valor: ferramentasManutencao,
      detalhe: "Indisponíveis por manutenção",
      icone: "🔴"
    },
    {
      titulo: "Inativas",
      valor: ferramentasInativas,
      detalhe: "Fora de operação",
      icone: "⚫"
    }
  ];

  const cardsReservas = [
    {
      titulo: "Reservas Ativas",
      valor: reservasAtivas,
      detalhe: "Reservas ainda válidas",
      icone: "🟢"
    },
    {
      titulo: "Reservas Cumpridas",
      valor: reservasCumpridas,
      detalhe: "Reservas que viraram empréstimo",
      icone: "🟠"
    },
    {
      titulo: "Reservas Expiradas",
      valor: reservasExpiradas,
      detalhe: "Reservas não retiradas no prazo",
      icone: "⚠️"
    },
    {
      titulo: "Reservas Canceladas",
      valor: reservasCanceladas,
      detalhe: "Reservas canceladas pelo usuário",
      icone: "📌"
    }
  ];

  const cardsEmprestimos = [
    {
      titulo: "Empréstimos Ativos",
      valor: emprestimosAtivos,
      detalhe: "Ferramentas em uso dentro do prazo",
      icone: "🟠"
    },
    {
      titulo: "Empréstimos Atrasados",
      valor: emprestimosAtrasados,
      detalhe: "Ferramentas com devolução vencida",
      icone: "⚠️"
    },
    {
      titulo: "Empréstimos Finalizados",
      valor: emprestimosFinalizados,
      detalhe: "Ferramentas já devolvidas",
      icone: "🟢"
    }
  ];

  function renderCards(lista) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "18px",
          marginBottom: "30px"
        }}
      >
        {lista.map((card) => (
          <div
            key={card.titulo}
            style={{
              backgroundColor: "#1f2228",
              border: "1px solid #333",
              borderRadius: "8px",
              padding: "20px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.35)"
            }}
          >
            <div
              style={{
                fontSize: "2rem",
                marginBottom: "10px"
              }}
            >
              {card.icone}
            </div>

            <h3
              style={{
                color: "#ffc400",
                margin: "0 0 8px 0",
                fontSize: "1rem"
              }}
            >
              {card.titulo}
            </h3>

            <div
              style={{
                color: "#fff",
                fontSize: "2rem",
                fontWeight: "bold",
                marginBottom: "8px"
              }}
            >
              {card.valor}
            </div>

            <p
              style={{
                color: "#aaa",
                margin: 0,
                fontSize: "0.85rem"
              }}
            >
              {card.detalhe}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="pagina-mecanico">
      <div
        style={{
          backgroundColor: "#1f2228",
          padding: "15px 20px",
          borderBottom: "1px solid #333",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px"
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "1.2rem",
            color: "#ffc400"
          }}
        >
          Relatório: Visão Geral
        </h2>

        <button
          className="btn-primario-mecanico"
          style={{
            margin: 0,
            padding: "8px 15px"
          }}
          onClick={() => navigate("/gerente/relatorios")}
        >
          Voltar aos Relatórios
        </button>
      </div>

      <div className="container-mecanico">
        {carregando ? (
          <p style={{ color: "#fff" }}>Carregando visão geral...</p>
        ) : (
          <>
            <h3 style={{ color: "#ffc400", marginBottom: "15px" }}>
              Ferramentas
            </h3>
            {renderCards(cardsFerramentas)}

            <h3 style={{ color: "#ffc400", marginBottom: "15px" }}>
              Reservas
            </h3>
            {renderCards(cardsReservas)}

            <h3 style={{ color: "#ffc400", marginBottom: "15px" }}>
              Empréstimos
            </h3>
            {renderCards(cardsEmprestimos)}
          </>
        )}
      </div>
    </div>
  );
}

export default RelatorioVisaoGeral;