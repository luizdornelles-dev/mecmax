// frontend/src/pages/gerente/RelatorioReservas.jsx
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

function obterStatusReserva(status) {
  switch (status) {
    case "ATIVA":
      return {
        texto: "🟢 ATIVA",
        cor: "#4caf50"
      };

    case "CUMPRIDA":
      return {
        texto: "🟠 CUMPRIDA",
        cor: "#ff9800"
      };

    case "EXPIRADA":
      return {
        texto: "⚠️ EXPIRADA",
        cor: "#ff5252"
      };

    case "CANCELADA":
      return {
        texto: "📌 CANCELADA",
        cor: "#9e9e9e"
      };

    default:
      return {
        texto: status || "-",
        cor: "#ccc"
      };
  }
}

function contarPorStatus(lista, status) {
  return lista.filter((item) => item.status_reserva === status).length;
}

function RelatorioReservas() {
  const navigate = useNavigate();

  const [reservas, setReservas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState("TODAS");

  useEffect(() => {
    async function carregar() {
      try {
        const resp = await api.get("/reservas");
        const dados = resp.data?.data || [];

        const ordenadas = [...dados].sort((a, b) => {
          const dataA = new Date(a.data_reserva_inicio);
          const dataB = new Date(b.data_reserva_inicio);

          return dataB - dataA;
        });

        setReservas(ordenadas);
      } catch (e) {
        console.error("Erro ao carregar relatório de reservas:", e);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  const reservasFiltradas = reservas.filter((r) => {
    if (filtroStatus === "TODAS") return true;
    return r.status_reserva === filtroStatus;
  });

  const totalReservas = reservas.length;
  const totalAtivas = contarPorStatus(reservas, "ATIVA");
  const totalCumpridas = contarPorStatus(reservas, "CUMPRIDA");
  const totalExpiradas = contarPorStatus(reservas, "EXPIRADA");
  const totalCanceladas = contarPorStatus(reservas, "CANCELADA");

  const ferramentasMaisReservadas = {};
  const mecanicosMaisReservam = {};

  reservas.forEach((r) => {
    const ferramenta = `${r.codigo_ferramenta || "-"} - ${r.nome_ferramenta || "-"}`;
    const mecanico = r.nome_mecanico || "Sem mecânico informado";

    ferramentasMaisReservadas[ferramenta] =
      (ferramentasMaisReservadas[ferramenta] || 0) + 1;

    mecanicosMaisReservam[mecanico] =
      (mecanicosMaisReservam[mecanico] || 0) + 1;
  });

  const topFerramentas = Object.entries(ferramentasMaisReservadas)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topMecanicos = Object.entries(mecanicosMaisReservam)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

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
          Relatório: Reservas
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
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
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
              Total de Reservas
            </h3>
            <div style={{ color: "#fff", fontSize: "2rem", fontWeight: "bold" }}>
              {totalReservas}
            </div>
            <p style={{ color: "#aaa", margin: 0, fontSize: "0.85rem" }}>
              Reservas registradas no sistema
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
              Ativas
            </h3>
            <div style={{ color: "#fff", fontSize: "2rem", fontWeight: "bold" }}>
              {totalAtivas}
            </div>
            <p style={{ color: "#aaa", margin: 0, fontSize: "0.85rem" }}>
              Reservas ainda válidas
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
              Cumpridas
            </h3>
            <div style={{ color: "#fff", fontSize: "2rem", fontWeight: "bold" }}>
              {totalCumpridas}
            </div>
            <p style={{ color: "#aaa", margin: 0, fontSize: "0.85rem" }}>
              Reservas que viraram empréstimo
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
              Expiradas
            </h3>
            <div style={{ color: "#fff", fontSize: "2rem", fontWeight: "bold" }}>
              {totalExpiradas}
            </div>
            <p style={{ color: "#aaa", margin: 0, fontSize: "0.85rem" }}>
              Reservas não retiradas no prazo
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
              Canceladas
            </h3>
            <div style={{ color: "#fff", fontSize: "2rem", fontWeight: "bold" }}>
              {totalCanceladas}
            </div>
            <p style={{ color: "#aaa", margin: 0, fontSize: "0.85rem" }}>
              Canceladas pelo usuário
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
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
            <h3 style={{ color: "#ffc400", marginTop: 0 }}>
              Ferramentas Mais Reservadas
            </h3>

            {topFerramentas.length === 0 ? (
              <p style={{ color: "#aaa" }}>Sem dados de reserva.</p>
            ) : (
              topFerramentas.map(([nome, total], index) => (
                <div
                  key={nome}
                  style={{
                    color: "#ddd",
                    marginBottom: "8px",
                    fontSize: "0.9rem"
                  }}
                >
                  <strong>{index + 1}º</strong> {nome} — {total} reserva(s)
                </div>
              ))
            )}
          </div>

          <div
            style={{
              backgroundColor: "#1f2228",
              border: "1px solid #333",
              borderRadius: "8px",
              padding: "18px"
            }}
          >
            <h3 style={{ color: "#ffc400", marginTop: 0 }}>
              Mecânicos que Mais Reservam
            </h3>

            {topMecanicos.length === 0 ? (
              <p style={{ color: "#aaa" }}>Sem dados de reserva.</p>
            ) : (
              topMecanicos.map(([nome, total], index) => (
                <div
                  key={nome}
                  style={{
                    color: "#ddd",
                    marginBottom: "8px",
                    fontSize: "0.9rem"
                  }}
                >
                  <strong>{index + 1}º</strong> {nome} — {total} reserva(s)
                </div>
              ))
            )}
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
              <option value="TODAS">Todas as reservas</option>
              <option value="ATIVA">Ativas</option>
              <option value="CUMPRIDA">Cumpridas</option>
              <option value="EXPIRADA">Expiradas</option>
              <option value="CANCELADA">Canceladas</option>
            </select>
          </div>
        </div>

        <div className="tabela-container">
          {carregando ? (
            <p style={{ color: "#fff" }}>Carregando reservas...</p>
          ) : (
            <table className="tabela">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Ferramenta</th>
                  <th>Mecânico</th>
                  <th>Início</th>
                  <th>Fim</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {reservasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                      Nenhuma reserva encontrada.
                    </td>
                  </tr>
                ) : (
                  reservasFiltradas.map((r) => {
                    const statusVisual = obterStatusReserva(r.status_reserva);

                    return (
                      <tr key={r.id_reserva}>
                        <td data-label="Código">
                          {r.codigo_ferramenta || "-"}
                        </td>

                        <td data-label="Ferramenta">
                          {r.nome_ferramenta || "-"}
                        </td>

                        <td data-label="Mecânico">
                          {r.nome_mecanico || "-"}
                        </td>

                        <td data-label="Início">
                          {formatarData(r.data_reserva_inicio)}
                        </td>

                        <td data-label="Fim">
                          {formatarData(r.data_reserva_fim)}
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

export default RelatorioReservas;