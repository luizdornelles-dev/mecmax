// frontend/src/pages/ListaReservas.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/layoutMecanico.css";
import { alertaErro, alertaSucesso, confirmarAcao } from "../utils/alertas";

function formatarDataHoraBr(isoString) {
  if (!isoString) return "-";
  const data = new Date(isoString);
  if (Number.isNaN(data.getTime())) return "-";

  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function ordenarReservasPorFerramenta(lista) {
  return [...lista].sort((a, b) => {
    const nomeA = (a.nome_ferramenta || "").toLowerCase();
    const nomeB = (b.nome_ferramenta || "").toLowerCase();
    return nomeA.localeCompare(nomeB, "pt-BR");
  });
}

function ListaReservas() {
  const [reservas, setReservas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();
  const mecanico = JSON.parse(sessionStorage.getItem("mecanicoLogado") || "null");

  useEffect(() => {
    async function carregar() {
      try {
        setCarregando(true);
        const response = await api.get("/reservas");
        const dados = response.data?.data || [];
        setReservas(ordenarReservasPorFerramenta(dados));
      } catch (e) {
        console.error(e);
        alertaErro("Erro ao carregar a lista de reservas.");
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  async function handleCancelar(id) {
    const confirmado = await confirmarAcao(
      "Tem certeza que deseja cancelar esta reserva?",
      "Sim, Cancelar"
    );

    if (!confirmado) return;

    try {
      await api.delete(`/reservas/${id}`);
      alertaSucesso("Reserva cancelada com sucesso!");

      setReservas((reservasAtuais) =>
        reservasAtuais.map((reserva) =>
          reserva.id_reserva === id
            ? { ...reserva, status_reserva: "CANCELADA" }
            : reserva
        )
      );
    } catch (e) {
      alertaErro(e.response?.data?.message || "Erro ao cancelar a reserva.");
    }
  }

  return (
    <div className="pagina-mecanico">
      <div className="container-mecanico">
        <h2 className="titulo">Lista de Reservas</h2>

        <div className="tabela-container">
          {carregando ? (
            <p style={{ color: "#fff" }}>Carregando reservas...</p>
          ) : (
            <table className="tabela">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Ferramenta</th>
                  <th>Início</th>
                  <th>Fim</th>
                  <th>Mecânico</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {reservas.map((r) => {
                  const isMinha =
                    String(r.id_mecanico) === String(mecanico?.id_mecanico);

                  return (
                    <tr key={r.id_reserva}>
                      <td data-label="Código">{r.codigo_ferramenta || "-"}</td>
                      <td data-label="Ferramenta">{r.nome_ferramenta || "-"}</td>
                      <td data-label="Início">
                        {formatarDataHoraBr(r.data_reserva_inicio)}
                      </td>
                      <td data-label="Fim">
                        {formatarDataHoraBr(r.data_reserva_fim)}
                      </td>
                      <td data-label="Mecânico">{r.nome_mecanico || "-"}</td>

                      <td
                        data-label="Status"
                        style={{
                          fontWeight: "bold",
                          color:
                            r.status_reserva === "ATIVA"
                              ? "#4caf50"
                              : "#ffc107"
                        }}
                      >
                        <div className="status-container">
                          {r.status_reserva === "ATIVA"
                            ? "🟢 ATIVA"
                            : `🟠 ${r.status_reserva}`}
                        </div>
                      </td>

                      <td data-label="Ações" className="celula-acoes">
                        <div className="acoes">
                          {isMinha && r.status_reserva === "ATIVA" && (
                            <>
                              <button
                                className="btn editar"
                                onClick={() =>
                                  navigate(`/reservas/editar/${r.id_reserva}`)
                                }
                              >
                                Editar
                              </button>

                              <button
                                className="btn devolver"
                                style={{
                                  backgroundColor: "#ff5252",
                                  color: "#fff"
                                }}
                                onClick={() => handleCancelar(r.id_reserva)}
                              >
                                Cancelar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {reservas.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                      Nenhuma reserva encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default ListaReservas;