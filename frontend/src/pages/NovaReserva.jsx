// frontend/src/pages/NovaReserva.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/layoutMecanico.css";
import { alertaErro, alertaSucesso, confirmarAcao } from "../utils/alertas";

function NovaReserva() {
  const location = useLocation();
  const navigate = useNavigate();
  const mecanico = JSON.parse(sessionStorage.getItem("mecanicoLogado") || "null");

  const ferramentaPreSelecionada = location.state?.codigo_ferramenta || "";

  const [codigoFerramenta, setCodigoFerramenta] = useState(ferramentaPreSelecionada);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [salvando, setSalvando] = useState(false);

  function formatarParaMysql(valor) {
    if (!valor) return "";
    return valor.replace("T", " ") + ":00";
  }

  async function handleSalvar() {
    if (!mecanico) {
      alertaErro("Erro: Nenhum mecânico logado.");
      navigate("/");
      return;
    }

    if (!codigoFerramenta || !dataInicio || !dataFim) {
      alertaErro("Preencha o código da ferramenta, data de início e fim.");
      return;
    }

    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const agora = new Date();

    if (inicio < agora) {
      alertaErro("A data de início não pode estar no passado.");
      return;
    }

    if (fim <= inicio) {
      alertaErro("A data/hora final deve ser maior que a inicial.");
      return;
    }

    try {
      setSalvando(true);

      const payload = {
        codigo_ferramenta: codigoFerramenta,
        data_reserva_inicio: formatarParaMysql(dataInicio),
        data_reserva_fim: formatarParaMysql(dataFim),
        id_mecanico: mecanico.id_mecanico
      };

      await api.post("/reservas", payload);
      alertaSucesso("Reserva efetuada com sucesso!");
      setTimeout(() => navigate("/reservas"), 1500);

    } catch (error) {
      alertaErro(error.response?.data?.message || "Erro ao efetuar reserva.");
    } finally {
      setSalvando(false);
    }
  }

  async function handleCancelarSeguro() {
    if (dataInicio || dataFim || codigoFerramenta !== ferramentaPreSelecionada) {
      const confirmado = await confirmarAcao(
        "Tem certeza que deseja cancelar? Os dados digitados serão perdidos.",
        "Sim, Cancelar"
      );

      if (!confirmado) return;
    }

    navigate("/consulta-ferramentas");
  }

  return (
    <div className="pagina-mecanico">
      <div className="container-mecanico">
        <div className="card-form-mecanico" style={{ margin: "0 auto" }}>
          <h2 className="titulo-form-mecanico">Nova Reserva</h2>

          <div className="grupo-campo-mecanico">
            <label>Código da Ferramenta</label>
            <input
              type="text"
              className="input-mecanico"
              value={codigoFerramenta}
              onChange={(e) => setCodigoFerramenta(e.target.value.toUpperCase())}
              disabled={!!ferramentaPreSelecionada}
            />
          </div>

          <div className="grupo-campo-mecanico">
            <label>Data/Hora Início</label>
            <input
              type="datetime-local"
              className="input-mecanico"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>

          <div className="grupo-campo-mecanico">
            <label>Data/Hora Fim</label>
            <input
              type="datetime-local"
              className="input-mecanico"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>

          <button
            className="btn-primario-mecanico"
            onClick={handleSalvar}
            disabled={salvando}
            style={{ width: "100%", marginBottom: "10px" }}
          >
            {salvando ? "Salvando..." : "Confirmar Reserva"}
          </button>

          <button 
            className="btn-primario-mecanico"
            onClick={handleCancelarSeguro}
            style={{
              width: "100%",
              backgroundColor: "#444",
              color: "#fff",
              marginBottom: "20px"
            }}
          >
            Cancelar
          </button>

          <div style={{ borderTop: "1px solid #2f323a", paddingTop: "15px", textAlign: "center" }}>
            <p style={{ fontSize: "13px", color: "#aaa", marginBottom: "10px" }}>
              Deseja verificar outros períodos ou status?
            </p>

            <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
              <button 
                className="btn" 
                style={{
                  background: "#2962ff",
                  color: "#fff",
                  padding: "8px",
                  width: "100%"
                }} 
                onClick={() => navigate("/reservas")}
              >
                📅 Ver Lista de Reservas Existentes
              </button>

              <button 
                className="btn" 
                style={{
                  background: "#333",
                  color: "#ffc400",
                  padding: "8px",
                  width: "100%",
                  border: "1px solid #444"
                }} 
                onClick={() => navigate("/consulta-ferramentas")}
              >
                🔍 Voltar para Consulta de Ferramentas
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default NovaReserva;