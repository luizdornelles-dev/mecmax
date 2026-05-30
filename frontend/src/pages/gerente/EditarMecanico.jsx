// frontend/src/pages/gerente/EditarMecanico.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import "../../styles/layoutMecanico.css";
import { alertaErro, alertaSucesso, confirmarAcao } from "../../utils/alertas";

function EditarMecanico() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");

  useEffect(() => {
    async function carregar() {
      try {
        const resp = await api.get(`/mecanicos/${id}`);
        const m = resp.data.data;
        setNome(m.nome_completo);
        setMatricula(m.matricula);
      } catch (e) { 
        alertaErro("Erro ao carregar dados do mecânico."); 
        navigate("/gerente/mecanicos"); 
      }
    }
    carregar();
  }, [id, navigate]);

  async function handleSalvar() {
    if (!/^\d{6}$/.test(matricula)) {
      alertaErro("A matrícula deve conter EXATAMENTE 6 números.");
      return;
    }

    try {
      await api.put(`/mecanicos/${id}`, { 
        nome_completo: nome, 
        matricula: matricula 
      }); 
      alertaSucesso("Mecânico atualizado com sucesso!");
      setTimeout(() => {
        navigate("/gerente/mecanicos");
      }, 1500);
    } catch (e) {
      alertaErro(e.response?.data?.message || "Erro ao salvar alterações.");
    }
  }

  // NOVA TRAVA DE SEGURANÇA
  async function handleCancelar() {
    const confirmado = await confirmarAcao("Tem certeza que deseja cancelar? As edições não salvas serão perdidas.", "Sim, Cancelar");
    if (!confirmado) return;
    navigate("/gerente/mecanicos");
  }

  return (
    <div className="pagina-mecanico">
      <div className="container-mecanico">
        <div className="card-form-mecanico">
          <h2 className="titulo-form-mecanico">Editar Mecânico</h2>
          
          <div className="grupo-campo-mecanico">
            <label>Nome</label>
            <input 
              className="input-mecanico" 
              value={nome} 
              onChange={e=>setNome(e.target.value)}
            />
          </div>
          
          <div className="grupo-campo-mecanico">
            <label>Matrícula</label>
            <input 
              className="input-mecanico" 
              value={matricula} 
              onChange={e=>setMatricula(e.target.value)} 
              maxLength={6}
            />
            <small style={{color:'#888', fontSize:'12px'}}>Deve ser única e ter 6 dígitos.</small>
          </div>
          
          <button 
            className="btn-primario-mecanico" 
            style={{width:'100%'}} 
            onClick={handleSalvar}
          >
            Salvar Alterações
          </button>

          {/* BOTÃO ATUALIZADO */}
          <button 
            className="btn-primario-mecanico" 
            style={{width:'100%', marginTop:'10px', backgroundColor:'#444', color:'#fff'}} 
            onClick={handleCancelar}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditarMecanico;