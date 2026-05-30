// frontend/src/pages/gerente/EditarLocal.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import "../../styles/layoutMecanico.css";
import { alertaErro, alertaSucesso, confirmarAcao } from "../../utils/alertas";

function EditarLocal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [codigo, setCodigo] = useState("");
  const [tipoSelecionado, setTipoSelecionado] = useState("OFICINA");
  const [novoTipo, setNovoTipo] = useState("");
  const [carregando, setCarregando] = useState(true);
  
  const [tiposDisponiveis, setTiposDisponiveis] = useState(["OFICINA", "ALMOXARIFADO", "PINTURA", "FUNILARIA", "EXTERNO"]);

  useEffect(() => {
    async function carregar() {
      try {
        // Busca o local sendo editado E a lista completa de locais (para popular o dropdown dinamicamente)
        const [respLocal, respTodos] = await Promise.all([
            api.get(`/localizacoes/${id}`),
            api.get('/localizacoes')
        ]);

        const tiposBase = ["OFICINA", "ALMOXARIFADO", "PINTURA", "FUNILARIA", "EXTERNO"];
        let tiposUnicos = [...tiposBase];

        // Adiciona os tipos que vieram do banco ao dropdown
        if (respTodos.data && respTodos.data.data) {
            const tiposDoBanco = respTodos.data.data.map(l => l.tipo_local).filter(Boolean);
            tiposUnicos = [...new Set([...tiposBase, ...tiposDoBanco])];
            setTiposDisponiveis(tiposUnicos);
        }

        // Alimenta o formulário com os dados do local atual
        if (respLocal.data && respLocal.data.data) {
            const d = respLocal.data.data;
            setNome(d.nome_local);
            setCodigo(d.codigo_local || "");
            
            if (tiposUnicos.includes(d.tipo_local)) { 
              setTipoSelecionado(d.tipo_local); 
            } else { 
              setTipoSelecionado("OUTRO"); 
              setNovoTipo(d.tipo_local);
            }
        }
      } catch (e) {
        alertaErro("Erro ao carregar os dados do local.");
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [id]);

  async function handleSalvar() {
    if (!nome || !codigo) return alertaErro("Preencha todos os campos.");
    if (!/^[0-9]{3}[A-Z]{3}$/.test(codigo)) return alertaErro("O Código deve ser 3 Números e 3 Letras (Ex: 001BOX).");

    const tipoFinal = tipoSelecionado === "OUTRO" ? novoTipo.toUpperCase() : tipoSelecionado;
    if (!tipoFinal) return alertaErro("Informe o tipo do local.");

    try {
      await api.put(`/localizacoes/${id}`, { nome_local: nome, tipo_local: tipoFinal, codigo_local: codigo });
      alertaSucesso("Local atualizado com sucesso!");
      setTimeout(() => navigate("/gerente/locais"), 1500);
    } catch (e) {
      alertaErro(e.response?.data?.message || "Erro ao atualizar.");
    }
  }

  // Trava de segurança
  async function handleCancelar() {
    const confirmado = await confirmarAcao("Tem certeza que deseja cancelar? As edições não salvas serão perdidas.", "Sim, Cancelar");
    if (!confirmado) return;
    navigate("/gerente/locais");
  }

  return (
    <div className="pagina-mecanico">
      <div className="container-mecanico">
        <div className="card-form-mecanico">
          <h2>Editar Local / Box</h2>
          
          {carregando ? <p style={{color:'#fff', textAlign:'center'}}>Carregando...</p> : (
            <>
              <div className="grupo-campo-mecanico">
                <label>Código</label>
                <input className="input-mecanico" value={codigo} onChange={e=>setCodigo(e.target.value.toUpperCase())} maxLength={6}/>
              </div>
              
              <div className="grupo-campo-mecanico">
                <label>Nome</label>
                <input className="input-mecanico" value={nome} onChange={e=>setNome(e.target.value)}/>
              </div>
              
              <div className="grupo-campo-mecanico">
                <label>Tipo</label>
                <select className="input-mecanico" value={tipoSelecionado} onChange={e=>setTipoSelecionado(e.target.value)}>
                  {tiposDisponiveis.map(t => <option key={t} value={t}>{t}</option>)}
                  <option value="OUTRO">OUTRO...</option>
                </select>
              </div>
              
              {tipoSelecionado === "OUTRO" && (
                <div className="grupo-campo-mecanico">
                  <label>Qual o novo tipo?</label>
                  <input className="input-mecanico" value={novoTipo} onChange={e=>setNovoTipo(e.target.value.toUpperCase())}/>
                </div>
              )}
              
              <button className="btn-primario-mecanico" style={{width:'100%'}} onClick={handleSalvar}>Salvar Alterações</button>
              <button className="btn-primario-mecanico" style={{width:'100%', marginTop:10, backgroundColor:'#444', color:'#fff'}} onClick={handleCancelar}>Cancelar</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default EditarLocal;