// frontend/src/pages/gerente/RelatorioHistorico.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "../../styles/layoutMecanico.css";

function formatarData(dataISO) {
  if (!dataISO) return "-";
  const d = new Date(dataISO);
  return d.toLocaleString("pt-BR");
}

function RelatorioHistorico() {
  const navigate = useNavigate();

  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState("TODOS");

  useEffect(() => {
    async function carregar() {
      try {
        const resp = await api.get("/emprestimos/relatorio");
        setHistorico(resp.data?.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  const dadosFiltrados = historico.filter((item) => {
    if (filtroStatus === "TODOS") return true;
    return item.status_emprestimo === filtroStatus;
  });

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
          Histórico de Empréstimos
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
          className="card-form-mecanico"
          style={{
            maxWidth: "100%",
            marginBottom: "20px",
            padding: "15px"
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "20px",
              alignItems: "flex-end",
              flexWrap: "wrap"
            }}
          >
            <div
              className="grupo-campo-mecanico"
              style={{
                marginBottom: 0,
                minWidth: "200px"
              }}
            >
              <label>Filtrar por Status</label>
              <select
                className="input-mecanico"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <option value="TODOS">Todos os Registros</option>
                <option value="ATIVO">Empréstimos Ativos</option>
                <option value="FINALIZADO">Devolvidos / Finalizados</option>
                <option value="ATRASADO">Atrasados</option>
              </select>
            </div>

            <div
              style={{
                color: "#aaa",
                fontSize: "0.9rem",
                paddingBottom: "10px"
              }}
            >
              Exibindo {dadosFiltrados.length} registro(s).
            </div>
          </div>
        </div>

        <div className="tabela-container">
          {carregando ? (
            <p style={{ color: "#fff" }}>Carregando histórico...</p>
          ) : (
            <table className="tabela">
              <thead>
                <tr>
                  <th>Data Retirada</th>
                  <th>Ferramenta</th>
                  <th>Mecânico</th>
                  <th>Local</th>
                  <th>Devolução</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {dadosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                ) : (
                  dadosFiltrados.map((h) => (
                    <tr key={h.id_emprestimo}>
                      <td data-label="Data Retirada">
                        {formatarData(h.data_retirada)}
                      </td>

                      <td data-label="Ferramenta">
                        <strong>{h.codigo_ferramenta}</strong>
                        <br />
                        <span
                          style={{
                            fontSize: "0.85em",
                            color: "#ccc"
                          }}
                        >
                          {h.nome_ferramenta}
                        </span>
                      </td>

                      <td data-label="Mecânico">{h.mecanico}</td>
                      <td data-label="Local">{h.local_uso}</td>

                      <td data-label="Devolução">
                        {h.data_devolucao ? formatarData(h.data_devolucao) : "-"}
                      </td>

                      <td data-label="Status">
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontWeight: "bold",
                            fontSize: "0.8rem",
                            backgroundColor:
                              h.status_emprestimo === "ATIVO"
                                ? "#ff9800"
                                : h.status_emprestimo === "FINALIZADO"
                                ? "#4caf50"
                                : "#f44336",
                            color: "#000"
                          }}
                        >
                          {h.status_emprestimo === "ATIVO" && "🟠 "}
                          {h.status_emprestimo === "FINALIZADO" && "🟢 "}
                          {h.status_emprestimo === "ATRASADO" && "⚠️ "}
                          {h.status_emprestimo}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default RelatorioHistorico;