// frontend/src/pages/gerente/GerenciarMecanicos.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "../../styles/layoutMecanico.css";
import { alertaErro, alertaSucesso, confirmarAcao } from "../../utils/alertas";

function GerenciarMecanicos() {
  const navigate = useNavigate();
  const [mecanicos, setMecanicos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const resp = await api.get("/mecanicos");
        setMecanicos(resp.data?.data || []);
      } catch (e) { 
        console.error(e);
        alertaErro("Erro ao carregar a lista de mecânicos.");
      } finally { 
        setCarregando(false); 
      }
    }
    carregar();
  }, []);

  async function handleExcluir(id, nome) {
    const confirmado = await confirmarAcao(`ATENÇÃO: Tem certeza que deseja EXCLUIR PERMANENTEMENTE o mecânico "${nome}"?`, "Sim, Excluir");
    if (!confirmado) return;
    
    try { 
      await api.delete(`/mecanicos/${id}`); 
      alertaSucesso("Mecânico excluído com sucesso!");
      setTimeout(() => window.location.reload(), 1500); 
    } catch (e) { 
      const msg = e.response?.data?.message || "Erro ao excluir mecânico.";
      alertaErro(msg); 
    }
  }

  return (
    <div className="pagina-mecanico">
      {/* Cabeçalho padronizado */}
      <div style={{ backgroundColor: "#1f2228", padding: "15px 20px", borderBottom: "1px solid #333", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0, fontSize: "1.2rem", color: "#ffc400" }}>Gerenciar Mecânicos</h2>
        <button className="btn-primario-mecanico" style={{ margin: 0, padding: "8px 15px" }} onClick={() => navigate("/gerente/painel")}>Voltar ao Painel</button>
      </div>
      <div className="container-mecanico">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
          <button className="btn-primario-mecanico" onClick={() => navigate("/gerente/novo-mecanico")}>+ Novo Mecânico</button>
        </div>
        <div className="tabela-container">
          {carregando ? <p style={{ color: '#fff' }}>Carregando...</p> : (
            <table className="tabela">
              <thead><tr><th>Matrícula</th><th>Nome Completo</th><th>Status</th><th>Ações</th></tr></thead>
              <tbody>
                {mecanicos.map((m) => (
                  <tr key={m.id_mecanico}>
                    {/* Atributos data-label adicionados para responsividade */}
                    <td data-label="Matrícula" style={{ fontWeight: 'bold' }}>{m.matricula}</td>
                    <td data-label="Nome Completo">{m.nome_completo}</td>
                    <td data-label="Status"><span style={{ color: '#4caf50', fontWeight: 'bold' }}>🟢 ATIVO</span></td>
                    <td data-label="Ações" className="acoes">
                      <button className="btn editar" onClick={() => navigate(`/gerente/editar-mecanico/${m.id_mecanico}`)}>Editar</button>
                      <button className="btn devolver" style={{backgroundColor: '#d32f2f', color: '#fff'}} onClick={() => handleExcluir(m.id_mecanico, m.nome_completo)}>Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default GerenciarMecanicos;