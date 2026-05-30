// frontend/src/pages/gerente/RelatorioFerramentasMaisUsadas.jsx
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

function obterStatusVisual(status) {
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

  if (texto.includes("ATRAS")) {
    return {
      texto: "⚠️ ATRASADA",
      cor: "#ff5252"
    };
  }

  if (texto.includes("MANUT")) {
    return {
      texto: "🔴 MANUTENÇÃO",
      cor: "#f44336"
    };
  }

  if (texto.includes("INAT")) {
    return {
      texto: "⚫ INATIVA",
      cor: "#9e9e9e"
    };
  }

  return {
    texto: status || "-",
    cor: "#ccc"
  };
}

function RelatorioFerramentasMaisUsadas() {
  const navigate = useNavigate();

  const [relatorio, setRelatorio] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const [respEmprestimos, respFerramentas] = await Promise.all([
          api.get("/emprestimos/relatorio"),
          api.get("/ferramentas/completo")
        ]);

        const emprestimos = respEmprestimos.data?.data || [];
        const ferramentas = respFerramentas.data?.data || [];

        const mapaStatusFerramentas = {};

        ferramentas.forEach((f) => {
          mapaStatusFerramentas[f.codigo_ferramenta] = {
            status: f.status,
            id_status: f.id_status
          };
        });

        const agrupado = {};

        emprestimos.forEach((item) => {
          const codigo = item.codigo_ferramenta || "SEM CÓDIGO";

          if (!agrupado[codigo]) {
            agrupado[codigo] = {
              codigo_ferramenta: codigo,
              nome_ferramenta: item.nome_ferramenta || "-",
              total_emprestimos: 0,
              total_atrasos: 0,
              ultimo_uso: item.data_retirada || null,
              status_atual: mapaStatusFerramentas[codigo]?.status || "-"
            };
          }

          agrupado[codigo].total_emprestimos += 1;

          if (item.status_emprestimo === "ATRASADO") {
            agrupado[codigo].total_atrasos += 1;
          }

          const dataAtual = new Date(item.data_retirada);
          const dataUltimoUso = new Date(agrupado[codigo].ultimo_uso);

          if (
            item.data_retirada &&
            (!agrupado[codigo].ultimo_uso || dataAtual > dataUltimoUso)
          ) {
            agrupado[codigo].ultimo_uso = item.data_retirada;
          }
        });

        const dadosOrdenados = Object.values(agrupado).sort((a, b) => {
          if (b.total_emprestimos !== a.total_emprestimos) {
            return b.total_emprestimos - a.total_emprestimos;
          }

          return b.total_atrasos - a.total_atrasos;
        });

        setRelatorio(dadosOrdenados);
      } catch (e) {
        console.error("Erro ao carregar relatório de ferramentas mais usadas:", e);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  const totalFerramentasUsadas = relatorio.length;

  const totalEmprestimos = relatorio.reduce(
    (soma, item) => soma + item.total_emprestimos,
    0
  );

  const totalAtrasos = relatorio.reduce(
    (soma, item) => soma + item.total_atrasos,
    0
  );

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
          Relatório: Ferramentas Mais Usadas
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
              Ferramentas Usadas
            </h3>
            <div style={{ color: "#fff", fontSize: "2rem", fontWeight: "bold" }}>
              {totalFerramentasUsadas}
            </div>
            <p style={{ color: "#aaa", margin: 0, fontSize: "0.85rem" }}>
              Ferramentas que possuem histórico de empréstimo
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
              Total de Empréstimos
            </h3>
            <div style={{ color: "#fff", fontSize: "2rem", fontWeight: "bold" }}>
              {totalEmprestimos}
            </div>
            <p style={{ color: "#aaa", margin: 0, fontSize: "0.85rem" }}>
              Soma de todos os empréstimos registrados
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
              Total de Atrasos
            </h3>
            <div style={{ color: "#fff", fontSize: "2rem", fontWeight: "bold" }}>
              {totalAtrasos}
            </div>
            <p style={{ color: "#aaa", margin: 0, fontSize: "0.85rem" }}>
              Empréstimos que estão ou ficaram atrasados
            </p>
          </div>
        </div>

        <div className="tabela-container">
          {carregando ? (
            <p style={{ color: "#fff" }}>Carregando relatório...</p>
          ) : (
            <table className="tabela">
              <thead>
                <tr>
                  <th>Posição</th>
                  <th>Código</th>
                  <th>Ferramenta</th>
                  <th>Total de Empréstimos</th>
                  <th>Atrasos</th>
                  <th>Último Uso</th>
                  <th>Status Atual</th>
                </tr>
              </thead>

              <tbody>
                {relatorio.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                      Nenhum empréstimo encontrado.
                    </td>
                  </tr>
                ) : (
                  relatorio.map((item, index) => {
                    const statusVisual = obterStatusVisual(item.status_atual);

                    return (
                      <tr key={item.codigo_ferramenta}>
                        <td data-label="Posição">
                          <strong>{index + 1}º</strong>
                        </td>

                        <td data-label="Código">
                          {item.codigo_ferramenta}
                        </td>

                        <td data-label="Ferramenta">
                          {item.nome_ferramenta}
                        </td>

                        <td data-label="Total de Empréstimos">
                          <strong>{item.total_emprestimos}</strong>
                        </td>

                        <td
                          data-label="Atrasos"
                          style={{
                            color: item.total_atrasos > 0 ? "#ff5252" : "#4caf50",
                            fontWeight: "bold"
                          }}
                        >
                          {item.total_atrasos}
                        </td>

                        <td data-label="Último Uso">
                          {formatarData(item.ultimo_uso)}
                        </td>

                        <td
                          data-label="Status Atual"
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

export default RelatorioFerramentasMaisUsadas;