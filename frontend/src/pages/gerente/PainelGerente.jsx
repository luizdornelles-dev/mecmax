import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/layoutMecanico.css";

function PainelGerente() {
  const navigate = useNavigate();

  // Estilo padronizado para os novos botões amarelos
  const estiloCardAmarelo = {
    backgroundColor: "#ffc400",
    color: "#1f2228",
    textAlign: "center",
    cursor: "pointer",
    padding: "30px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.4)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    fontWeight: "bold"
  };

  return (
    <div className="pagina-mecanico" style={{ padding: "20px" }}>
      <div className="container-mecanico" style={{ maxWidth: "1000px" }}>
        
        <h2 className="titulo" style={{ marginBottom: "30px", color: "#ffc400", textAlign: "center" }}>
          Painel Administrativo
        </h2>

        {/* Grid de Cartões do Painel */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", 
          gap: "25px" 
        }}>
          
          <div style={estiloCardAmarelo} onClick={() => navigate("/gerente/ferramentas")}>
            <div style={{ fontSize: "3.5rem", marginBottom: "15px" }}>🔧</div>
            <h3 style={{ margin: 0, fontSize: "1.4rem" }}>Ferramentas</h3>
          </div>

          <div style={estiloCardAmarelo} onClick={() => navigate("/gerente/mecanicos")}>
            <div style={{ fontSize: "3.5rem", marginBottom: "15px" }}>👥</div>
            <h3 style={{ margin: 0, fontSize: "1.4rem" }}>Mecânicos</h3>
          </div>

          <div style={estiloCardAmarelo} onClick={() => navigate("/gerente/locais")}>
            <div style={{ fontSize: "3.5rem", marginBottom: "15px" }}>📍</div>
            <h3 style={{ margin: 0, fontSize: "1.4rem" }}>Locais / Boxes</h3>
          </div>

          <div style={estiloCardAmarelo} onClick={() => navigate("/gerente/relatorios")}>
            <div style={{ fontSize: "3.5rem", marginBottom: "15px" }}>📊</div>
            <h3 style={{ margin: 0, fontSize: "1.4rem" }}>Relatórios</h3>
          </div>

        </div>
      </div>
    </div>
  );
}

export default PainelGerente;