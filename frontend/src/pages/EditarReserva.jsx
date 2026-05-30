// frontend/src/pages/EditarReserva.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "../styles/layoutMecanico.css";
import { alertaErro, alertaSucesso, confirmarAcao } from "../utils/alertas";

function EditarReserva() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [nomeFerramenta, setNomeFerramenta] = useState("");
  const [idFerramenta, setIdFerramenta] = useState(null);
  const [codigoFerramenta, setCodigoFerramenta] = useState("");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  
  // Memória para saber se o usuário alterou os dados originais
  const [inicioOriginal, setInicioOriginal] = useState("");
  const [fimOriginal, setFimOriginal] = useState("");
  
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const formatarParaInput = (dataIso) => {
    if (!dataIso) return "";
    const d = new Date(dataIso);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  useEffect(() => {
    async function carregar() {
      try {
        const resp = await api.get(`/reservas/${id}`);
        const r = resp.data?.data;
        if (r) {
          setNomeFerramenta(r.nome_ferramenta);
          setIdFerramenta(r.id_ferramenta);
          setCodigoFerramenta(r.codigo_ferramenta);
          
          const inicioFormatado = formatarParaInput(r.data_reserva_inicio);
          const fimFormatado = formatarParaInput(r.data_reserva_fim);
          
          setInicio(inicioFormatado);
          setFim(fimFormatado);
          setInicioOriginal(inicioFormatado);
          setFimOriginal(fimFormatado);
        }
      } catch (e) {
        alertaErro("Erro ao carregar os dados da reserva.");
        navigate("/reservas");
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [id, navigate]);

  function formatarParaMysql(valor) {
    if (!valor) return "";
    return valor.replace("T", " ") + ":00";
  }

  async function handleSalvar() {
    if (!inicio || !fim) return alertaErro("Preencha as datas de início e fim.");
    
    const dInicio = new Date(inicio);
    const dFim = new Date(fim);
    const agora = new Date();

    // CORREÇÃO: Só bloqueia se ele estiver TENTANDO alterar o início para uma nova data no passado.
    // Se ele deixou o início original quieto (mesmo sendo no passado), o sistema aceita.
    if (inicio !== inicioOriginal && dInicio < agora) {
      return alertaErro("A nova data de início não pode ser no passado.");
    }
    
    if (dFim <= dInicio) return alertaErro("A data de fim deve ser depois do início.");

    try {
      setSalvando(true);
      await api.put(`/reservas/${id}`, {
        data_reserva_inicio: formatarParaMysql(inicio),
        data_reserva_fim: formatarParaMysql(fim),
        id_ferramenta: idFerramenta,
        codigo_ferramenta: codigoFerramenta // Enviado por segurança para o backend
      });
      alertaSucesso("Reserva atualizada com sucesso!");
      setTimeout(() => {
        navigate("/reservas");
      }, 1500);
    } catch (e) {
      alertaErro(e.response?.data?.message || "Erro ao atualizar (Verifique colisão de horários).");
    } finally {
      setSalvando(false);
    }
  }

  // NOVA TRAVA DE SEGURANÇA
  async function handleCancelarSeguro() {
    // Se houve alguma alteração nas datas em relação ao que veio do banco
    if (inicio !== inicioOriginal || fim !== fimOriginal) {
      const confirmado = await confirmarAcao("Tem certeza que deseja cancelar? As alterações não salvas serão perdidas.", "Sim, Cancelar");
      if (!confirmado) return;
    }
    navigate("/reservas");
  }

  if (carregando) return <p style={{ color: '#fff', textAlign: 'center', marginTop: '20px' }}>Carregando dados...</p>;

  return (
    <div className="pagina-mecanico">
      <div className="container-mecanico">
        <div className="card-form-mecanico" style={{ margin: "0 auto" }}>
          <h2 className="titulo-form-mecanico">Editar Reserva #{id}</h2>
          
          <div className="grupo-campo-mecanico">
            <label>Ferramenta</label>
            <input 
              className="input-mecanico" 
              value={nomeFerramenta} 
              disabled 
              style={{ color: '#888', cursor: 'not-allowed' }} 
              title="Não é possível trocar a ferramenta da reserva"
            />
          </div>
          
          <div className="grupo-campo-mecanico">
            <label>Novo Início</label>
            <input 
              type="datetime-local" 
              className="input-mecanico" 
              value={inicio} 
              onChange={e => setInicio(e.target.value)} 
            />
          </div>
          
          <div className="grupo-campo-mecanico">
            <label>Novo Fim</label>
            <input 
              type="datetime-local" 
              className="input-mecanico" 
              value={fim} 
              onChange={e => setFim(e.target.value)} 
            />
          </div>
          
          <button 
            className="btn-primario-mecanico" 
            style={{ width: '100%', marginBottom: '10px' }} 
            onClick={handleSalvar}
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "Salvar Alterações"}
          </button>
          
          <button 
            className="btn-primario-mecanico" 
            style={{ width: '100%', backgroundColor: '#444', color: '#fff' }} 
            onClick={handleCancelarSeguro}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditarReserva;