// frontend/src/pages/ConsultaFerramentas.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/layoutMecanico.css";
import { alertaSucesso, alertaErro, confirmarAcao } from "../utils/alertas";

function formatarDataHora(valor) {
  if (!valor) return "-";
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString('pt-BR', { 
    day: '2-digit', month: '2-digit', year: 'numeric', 
    hour: '2-digit', minute: '2-digit' 
  });
}

function ConsultaFerramentas() {
  const [ferramentas, setFerramentas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();
  
  const mecanicoLogado = JSON.parse(sessionStorage.getItem("mecanicoLogado") || "null");

  useEffect(() => {
    async function carregar() {
      try {
        setCarregando(true);
        const resp = await api.get("/ferramentas/completo");
        setFerramentas(resp.data?.data || []);
      } catch (e) {
        console.error("Erro", e);
        alertaErro("Erro ao carregar o acervo de ferramentas.");
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  async function handleDevolver(idEmprestimo) {
    const confirmado = await confirmarAcao("Deseja confirmar a devolução desta ferramenta?", "Sim, Devolver");
    if (!confirmado) return;

    try {
      const resp = await api.put(`/emprestimos/${idEmprestimo}/devolver`);
      if (resp.data.success) {
        alertaSucesso("Devolução registrada com sucesso!");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        alertaErro(resp.data.message);
      }
    } catch (e) {
      alertaErro("Erro ao processar devolução.");
    }
  }

  return (
    <div className="pagina-mecanico">
      <div className="container-mecanico">
        <h2 className="titulo">Consulta e Movimentação de Ferramentas</h2>
        
        <div className="tabela-container">
          {carregando ? (
            <p style={{ color: "#fff" }}>Carregando ferramentas...</p>
          ) : (
            <table className="tabela">
              <thead>
                <tr>
                  <th>Cód</th>
                  <th>Ferramenta</th>
                  <th>Marca</th>
                  <th>Categoria</th>
                  <th>Status</th>
                  <th>Local de Uso</th>
                  <th>Responsável</th>
                  <th>Prev. Devolução</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {ferramentas.map((f) => {
                  const status = f.status;
                  const idMecanicoEmprestou = f.id_mecanico_emprestimo || f.id_mecanico;
                  const isDono = mecanicoLogado && String(idMecanicoEmprestou) === String(mecanicoLogado.id_mecanico);
                  const isEmprestada = status === "EMPRESTADA" || status === "ATRASADO";

                  return (
                    <tr key={f.id_ferramenta}>
                      <td data-label="Cód">{f.codigo_ferramenta}</td>
                      <td data-label="Ferramenta">{f.nome_ferramenta}</td>
                      <td data-label="Marca">{f.marca || "-"}</td>
                      <td data-label="Categoria">{f.nome_categoria || "-"}</td>
                      
                      <td data-label="Status" style={{ fontWeight: "bold" }}>
                        <div
                          className="status-container"
                          style={{
                            color: status === "DISPONIVEL"
                              ? "#4caf50"
                              : isEmprestada
                              ? "#ff9800"
                              : "#f44336"
                          }}
                        >
                          {status === "DISPONIVEL" && "🟢 DISPONÍVEL"}
                          {status === "EMPRESTADA" && "🟠 EMPRESTADA"}
                          {status === "EM_MANUTENCAO" && "🔴 MANUTENÇÃO"}
                          {status === "ATRASADO" && "⚠️ ATRASADA"}
                        </div>
                      </td>
                      
                      <td data-label="Local de Uso">{f.local_uso || "-"}</td>
                      <td data-label="Responsável">{f.mecanico || "-"}</td>
                      <td data-label="Prev. Devolução">{isEmprestada ? formatarDataHora(f.previsao) : "-"}</td>

                      <td data-label="Ações" className="celula-acoes">
                        <div className="acoes">
                          {status === "DISPONIVEL" && (
                            <button
                              className="btn emprestar"
                              onClick={() => navigate(`/emprestar/${f.codigo_ferramenta}`)}
                            >
                              Emprestar
                            </button>
                          )}

                          {isEmprestada && isDono && (
                            <>
                              <button
                                className="btn editar"
                                onClick={() => navigate(`/editar/${f.id_emprestimo}`)}
                              >
                                Editar
                              </button>
                              <button
                                className="btn devolver"
                                onClick={() => handleDevolver(f.id_emprestimo)}
                              >
                                Devolver
                              </button>
                            </>
                          )}

                          {(status === "DISPONIVEL" || isEmprestada) && (
                            <button
                              className="btn reservar"
                              onClick={() =>
                                navigate("/nova-reserva", {
                                  state: { codigo_ferramenta: f.codigo_ferramenta }
                                })
                              }
                            >
                              Reservar
                            </button>
                          )}

                          {status === "EM_MANUTENCAO" && (
                            <span style={{ color: "#888", fontSize: "12px", fontStyle: "italic" }}>
                              Item em Manutenção
                            </span>
                          )}
                        </div>
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

export default ConsultaFerramentas;