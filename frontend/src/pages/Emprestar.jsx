// frontend/src/pages/Emprestar.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/layoutMecanico.css";
import { alertaErro, alertaSucesso, confirmarAcao } from "../utils/alertas";

function Emprestar() {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const mecanico = JSON.parse(sessionStorage.getItem("mecanicoLogado") || "null");
  const [previsao, setPrevisao] = useState("");
  const [localUso, setLocalUso] = useState("");
  const [locais, setLocais] = useState([]);
  const [carregandoLocais, setCarregandoLocais] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function carregarLocais() {
      try {
        const r = await api.get("/localizacoes");
        const dados = Array.isArray(r.data?.data) ? r.data.data : [];
        setLocais(dados);
      } catch (err) {
        console.error("Erro ao carregar locais:", err);
      } finally {
        setCarregandoLocais(false);
      }
    }
    carregarLocais();
  }, []);

  function formatarParaMysql(valor) {
    if (!valor) return "";
    return valor.replace("T", " ") + ":00";
  }

  async function registrar() {
    if (!mecanico) {
      alertaErro("Erro: Nenhum mecânico logado.");
      navigate("/");
      return;
    }
    if (!previsao || !localUso) {
      alertaErro("Preencha a previsão de devolução e o local de uso.");
      return;
    }

    const dataPrevisao = new Date(previsao);
    const agora = new Date();
    if (dataPrevisao < agora) {
      alertaErro("A previsão de devolução não pode ser no passado.");
      return;
    }

    setSalvando(true);
    try {
      const body = {
        id_mecanico: mecanico.id_mecanico,
        codigo_ferramenta: codigo,
        previsao_devolucao: formatarParaMysql(previsao),
        local_uso: localUso
      };
      await api.post("/emprestimos", body);
      alertaSucesso("Retirada confirmada com sucesso!");
      setTimeout(() => {
        navigate("/consulta-ferramentas");
      }, 1500);
    } catch (err) {
      alertaErro(err.response?.data?.message || "Erro ao registrar retirada.");
    } finally {
      setSalvando(false);
    }
  }

  async function handleCancelarSeguro() {
    if (previsao || localUso) {
      const confirmado = await confirmarAcao("Tem certeza que deseja cancelar? Os dados digitados serão perdidos.", "Sim, Cancelar");
      if (!confirmado) return;
    }
    navigate("/consulta-ferramentas");
  }

  return (
    <div className="pagina-mecanico">
      <header className="header-mecanico">
        <h2>Registrar Retirada</h2>
      </header>

      <div className="container-mecanico">
        <div className="card-form-mecanico">
          <h3 className="titulo-form-mecanico">Ferramenta: {codigo}</h3>
          <div className="grupo-campo-mecanico">
            <label>Previsão de Devolução</label>
            <input
              type="datetime-local"
              className="input-mecanico input-data-mecanico"
              value={previsao}
              onChange={(e) => setPrevisao(e.target.value)}
            />
          </div>
          <div className="grupo-campo-mecanico">
            <label>Local de Uso</label>
            <select
              className="input-mecanico"
              value={localUso}
              onChange={(e) => setLocalUso(e.target.value)}
              disabled={carregandoLocais}
            >
              <option value="">Selecione o local...</option>
              {locais.map((loc) => (
                <option key={loc.id_localizacao} value={loc.nome_local}>
                  {loc.nome_local}
                </option>
              ))}
            </select>
          </div>
          <button
            className="btn-primario-mecanico"
            onClick={registrar}
            disabled={salvando}
            style={{ width: "100%" }}
          >
            {salvando ? "Registrando..." : "Confirmar Retirada"}
          </button>
          
          <button
            className="btn-primario-mecanico"
            onClick={handleCancelarSeguro}
            style={{ width: "100%", marginTop: "10px", backgroundColor: "#444", color: "#fff" }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default Emprestar;