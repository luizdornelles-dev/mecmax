// frontend/src/pages/gerente/GerenciarLocais.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "../../styles/layoutMecanico.css";
import { alertaErro, alertaSucesso, confirmarAcao } from "../../utils/alertas";

function GerenciarLocais() {
  const navigate = useNavigate();
  const [locais, setLocais] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const resp = await api.get("/localizacoes");
        setLocais(resp.data?.data || []);
      } catch (e) { 
        console.error(e); 
        alertaErro("Erro ao carregar a lista de locais.");
      } finally { 
        setCarregando(false); 
      }
    }
    carregar();
  }, []);

  async function handleExcluir(id, nome) {
    const confirmado = await confirmarAcao(`ATENÇÃO: Tem certeza que deseja EXCLUIR PERMANENTEMENTE o local "${nome}"?`, "Sim, Excluir");
    if (!confirmado) return;

    try { 
      await api.delete(`/localizacoes/${id}`); 
      alertaSucesso("Local excluído com sucesso!");
      setTimeout(() => window.location.reload(), 1500); 
    } 
    catch (e) { 
      const msg = e.response?.data?.message || "Este local possui histórico ou vínculos e não pode ser excluído.";
      alertaErro(msg); 
    }
  }

  return (
    <div className="pagina-mecanico">
      {/* Cabeçalho padronizado */}
      <div style={{ backgroundColor: "#1f2228", padding: "15px 20px", borderBottom: "1px solid #333", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0, fontSize: "1.2rem", color: "#ffc400" }}>Gerenciar Locais / Boxes</h2>
        <button className="btn-primario-mecanico" style={{ margin: 0, padding: "8px 15px" }} onClick={() => navigate("/gerente/painel")}>Voltar ao Painel</button>
      </div>

      <div className="container-mecanico">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
          <button className="btn-primario-mecanico" onClick={() => navigate("/gerente/novo-local")}>+ Novo Local</button>
        </div>
        <div className="tabela-container">
          {carregando ? <p style={{ color: '#fff' }}>Carregando...</p> : (
            <table className="tabela">
              <thead><tr><th>Código</th><th>Tipo</th><th>Nome</th><th>Ações</th></tr></thead>
              <tbody>
                {locais.map((L) => (
                  <tr key={L.id_localizacao}>
                    {/* Atributos data-label adicionados para responsividade */}
                    <td data-label="Código" style={{fontWeight:'bold', color:'#fff'}}>{L.codigo_local || '-'}</td>
                    <td data-label="Tipo"><span style={{ backgroundColor: '#333', padding: '2px 6px', borderRadius: '4px', fontSize: '0.85rem', color: '#aaa' }}>{L.tipo_local}</span></td>
                    <td data-label="Nome">{L.nome_local}</td>
                    <td data-label="Ações" className="acoes">
                      <button className="btn editar" onClick={() => navigate(`/gerente/editar-local/${L.id_localizacao}`)}>Editar</button>
                      <button className="btn devolver" style={{backgroundColor: '#d32f2f', color: '#fff'}} onClick={() => handleExcluir(L.id_localizacao, L.nome_local)}>Excluir</button>
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

export default GerenciarLocais;