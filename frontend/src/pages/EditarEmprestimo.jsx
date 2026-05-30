// frontend/src/pages/EditarEmprestimo.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "../styles/layoutMecanico.css";
import { alertaErro, alertaSucesso, confirmarAcao } from "../utils/alertas";

function formatDateTimeForInput(value) {
  if (!value) return "";
  const d = new Date(value);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function EditarEmprestimo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(true);
  
  const [codigoFerramenta, setCodigoFerramenta] = useState("");
  const [previsaoDevolucao, setPrevisaoDevolucao] = useState("");
  const [localUso, setLocalUso] = useState("");
  const [locaisUso, setLocaisUso] = useState([]);

  // Estados para controlar alterações (para a trava do cancelar)
  const [previsaoOriginal, setPrevisaoOriginal] = useState("");
  const [localOriginal, setLocalOriginal] = useState("");

  useEffect(() => {
    async function carregar() {
      try {
        const respEmp = await api.get(`/emprestimos/${id}`);
        const emp = respEmp.data?.data;
        if (!emp) {
          alertaErro("Empréstimo não encontrado.");
          navigate("/consulta-ferramentas");
          return;
        }
        setCodigoFerramenta(emp.codigo_ferramenta);
        
        const dataFormatada = formatDateTimeForInput(emp.previsao_devolucao);
        setPrevisaoDevolucao(dataFormatada);
        setPrevisaoOriginal(dataFormatada);

        setLocalUso(emp.local_uso || "");
        setLocalOriginal(emp.local_uso || "");

        const respLocais = await api.get("/localizacoes");
        setLocaisUso(Array.isArray(respLocais.data?.data) ? respLocais.data.data : []);
      } catch (e) {
        alertaErro("Erro ao carregar os dados.");
        navigate("/consulta-ferramentas");
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
    if (!previsaoDevolucao || !localUso) {
      alertaErro("Preencha todos os campos.");
      return;
    }

    // VALIDAÇÃO: Impede salvar data no passado caso tenha sido alterada
    if (previsaoDevolucao !== previsaoOriginal) {
      const dataPrev = new Date(previsaoDevolucao);
      const agora = new Date();
      if (dataPrev < agora) {
        alertaErro("A previsão de devolução não pode ser alterada para o passado.");
        return;
      }
    }

    try {
      const body = {
        previsao_devolucao: formatarParaMysql(previsaoDevolucao),
        local_uso: localUso
      };
      await api.put(`/emprestimos/${id}`, body);

      alertaSucesso("Empréstimo atualizado com sucesso!");
      setTimeout(() => {
        navigate("/consulta-ferramentas");
      }, 1500);
    } catch (e) {
      alertaErro(e.response?.data?.message || "Erro ao salvar alterações.");
    }
  }

  // NOVA TRAVA DE SEGURANÇA
  async function handleCancelarSeguro() {
    if (previsaoDevolucao !== previsaoOriginal || localUso !== localOriginal) {
      const confirmado = await confirmarAcao("Tem certeza que deseja cancelar? As edições não salvas serão perdidas.", "Sim, Cancelar");
      if (!confirmado) return;
    }
    navigate("/consulta-ferramentas");
  }

  if (carregando) return <p style={{ color: '#fff', textAlign: 'center', marginTop: '20px' }}>Carregando dados...</p>;

  return (
    <div className="pagina-mecanico">
      <header className="header-mecanico">
        <h2>Editar Empréstimo</h2>
      </header>
      <div className="container-mecanico">
        <div className="card-form-mecanico">
          <h3 className="titulo-form-mecanico">Atualizar Dados</h3>
          <div className="grupo-campo-mecanico">
            <label>Ferramenta</label>
            <input type="text" className="input-mecanico" value={codigoFerramenta} disabled style={{ color: '#888', cursor: 'not-allowed' }} />
          </div>
          <div className="grupo-campo-mecanico">
            <label>Previsão</label>
            <input
              type="datetime-local"
              className="input-mecanico input-data-mecanico"
              value={previsaoDevolucao}
              onChange={(e) => setPrevisaoDevolucao(e.target.value)}
            />
          </div>
          <div className="grupo-campo-mecanico">
            <label>Local de uso</label>
            <select
              className="input-mecanico"
              value={localUso}
              onChange={(e) => setLocalUso(e.target.value)}
            >
              <option value="">Selecione...</option>
              {locaisUso.map((loc) => (
                <option key={loc.id_localizacao} value={loc.nome_local}>
                  {loc.nome_local}
                </option>
              ))}
            </select>
          </div>
          <button className="btn-primario-mecanico" onClick={handleSalvar} style={{ width: '100%' }}>
            Salvar alterações
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

export default EditarEmprestimo;