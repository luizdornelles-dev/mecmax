// frontend/src/pages/gerente/NovoLocal.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "../../styles/layoutMecanico.css";
import { alertaErro, alertaSucesso, confirmarAcao } from "../../utils/alertas";

function NovoLocal() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [codigo, setCodigo] = useState("");
  const [tipoSelecionado, setTipoSelecionado] = useState("OFICINA");
  const [novoTipo, setNovoTipo] = useState("");
  const [salvando, setSalvando] = useState(false);
  
  // Estado inteligente para guardar os tipos do dropdown
  const [tiposDisponiveis, setTiposDisponiveis] = useState(["OFICINA", "ALMOXARIFADO", "PINTURA", "FUNILARIA", "EXTERNO"]);

  // Busca os tipos que já existem no banco e adiciona ao dropdown
  useEffect(() => {
    async function carregarTipos() {
      try {
        const resp = await api.get("/localizacoes");
        if (resp.data && resp.data.data) {
          const tiposBase = ["OFICINA", "ALMOXARIFADO", "PINTURA", "FUNILARIA", "EXTERNO"];
          const tiposDoBanco = resp.data.data.map(l => l.tipo_local).filter(Boolean);
          // O objeto Set garante que não haverá tipos duplicados na lista
          const tiposUnicos = [...new Set([...tiposBase, ...tiposDoBanco])];
          setTiposDisponiveis(tiposUnicos);
        }
      } catch (e) {
        console.error("Erro ao carregar tipos dinâmicos do banco", e);
      }
    }
    carregarTipos();
  }, []);

  async function handleSalvar() {
    if (!nome || !codigo) return alertaErro("Preencha todos os campos.");
    if (!/^[0-9]{3}[A-Z]{3}$/.test(codigo)) return alertaErro("O Código deve ser 3 Números e 3 Letras (Ex: 001BOX).");

    const tipoFinal = tipoSelecionado === "OUTRO" ? novoTipo.toUpperCase() : tipoSelecionado;
    if (!tipoFinal) return alertaErro("Informe o tipo específico do local.");

    try {
      setSalvando(true);
      await api.post("/localizacoes", { nome_local: nome, tipo_local: tipoFinal, codigo_local: codigo });
      alertaSucesso("Local cadastrado com sucesso!");
      setTimeout(() => navigate("/gerente/locais"), 1500);
    } catch (e) {
      alertaErro(e.response?.data?.message || "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  }

  // Trava de segurança ao cancelar
  async function handleCancelar() {
    if (nome || codigo || novoTipo) {
      const confirmado = await confirmarAcao("Tem certeza que deseja cancelar? Os dados digitados serão perdidos.", "Sim, Cancelar");
      if (!confirmado) return;
    }
    navigate("/gerente/locais");
  }

  return (
    <div className="pagina-mecanico">
      <div className="container-mecanico">
        <div className="card-form-mecanico">
          <h2>Novo Local / Box</h2>
          
          <div className="grupo-campo-mecanico">
            <label>Código do Local</label>
            <input className="input-mecanico" value={codigo} onChange={e => setCodigo(e.target.value.toUpperCase())} maxLength={6} placeholder="Ex: 001BOX" />
          </div>
          
          <div className="grupo-campo-mecanico">
            <label>Nome</label>
            <input className="input-mecanico" value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Box 01"/>
          </div>
          
          <div className="grupo-campo-mecanico">
            <label>Tipo</label>
            <select className="input-mecanico" value={tipoSelecionado} onChange={e => setTipoSelecionado(e.target.value)}>
              {tiposDisponiveis.map(t => <option key={t} value={t}>{t}</option>)}
              <option value="OUTRO">OUTRO...</option>
            </select>
          </div>
          
          {tipoSelecionado === "OUTRO" && (
            <div className="grupo-campo-mecanico">
              <label>Qual o novo tipo?</label>
              <input className="input-mecanico" value={novoTipo} onChange={e => setNovoTipo(e.target.value.toUpperCase())} placeholder="Ex: RECEPÇÃO"/>
            </div>
          )}
          
          <button className="btn-primario-mecanico" style={{width:'100%'}} onClick={handleSalvar} disabled={salvando}>Cadastrar</button>
          <button className="btn-primario-mecanico" style={{width:'100%', marginTop:10, backgroundColor:'#444', color:'#fff'}} onClick={handleCancelar}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

export default NovoLocal;