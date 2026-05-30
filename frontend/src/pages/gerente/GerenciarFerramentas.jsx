// frontend/src/pages/gerente/GerenciarFerramentas.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "../../styles/layoutMecanico.css";
import {
  alertaErro,
  alertaSucesso,
  confirmarAcao
} from "../../utils/alertas";

function obterStatusVisual(status, idStatus) {
  const texto = (status || "").toUpperCase();

  if (texto.includes("DISP")) {
    return {
      texto: "🟢 DISPONÍVEL",
      cor: "#4caf50"
    };
  }

  if (texto.includes("EMPREST")) {
    return {
      texto: "🟠 EMPRESTADA",
      cor: "#ff9800"
    };
  }

  if (texto.includes("MANUT")) {
    return {
      texto: "🔴 MANUTENÇÃO",
      cor: "#f44336"
    };
  }

  if (texto.includes("ATRAS")) {
    return {
      texto: "⚠️ ATRASADA",
      cor: "#ff5252"
    };
  }

  if (texto.includes("INAT")) {
    return {
      texto: "⚫ INATIVA",
      cor: "#9e9e9e"
    };
  }

  // fallback por ID
  switch (Number(idStatus)) {
    case 1:
      return { texto: "🟢 DISPONÍVEL", cor: "#4caf50" };

    case 2:
      return { texto: "🟠 EMPRESTADA", cor: "#ff9800" };

    case 3:
      return { texto: "🔴 MANUTENÇÃO", cor: "#f44336" };

    case 4:
      return { texto: "⚠️ ATRASADA", cor: "#ff5252" };

    case 5:
      return { texto: "⚫ INATIVA", cor: "#9e9e9e" };

    default:
      return { texto: "-", cor: "#ccc" };
  }
}

function GerenciarFerramentas() {
  const navigate = useNavigate();

  const [ferramentas, setFerramentas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const resp = await api.get("/ferramentas/completo");
        setFerramentas(resp.data?.data || []);
      } catch (e) {
        console.error(e);
        alertaErro("Erro ao carregar ferramentas.");
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  async function handleManutencao(id, nome) {
    const confirmado = await confirmarAcao(
      `Deseja enviar a ferramenta "${nome}" para manutenção?`,
      "Sim, Enviar"
    );

    if (!confirmado) return;

    try {
      await api.put(`/ferramentas/${id}/manutencao`);

      alertaSucesso("Ferramenta enviada para manutenção.");

      setTimeout(() => window.location.reload(), 1200);
    } catch (e) {
      const msg =
        e.response?.data?.message ||
        "Erro ao atualizar status.";

      alertaErro(msg);
    }
  }

  async function handleExcluir(id, nome) {
    const confirmado = await confirmarAcao(
      `ATENÇÃO: Tem certeza que deseja EXCLUIR PERMANENTEMENTE "${nome}"?`,
      "Sim, Excluir"
    );

    if (!confirmado) return;

    try {
      await api.delete(`/ferramentas/${id}`);

      alertaSucesso("Ferramenta excluída permanentemente.");

      setTimeout(() => window.location.reload(), 1200);
    } catch (e) {
      const msg =
        e.response?.data?.message ||
        "Esta ferramenta possui histórico de uso e não pode ser apagada. Altere o status para Inativa.";

      alertaErro(msg);
    }
  }

  return (
    <div className="pagina-mecanico">
      {/* Cabeçalho */}
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
          Gerenciar Acervo de Ferramentas
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

      <div className="container-mecanico">
        {/* botão nova ferramenta */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "15px"
          }}
        >
          <button
            className="btn-primario-mecanico"
            onClick={() => navigate("/gerente/nova-ferramenta")}
          >
            + Nova Ferramenta
          </button>
        </div>

        <div className="tabela-container">
          {carregando ? (
            <p style={{ color: "#fff" }}>Carregando...</p>
          ) : (
            <table className="tabela">
              <thead>
                <tr>
                  <th>Cód</th>
                  <th>Ferramenta</th>
                  <th>Status</th>
                  <th>Local</th>
                  <th>Mecânico</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {ferramentas.map((f) => {
                  const statusVisual = obterStatusVisual(
                    f.status,
                    f.id_status
                  );

                  const statusTexto = statusVisual.texto;

                  const estaEmUso =
                    statusTexto.includes("EMPRESTADA") ||
                    statusTexto.includes("ATRASADA");

                  return (
                    <tr key={f.id_ferramenta}>
                      <td data-label="Cód">
                        {f.codigo_ferramenta}
                      </td>

                      <td data-label="Ferramenta">
                        {f.nome_ferramenta}
                      </td>

                      <td
                        data-label="Status"
                        style={{
                          fontWeight: "bold",
                          color: statusVisual.cor
                        }}
                      >
                        {statusTexto}
                      </td>

                      <td
                        data-label="Local"
                        style={{
                          color: "#ccc",
                          fontSize: "0.9rem"
                        }}
                      >
                        {estaEmUso
                          ? f.local_uso || "-"
                          : statusTexto.includes("MANUTENÇÃO")
                          ? "Manutenção"
                          : "-"}
                      </td>

                      <td
                        data-label="Mecânico"
                        style={{
                          color: "#ccc",
                          fontSize: "0.9rem"
                        }}
                      >
                        {estaEmUso
                          ? f.mecanico || "-"
                          : "-"}
                      </td>

                      <td
                        data-label="Ações"
                        className="acoes"
                      >
                        <button
                          className="btn editar"
                          onClick={() =>
                            navigate(
                              `/gerente/editar-ferramenta/${f.id_ferramenta}`
                            )
                          }
                        >
                          Editar
                        </button>

                        {statusTexto.includes("DISPONÍVEL") && (
                          <button
                            className="btn"
                            style={{
                              backgroundColor: "#ff9800",
                              color: "#000",
                              fontWeight: "bold"
                            }}
                            onClick={() =>
                              handleManutencao(
                                f.id_ferramenta,
                                f.nome_ferramenta
                              )
                            }
                          >
                            Manut.
                          </button>
                        )}

                        {estaEmUso ? (
                          <button
                            className="btn"
                            style={{
                              backgroundColor: "#555",
                              color: "#aaa",
                              cursor: "not-allowed"
                            }}
                            disabled
                            title="Ferramenta em uso ou atrasada"
                          >
                            Excluir
                          </button>
                        ) : (
                          <button
                            className="btn devolver"
                            style={{
                              backgroundColor: "#d32f2f",
                              color: "#fff"
                            }}
                            onClick={() =>
                              handleExcluir(
                                f.id_ferramenta,
                                f.nome_ferramenta
                              )
                            }
                          >
                            Excluir
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default GerenciarFerramentas;