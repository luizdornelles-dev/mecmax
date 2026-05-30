// frontend/src/pages/gerente/Relatorios.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/layoutMecanico.css";

function Relatorios() {
  const navigate = useNavigate();

  const estiloCard = {
    backgroundColor: "#ffc400",
    color: "#1f2228",
    textAlign: "center",
    cursor: "pointer",
    padding: "28px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.4)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    fontWeight: "bold",
    minHeight: "160px"
  };

  const estiloDescricao = {
    marginTop: "10px",
    fontSize: "0.9rem",
    fontWeight: "normal",
    color: "#1f2228",
    lineHeight: "1.4"
  };

  return (
    <div className="pagina-mecanico" style={{ padding: "20px" }}>
      <div className="container-mecanico" style={{ maxWidth: "1100px" }}>
        <div
          style={{
            backgroundColor: "#1f2228",
            padding: "15px 20px",
            borderBottom: "1px solid #333",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "25px"
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "1.3rem",
              color: "#ffc400"
            }}
          >
            Painel de Relatórios
          </h2>

          <button
            className="btn-primario-mecanico"
            style={{
              margin: 0,
              padding: "8px 15px"
            }}
            onClick={() => navigate("/gerente/painel")}
          >
            Voltar ao Painel
          </button>
        </div>

        <p
          style={{
            color: "#ccc",
            textAlign: "center",
            marginBottom: "30px",
            fontSize: "0.95rem"
          }}
        >
          Escolha um relatório para acompanhar o uso das ferramentas, atrasos,
          reservas e movimentações do MecMax.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "25px"
          }}
        >
          <div
            style={estiloCard}
            onClick={() => navigate("/gerente/relatorios/historico")}
          >
            <div style={{ fontSize: "3rem", marginBottom: "10px" }}>📋</div>
            <h3 style={{ margin: 0, fontSize: "1.25rem" }}>
              Histórico de Empréstimos
            </h3>
            <p style={estiloDescricao}>
              Consulta detalhada de empréstimos ativos, finalizados e atrasados.
            </p>
          </div>

          <div
            style={estiloCard}
            onClick={() => navigate("/gerente/relatorios/visao-geral")}
          >
            <div style={{ fontSize: "3rem", marginBottom: "10px" }}>📊</div>
            <h3 style={{ margin: 0, fontSize: "1.25rem" }}>
              Visão Geral
            </h3>
            <p style={estiloDescricao}>
              Resumo geral de ferramentas disponíveis, emprestadas, atrasadas,
              em manutenção e inativas.
            </p>
          </div>

          <div
            style={estiloCard}
            onClick={() => navigate("/gerente/relatorios/ferramentas-mais-usadas")}
          >
            <div style={{ fontSize: "3rem", marginBottom: "10px" }}>🔧</div>
            <h3 style={{ margin: 0, fontSize: "1.25rem" }}>
              Ferramentas Mais Usadas
            </h3>
            <p style={estiloDescricao}>
              Ranking das ferramentas mais movimentadas na oficina.
            </p>
          </div>

          <div
            style={estiloCard}
            onClick={() => navigate("/gerente/relatorios/atrasos-mecanico")}
          >
            <div style={{ fontSize: "3rem", marginBottom: "10px" }}>⏱️</div>
            <h3 style={{ margin: 0, fontSize: "1.25rem" }}>
              Atrasos por Mecânico
            </h3>
            <p style={estiloDescricao}>
              Identifica mecânicos com maior número de devoluções atrasadas.
            </p>
          </div>

          <div
            style={estiloCard}
            onClick={() => navigate("/gerente/relatorios/ferramentas-em-uso")}
          >
            <div style={{ fontSize: "3rem", marginBottom: "10px" }}>🛠️</div>
            <h3 style={{ margin: 0, fontSize: "1.25rem" }}>
              Ferramentas em Uso
            </h3>
            <p style={estiloDescricao}>
              Mostra ferramentas emprestadas ou atrasadas, com local e mecânico.
            </p>
          </div>

          <div
            style={estiloCard}
            onClick={() => navigate("/gerente/relatorios/reservas")}
          >
            <div style={{ fontSize: "3rem", marginBottom: "10px" }}>📅</div>
            <h3 style={{ margin: 0, fontSize: "1.25rem" }}>
              Reservas
            </h3>
            <p style={estiloDescricao}>
              Acompanha reservas ativas, cumpridas, expiradas e canceladas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Relatorios;