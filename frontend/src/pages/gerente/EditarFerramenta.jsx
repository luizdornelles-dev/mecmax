// frontend/src/pages/gerente/EditarFerramenta.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import "../../styles/layoutMecanico.css";
import { alertaErro, alertaSucesso, confirmarAcao } from "../../utils/alertas";

function EditarFerramenta() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [codigo, setCodigo] = useState(""); 
  const [nome, setNome] = useState("");
  const [marca, setMarca] = useState("");
  const [categoria, setCategoria] = useState("1");
  const [observacoes, setObservacoes] = useState("");
  const [idStatus, setIdStatus] = useState("1"); 
  const [statusOriginal, setStatusOriginal] = useState("1");
  const [carregando, setCarregando] = useState(true);

  const statusAutomatico =
    Number(statusOriginal) === 2 || Number(statusOriginal) === 4;

  useEffect(() => {
    async function carregar() {
      try {
        const resp = await api.get(`/ferramentas/${id}`);
        const f = resp.data.data;

        if (f) {
          setCodigo(f.codigo_ferramenta || "");
          setNome(f.nome_ferramenta || "");
          setMarca(f.marca || "");
          setCategoria(String(f.id_categoria || "1"));
          setObservacoes(f.descricao || "");
          setIdStatus(String(f.id_status));
          setStatusOriginal(String(f.id_status));
        }
      } catch (e) { 
        alertaErro("Erro ao carregar a ferramenta."); 
        navigate("/gerente/ferramentas"); 
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, [id, navigate]);

  async function handleSalvar() {
    if (!codigo || !nome) {
      return alertaErro("Código e Nome são obrigatórios.");
    }

    if (statusAutomatico && idStatus !== statusOriginal) {
      return alertaErro(
        "Esta ferramenta está emprestada ou atrasada. O status só pode ser alterado automaticamente pelo sistema após a devolução."
      );
    }

    try {
      await api.put(`/ferramentas/${id}`, {
        codigo_ferramenta: codigo,
        nome_ferramenta: nome,
        marca: marca,
        id_categoria: categoria,
        observacoes: observacoes,
        id_status: statusAutomatico ? statusOriginal : idStatus
      });

      alertaSucesso("Ferramenta atualizada!");

      setTimeout(() => navigate("/gerente/ferramentas"), 1500);
    } catch (e) { 
      alertaErro(e.response?.data?.message || "Erro ao atualizar."); 
    }
  }

  async function handleCancelar() {
    const confirmado = await confirmarAcao(
      "Tem certeza que deseja cancelar? As edições não salvas serão perdidas.",
      "Sim, Cancelar"
    );

    if (!confirmado) return;

    navigate("/gerente/ferramentas");
  }

  return (
    <div className="pagina-mecanico">
      <div className="container-mecanico">
        <div className="card-form-mecanico">
          <h2>Editar Ferramenta</h2>
          
          {carregando ? (
            <p style={{ color: "#fff", textAlign: "center" }}>
              Carregando...
            </p>
          ) : (
            <>
              <div className="grupo-campo-mecanico">
                <label>Código</label>
                <input
                  className="input-mecanico"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                  maxLength={6}
                />
              </div>

              <div className="grupo-campo-mecanico">
                <label>Nome</label>
                <input
                  className="input-mecanico"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>

              <div className="grupo-campo-mecanico">
                <label>Marca</label>
                <input
                  className="input-mecanico"
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                />
              </div>
              
              <div className="grupo-campo-mecanico">
                <label>Status Operacional</label>
                <select
                  className="input-mecanico"
                  value={idStatus}
                  onChange={(e) => setIdStatus(e.target.value)}
                  disabled={statusAutomatico}
                  title={
                    statusAutomatico
                      ? "Status controlado automaticamente pelo sistema."
                      : ""
                  }
                >
                  <option value="1">DISPONÍVEL</option>
                  <option value="3">EM MANUTENÇÃO</option>
                  <option value="5">INATIVA</option>

                  {Number(statusOriginal) === 2 && (
                    <option value="2">
                      EMPRESTADA
                    </option>
                  )}

                  {Number(statusOriginal) === 4 && (
                    <option value="4">
                      ATRASADA
                    </option>
                  )}
                </select>

                {statusAutomatico && (
                  <p
                    style={{
                      color: "#ffc400",
                      fontSize: "12px",
                      marginTop: "6px",
                      marginBottom: 0
                    }}
                  >
                    Este status é automático. Para alterar, registre a devolução da ferramenta.
                  </p>
                )}
              </div>

              <div className="grupo-campo-mecanico">
                <label>Categoria</label>
                <select
                  className="input-mecanico"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                >
                  <option value="1">Manuais</option>
                  <option value="2">Elétricas</option>
                  <option value="3">Diagnóstico</option>
                  <option value="4">Pneumáticas</option>
                  <option value="5">Especiais</option>
                  <option value="7">Elevação</option>
                </select>
              </div>
              
              <div className="grupo-campo-mecanico">
                <label>Observações</label>
                <textarea
                  className="input-mecanico"
                  rows="3"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                />
              </div>
              
              <button
                className="btn-primario-mecanico"
                style={{ width: "100%" }}
                onClick={handleSalvar}
              >
                Salvar
              </button>

              <button
                className="btn-primario-mecanico"
                style={{
                  width: "100%",
                  marginTop: 10,
                  backgroundColor: "#444",
                  color: "#fff"
                }}
                onClick={handleCancelar}
              >
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default EditarFerramenta;