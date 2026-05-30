// frontend/src/pages/gerente/RelatorioAtrasosMecanico.jsx
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

function calcularPercentual(atrasos, total) {
  if (!total || total === 0) return "0%";

  const percentual = (atrasos / total) * 100;

  return `${percentual.toFixed(1).replace(".", ",")}%`;
}

function obterSituacao(totalAtrasos, percentualAtraso) {
  if (totalAtrasos === 0) {
    return {
      texto: "🟢 Regular",
      cor: "#4caf50"
    };
  }

  if (percentualAtraso >= 50) {
    return {
      texto: "🔴 Atenção Alta",
      cor: "#f44336"
    };
  }

  if (percentualAtraso >= 25) {
    return {
      texto: "⚠️ Atenção",
      cor: "#ff9800"
    };
  }

  return {
    texto: "🟡 Baixo atraso",
    cor: "#ffc400"
  };
}

function RelatorioAtrasosMecanico() {
  const navigate = useNavigate();

  const [relatorio, setRelatorio] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const resp = await api.get("/emprestimos/relatorio");
        const emprestimos = resp.data?.data || [];

        const agrupado = {};

        emprestimos.forEach((item) => {
          const nome = item.mecanico || "Sem mecânico informado";

          if (!agrupado[nome]) {
            agrupado[nome] = {
              mecanico: nome,
              total_emprestimos: 0,
              total_atrasos: 0,
              atrasos_atuais: 0,
              ultimo_emprestimo: item.data_retirada || null,
              ferramentas_atrasadas: []
            };
          }

          agrupado[nome].total_emprestimos += 1;

          if (item.status_emprestimo === "ATRASADO") {
            agrupado[nome].total_atrasos += 1;
            agrupado[nome].atrasos_atuais += 1;

            agrupado[nome].ferramentas_atrasadas.push({
              codigo_ferramenta: item.codigo_ferramenta,
              nome_ferramenta: item.nome_ferramenta,
              local_uso: item.local_uso
            });
          }

          const dataAtual = new Date(item.data_retirada);
          const dataUltimo = new Date(agrupado[nome].ultimo_emprestimo);

          if (
            item.data_retirada &&
            (!agrupado[nome].ultimo_emprestimo || dataAtual > dataUltimo)
          ) {
            agrupado[nome].ultimo_emprestimo = item.data_retirada;
          }
        });

        const dadosOrdenados = Object.values(agrupado)
          .map((item) => {
            const percentualNumero =
              item.total_emprestimos > 0
                ? (item.total_atrasos / item.total_emprestimos) * 100
                : 0;

            return {
              ...item,
              percentual_atraso_numero: percentualNumero,
              percentual_atraso_texto: calcularPercentual(
                item.total_atrasos,
                item.total_emprestimos
              )
            };
          })
          .sort((a, b) => {
            if (b.total_atrasos !== a.total_atrasos) {
              return b.total_atrasos - a.total_atrasos;
            }

            return b.percentual_atraso_numero - a.percentual_atraso_numero;
          });

        setRelatorio(dadosOrdenados);
      } catch (e) {
        console.error("Erro ao carregar relatório de atrasos por mecânico:", e);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  const totalMecanicos = relatorio.length;

  const totalEmprestimos = relatorio.reduce(
    (soma, item) => soma + item.total_emprestimos,
    0
  );

  const totalAtrasos = relatorio.reduce(
    (soma, item) => soma + item.total_atrasos,
    0
  );

  const mecanicosComAtraso = relatorio.filter(
    (item) => item.total_atrasos > 0
  ).length;

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
          Relatório: Atrasos por Mecânico
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
              Mecânicos no Histórico
            </h3>
            <div style={{ color: "#fff", fontSize: "2rem", fontWeight: "bold" }}>
              {totalMecanicos}
            </div>
            <p style={{ color: "#aaa", margin: 0, fontSize: "0.85rem" }}>
              Mecânicos com empréstimos registrados
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
              Soma dos empréstimos analisados
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
              Empréstimos marcados como atrasados
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
              Mecânicos com Atraso
            </h3>
            <div style={{ color: "#fff", fontSize: "2rem", fontWeight: "bold" }}>
              {mecanicosComAtraso}
            </div>
            <p style={{ color: "#aaa", margin: 0, fontSize: "0.85rem" }}>
              Mecânicos com pelo menos um atraso
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
                  <th>Mecânico</th>
                  <th>Total de Empréstimos</th>
                  <th>Total de Atrasos</th>
                  <th>% de Atraso</th>
                  <th>Último Empréstimo</th>
                  <th>Situação</th>
                  <th>Ferramentas Atrasadas</th>
                </tr>
              </thead>

              <tbody>
                {relatorio.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                      Nenhum empréstimo encontrado.
                    </td>
                  </tr>
                ) : (
                  relatorio.map((item, index) => {
                    const situacao = obterSituacao(
                      item.total_atrasos,
                      item.percentual_atraso_numero
                    );

                    return (
                      <tr key={item.mecanico}>
                        <td data-label="Posição">
                          <strong>{index + 1}º</strong>
                        </td>

                        <td data-label="Mecânico">
                          {item.mecanico}
                        </td>

                        <td data-label="Total de Empréstimos">
                          <strong>{item.total_emprestimos}</strong>
                        </td>

                        <td
                          data-label="Total de Atrasos"
                          style={{
                            color: item.total_atrasos > 0 ? "#ff5252" : "#4caf50",
                            fontWeight: "bold"
                          }}
                        >
                          {item.total_atrasos}
                        </td>

                        <td
                          data-label="% de Atraso"
                          style={{
                            color: item.total_atrasos > 0 ? "#ff9800" : "#4caf50",
                            fontWeight: "bold"
                          }}
                        >
                          {item.percentual_atraso_texto}
                        </td>

                        <td data-label="Último Empréstimo">
                          {formatarData(item.ultimo_emprestimo)}
                        </td>

                        <td
                          data-label="Situação"
                          style={{
                            color: situacao.cor,
                            fontWeight: "bold"
                          }}
                        >
                          {situacao.texto}
                        </td>

                        <td data-label="Ferramentas Atrasadas">
                          {item.ferramentas_atrasadas.length === 0 ? (
                            "-"
                          ) : (
                            <div style={{ fontSize: "0.85rem", color: "#ccc" }}>
                              {item.ferramentas_atrasadas.map((ferramenta, i) => (
                                <div key={`${ferramenta.codigo_ferramenta}-${i}`}>
                                  <strong>{ferramenta.codigo_ferramenta}</strong>{" "}
                                  {ferramenta.nome_ferramenta}
                                  {ferramenta.local_uso
                                    ? ` - ${ferramenta.local_uso}`
                                    : ""}
                                </div>
                              ))}
                            </div>
                          )}
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

export default RelatorioAtrasosMecanico;