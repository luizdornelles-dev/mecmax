// frontend/src/components/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { alertaErro } from "../utils/alertas";

function PrivateRoute({ children, tipo }) {
  const mecanico = JSON.parse(sessionStorage.getItem("mecanicoLogado") || "null");
  const gerente = JSON.parse(sessionStorage.getItem("gerenteLogado") || "null");

  // Se a rota for exclusiva para Gerentes
  if (tipo === "gerente") {
    // Validação estrita: verifica o perfil gravado na sessão atual
    if (!gerente || gerente.perfil !== "GERENTE") {
      // Se for um mecânico tentando acessar a área do gerente
      if (mecanico) {
        alertaErro("Acesso negado: Esta área é exclusiva para administradores.");
        return <Navigate to="/consulta-ferramentas" replace />;
      }

      // Se não houver ninguém logado
      return <Navigate to="/" replace />;
    }

    return children;
  }

  // Rota padrão: acessível para usuários logados na sessão atual
  if (!mecanico && !gerente) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default PrivateRoute;