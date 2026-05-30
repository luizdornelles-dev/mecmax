// frontend/src/pages/gerente/RelatorioFerramentasEmUso.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "../../styles/layoutMecanico.css";

function formatarData(dataISO) {
  if (!dataISO) return "-";

  const data = new Date(dataISO);

  if (Number.isNaN(data.getTime())) return "-";

  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function obterStatusVisual(idStatus, status) {
  if (Number(idStatus) === 4 || String(status).toUpperCase().includes("ATRAS")) {
    return {
      texto: "⚠️ ATRASADA",
      cor: "#ff5252"
    };
  }

  if (Number(idStatus) === 2 || String(status).toUpperCase().includes("EMPREST")) {
    return {
      texto: "🟠 EMPRESTADA",
      cor: "#ff9800"
    };
  }

  return {
    texto: status || "-",
    cor: "#ccc"
  };
}

function RelatorioFerramentasEmUso() {
  const navigate = useNavigate();

  const [ferramentasEmUso, setFerramentasEmUso] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState("TODAS");

  useEffect(() => {
    async function carregar() {
      try {
        const resp = await api.get("/ferramentas/completo");
        const ferramentas = resp.data?.data || [];

        const emUso = ferramentas
          .filter((f) => Number(f.id_status) === 2 || Number(f.id_status) === 4)
          .sort((a, b) => {
            if (Number(a.id_status) !== Number(b.id_status)) {
              return Number(b.id_status) - Number(a.id_status);
            }

            return String(a.nome_ferramenta || "").localeCompare(
              String(b.nome_ferramenta || ""),
              "pt-BR"
            );
          });

        setFerramentasEmUso(emUso);
      } catch (e) {
        console.error("Erro ao carregar ferramentas em uso:", e);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  const dadosFiltrados = ferramentasEmUso.filter((f) => {
    if (filtroStatus === "TODAS") return true;
    if (filtroStatus === "EMPRESTADA") return Number(f.id_status) === 2;
    if (filtroStatus === "ATRASADA") return Number(f.id_status) === 4;
    return true;
  });

  const totalEmUso = ferramentasEmUso.length;
  const totalEmprestadas = ferramentasEmUso.filter((f) => Number(f.id_status) === 2).length;
  const totalAtrasadas = ferramentasEmUso.filter((f) => Number(f.id_status) === 4).length;

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
          Relatório: Ferramentas em Uso
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "18px",
            marginBottom: "25px"
          }}
        >
          <div
            style={{
              backgroundColor: "#1f2228",
              border: "1px solid #333",
              borderRadius: "8px",
              padding: "18px"
            }}
          >
            <h3 style={{ color: "#ffc400", margin: "0 0 8px 0" }}>
              Total em Uso
            </h3>
            <div style={{ color: "#fff", fontSize: "2rem", fontWeight: "bold" }}>
              {totalEmUso}
            </div>
            <p style={{ color: "#aaa", margin: 0, fontSize: "0.85rem" }}>
              Ferramentas emprestadas ou atrasadas
            </p>
          </div>

          <div
            style={{
              backgroundColor: "#1f2228",
              border: "1px solid #333",
              borderRadius: "8px",
              padding: "18px"
            }}
          >
            <h3 style={{ color: "#ffc400", margin: "0 0 8px 0" }}>
              Emprestadas
            </h3>
            <div style={{ color: "#fff", fontSize: "2rem", fontWeight: "bold" }}>
              {totalEmprestadas}
            </div>
            <p style={{ color: "#aaa", margin: 0, fontSize: "0.85rem" }}>
              Em uso dentro do prazo
            </p>
          </div>

          <div
            style={{
              backgroundColor: "#1f2228",
              border: "1px solid #333",
              borderRadius: "8px",
              padding: "18px"
            }}
          >
            <h3 style={{ color: "#ffc400", margin: "0 0 8px 0" }}>
              Atrasadas
            </h3>
            <div style={{ color: "#fff", fontSize: "2rem", fontWeight: "bold" }}>
              {totalAtrasadas}
            </div>
            <p style={{ color: "#aaa", margin: 0, fontSize: "0.85rem" }}>
              Com devolução vencida
            </p>
          </div>
        </div>

        <div
          className="card-form-mecanico"
          style={{
            maxWidth: "100%",
            marginBottom: "20px",
            padding: "15px"
          }}
        >
          <div
            className="grupo-campo-mecanico"
            style={{
              marginBottom: 0,
              maxWidth: "260px"
            }}
          >
            <label>Filtrar por Status</label>
            <select
              className="input-mecanico"
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
            >
              <option value="TODAS">Todas em uso</option>
              <option value="EMPRESTADA">Somente emprestadas</option>
              <option value="ATRASADA">Somente atrasadas</option>
            </select>
          </div>
        </div>

        <div className="tabela-container">
          {carregando ? (
            <p style={{ color: "#fff" }}>Carregando ferramentas em uso...</p>
          ) : (
            <table className="tabela">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Ferramenta</th>
                  <th>Status</th>
                  <th>Mecânico</th>
                  <th>Local de Uso</th>
                  <th>Previsão de Devolução</th>
                </tr>
              </thead>

              <tbody>
                {dadosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                      Nenhuma ferramenta em uso encontrada.
                    </td>
                  </tr>
                ) : (
                  dadosFiltrados.map((f) => {
                    const statusVisual = obterStatusVisual(f.id_status, f.status);

                    return (
                      <tr key={f.id_ferramenta}>
                        <td data-label="Código">
                          {f.codigo_ferramenta || "-"}
                        </td>

                        <td data-label="Ferramenta">
                          {f.nome_ferramenta || "-"}
                        </td>

                        <td
                          data-label="Status"
                          style={{
                            color: statusVisual.cor,
                            fontWeight: "bold"
                          }}
                        >
                          {statusVisual.texto}
                        </td>

                        <td data-label="Mecânico">
                          {f.mecanico || "-"}
                        </td>

                        <td data-label="Local de Uso">
                          {f.local_uso || "-"}
                        </td>

                        <td data-label="Previsão de Devolução">
                          {formatarData(f.previsao)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default RelatorioFerramentasEmUso;