// frontend/src/pages/gerente/NovoMecanico.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "../../styles/layoutMecanico.css";
import { alertaErro, alertaSucesso, confirmarAcao } from "../../utils/alertas";

function NovoMecanico() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [perfil, setPerfil] = useState("MECANICO");
  const [salvando, setSalvando] = useState(false);

  async function handleSalvar() {
    if (!nome || !matricula || !senha) return alertaErro("Preencha Nome, Matrícula e Senha.");
    if (!/^\d{6}$/.test(matricula)) return alertaErro("A matrícula deve conter EXATAMENTE 6 números.");
    
    try {
      setSalvando(true);
      await api.post("/mecanicos", { 
        nome_completo: nome, 
        matricula: matricula,
        senha: senha,
        perfil: perfil
      });
      alertaSucesso("Usuário cadastrado com sucesso!");
      setTimeout(() => {
        navigate("/gerente/mecanicos");
      }, 1500);
    } catch (e) { 
      alertaErro(e.response?.data?.message || "Erro ao salvar usuário."); 
    } finally { 
      setSalvando(false); 
    }
  }

  // NOVA TRAVA DE SEGURANÇA
  async function handleCancelar() {
    if (nome || matricula || senha) {
      const confirmado = await confirmarAcao("Tem certeza que deseja cancelar? Os dados digitados serão perdidos.", "Sim, Cancelar");
      if (!confirmado) return;
    }
    navigate("/gerente/mecanicos");
  }

  return (
    <div className="pagina-mecanico">
      <div className="container-mecanico">
        <div className="card-form-mecanico">
          <h2>Novo Usuário</h2>
          
          <div className="grupo-campo-mecanico">
            <label>Nome Completo</label>
            <input className="input-mecanico" value={nome} onChange={e => setNome(e.target.value)} />
          </div>
          
          <div className="grupo-campo-mecanico">
            <label>Matrícula</label>
            <input className="input-mecanico" value={matricula} onChange={e => setMatricula(e.target.value)} maxLength={6} />
          </div>

          <div className="grupo-campo-mecanico">
            <label>Senha Inicial</label>
            <input type="text" className="input-mecanico" value={senha} onChange={e => setSenha(e.target.value)} />
          </div>

          <div className="grupo-campo-mecanico">
            <label>Perfil de Acesso</label>
            <select className="input-mecanico" value={perfil} onChange={e => setPerfil(e.target.value)}>
              <option value="MECANICO">MECÂNICO (Acesso Operacional)</option>
              <option value="GERENTE">GERENTE (Acesso Administrativo)</option>
            </select>
          </div>
          
          <button className="btn-primario-mecanico" style={{width:'100%', marginTop: '10px'}} onClick={handleSalvar} disabled={salvando}>
            Cadastrar
          </button>
          
          {/* BOTÃO ATUALIZADO */}
          <button className="btn-primario-mecanico" style={{width:'100%', marginTop:10, backgroundColor:'#444', color:'#fff'}} onClick={handleCancelar}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default NovoMecanico;