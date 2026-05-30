// frontend/src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/layoutMecanico.css";
import { alertaErro, alertaSucesso } from "../utils/alertas";

function Login() {
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [salvando, setSalvando] = useState(false);
  const navigate = useNavigate();

  // Se já estiver logado na sessão atual, redireciona automaticamente
  // Ao fechar a aba/navegador, a sessão é encerrada.
  useEffect(() => {
    const mecanico = JSON.parse(sessionStorage.getItem("mecanicoLogado") || "null");
    const gerente = JSON.parse(sessionStorage.getItem("gerenteLogado") || "null");
    
    if (mecanico) navigate("/consulta-ferramentas");
    if (gerente) navigate("/gerente/painel");
  }, [navigate]);

  async function handleLogin(e) {
    e.preventDefault();

    if (!matricula.trim() || !senha.trim()) {
      return alertaErro("Digite a matrícula e a senha.");
    }

    if (!/^\d{6}$/.test(matricula)) {
      return alertaErro("A matrícula deve conter exatamente 6 números.");
    }

    try {
      setSalvando(true);

      const resp = await api.post("/mecanicos/login", {
        matricula,
        senha
      });
      
      if (resp.data.success) {
        const usuario = resp.data.data;
        
        // Limpa qualquer sessão anterior antes de gravar a nova
        sessionStorage.removeItem("mecanicoLogado");
        sessionStorage.removeItem("gerenteLogado");

        // Redirecionamento baseado no perfil vindo do banco de dados
        if (usuario.perfil === "GERENTE") {
          sessionStorage.setItem("gerenteLogado", JSON.stringify(usuario));
          alertaSucesso("Bem-vindo, Gerente!");
          navigate("/gerente/painel");
        } else {
          sessionStorage.setItem("mecanicoLogado", JSON.stringify(usuario));
          alertaSucesso("Acesso autorizado!");
          navigate("/consulta-ferramentas");
        }
      } else {
        alertaErro(resp.data.message);
      }
    } catch (error) {
      alertaErro(error.response?.data?.message || "Erro de conexão com o servidor.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div
      className="pagina-mecanico"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: 0
      }}
    >
      <header
        style={{
          padding: "20px",
          backgroundColor: "#1f2228",
          borderBottom: "1px solid #333",
          textAlign: "center"
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "2rem",
            color: "#ffc400"
          }}
        >
          MecMax
        </h1>

        <p
          style={{
            margin: 0,
            color: "#aaa",
            fontSize: "0.9rem"
          }}
        >
          Sistema de Gestão de Ferramentas
        </p>
      </header>

      <div
        className="container-mecanico"
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <div
          className="card-form-mecanico"
          style={{
            width: "100%",
            maxWidth: "400px"
          }}
        >
          <h2
            className="titulo-form-mecanico"
            style={{
              textAlign: "center",
              marginBottom: "30px"
            }}
          >
            Acesso ao Sistema
          </h2>
          
          <form onSubmit={handleLogin}>
            <div className="grupo-campo-mecanico">
              <label>Matrícula</label>
              <input
                type="text"
                className="input-mecanico"
                placeholder="Ex: 100001"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                maxLength={6}
                autoFocus
              />
            </div>

            <div className="grupo-campo-mecanico">
              <label>Senha</label>
              <input
                type="password"
                className="input-mecanico"
                placeholder="Sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>

            <button
              className="btn-primario-mecanico"
              style={{
                width: "100%",
                marginTop: "20px",
                padding: "12px",
                fontSize: "1.1rem"
              }}
              disabled={salvando}
            >
              {salvando ? "Autenticando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;