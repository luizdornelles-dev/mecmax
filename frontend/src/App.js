import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";

import Login from "./pages/Login";

import ConsultaFerramentas from "./pages/ConsultaFerramentas";
import Emprestar from "./pages/Emprestar";
import EditarEmprestimo from "./pages/EditarEmprestimo";
import ListaReservas from "./pages/ListaReservas";
import NovaReserva from "./pages/NovaReserva";
import EditarReserva from "./pages/EditarReserva"; 
import PrivateRoute from "./components/PrivateRoute";

import PainelGerente from "./pages/gerente/PainelGerente";
import GerenciarFerramentas from "./pages/gerente/GerenciarFerramentas";
import NovaFerramenta from "./pages/gerente/NovaFerramenta";
import EditarFerramenta from "./pages/gerente/EditarFerramenta"; 
import GerenciarMecanicos from "./pages/gerente/GerenciarMecanicos";
import NovoMecanico from "./pages/gerente/NovoMecanico";
import EditarMecanico from "./pages/gerente/EditarMecanico"; 
import GerenciarLocais from "./pages/gerente/GerenciarLocais";
import NovoLocal from "./pages/gerente/NovoLocal";
import EditarLocal from "./pages/gerente/EditarLocal"; 
import Relatorios from "./pages/gerente/Relatorios";
import RelatorioHistorico from "./pages/gerente/RelatorioHistorico";
import RelatorioVisaoGeral from "./pages/gerente/RelatorioVisaoGeral";
import RelatorioFerramentasMaisUsadas from "./pages/gerente/RelatorioFerramentasMaisUsadas";
import RelatorioAtrasosMecanico from "./pages/gerente/RelatorioAtrasosMecanico";
import RelatorioFerramentasEmUso from "./pages/gerente/RelatorioFerramentasEmUso";
import RelatorioReservas from "./pages/gerente/RelatorioReservas";

function LayoutMecanico({ children }) {
  const navigate = useNavigate();
  const mecanicoLogado = JSON.parse(sessionStorage.getItem("mecanicoLogado") || "null");

  function handleSair() {
    sessionStorage.removeItem("mecanicoLogado");
    sessionStorage.removeItem("gerenteLogado");
    navigate("/");
  }

  return (
    <div>
      <header
        style={{
          padding: 10,
          backgroundColor: "#222",
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #333"
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "1.2rem", color: "#ffc400" }}>
            MecMax
          </h1>

          <nav style={{ marginTop: 4, fontSize: "0.9rem" }}>
            <Link
              to="/consulta-ferramentas"
              style={{
                color: "#fff",
                marginRight: 15,
                textDecoration: "none"
              }}
            >
              Empréstimo / Consulta
            </Link>

            <Link
              to="/reservas"
              style={{
                color: "#fff",
                marginRight: 15,
                textDecoration: "none"
              }}
            >
              Reservas / Consulta
            </Link>
          </nav>
        </div>

        <div style={{ fontSize: "0.9rem" }}>
          {mecanicoLogado && (
            <>
              <span style={{ marginRight: 10 }}>
                Olá, {mecanicoLogado.nome_completo.split(" ")[0]}
              </span>

              <button
                onClick={handleSair}
                style={{
                  background: "transparent",
                  border: "1px solid #555",
                  color: "#fff",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Sair
              </button>
            </>
          )}
        </div>
      </header>

      <main style={{ padding: 20 }}>{children}</main>
    </div>
  );
}

function LayoutGerente({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  function handleSair() {
    sessionStorage.removeItem("mecanicoLogado");
    sessionStorage.removeItem("gerenteLogado");
    navigate("/");
  }

  return (
    <div>
      <header
        style={{
          padding: "15px 20px",
          backgroundColor: "#1f2228",
          borderBottom: "1px solid #333",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px"
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#ffc400",
              fontSize: "1.4rem"
            }}
          >
            MecMax{" "}
            <span style={{ color: "#fff", fontSize: "0.6em" }}>
              | Gerente
            </span>
          </h2>

          <nav style={{ display: "flex", gap: "15px" }}>
            {location.pathname !== "/gerente/painel" && (
              <Link
                to="/gerente/painel"
                style={{ color: "#aaa", textDecoration: "none" }}
              >
                Painel
              </Link>
            )}

            <Link
              to="/gerente/ferramentas"
              style={{
                color: location.pathname.includes("/ferramentas") ? "#fff" : "#aaa",
                textDecoration: "none"
              }}
            >
              Ferramentas
            </Link>

            <Link
              to="/gerente/mecanicos"
              style={{
                color: location.pathname.includes("/mecanicos") ? "#fff" : "#aaa",
                textDecoration: "none"
              }}
            >
              Mecânicos
            </Link>

            <Link
              to="/gerente/locais"
              style={{
                color: location.pathname.includes("/locais") ? "#fff" : "#aaa",
                textDecoration: "none"
              }}
            >
              Locais
            </Link>

            <Link
              to="/gerente/relatorios"
              style={{
                color: location.pathname.includes("/relatorios") ? "#fff" : "#aaa",
                textDecoration: "none"
              }}
            >
              Relatórios
            </Link>
          </nav>
        </div>

        <button
          onClick={handleSair}
          style={{
            background: "transparent",
            border: "none",
            color: "#aaa",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Sair
        </button>
      </header>

      <div
        className="pagina-mecanico"
        style={{ minHeight: "calc(100vh - 70px)" }}
      >
        {children}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/consulta-ferramentas"
          element={
            <PrivateRoute>
              <LayoutMecanico>
                <ConsultaFerramentas />
              </LayoutMecanico>
            </PrivateRoute>
          }
        />

        <Route
          path="/emprestar/:codigo"
          element={
            <PrivateRoute>
              <LayoutMecanico>
                <Emprestar />
              </LayoutMecanico>
            </PrivateRoute>
          }
        />

        <Route
          path="/editar/:id"
          element={
            <PrivateRoute>
              <LayoutMecanico>
                <EditarEmprestimo />
              </LayoutMecanico>
            </PrivateRoute>
          }
        />

        <Route
          path="/reservas"
          element={
            <PrivateRoute>
              <LayoutMecanico>
                <ListaReservas />
              </LayoutMecanico>
            </PrivateRoute>
          }
        />

        <Route
          path="/nova-reserva"
          element={
            <PrivateRoute>
              <LayoutMecanico>
                <NovaReserva />
              </LayoutMecanico>
            </PrivateRoute>
          }
        />

        <Route
          path="/reservas/editar/:id"
          element={
            <PrivateRoute>
              <LayoutMecanico>
                <EditarReserva />
              </LayoutMecanico>
            </PrivateRoute>
          }
        />

        <Route
          path="/gerente/painel"
          element={
            <PrivateRoute tipo="gerente">
              <LayoutGerente>
                <PainelGerente />
              </LayoutGerente>
            </PrivateRoute>
          }
        />

        <Route
          path="/gerente/ferramentas"
          element={
            <PrivateRoute tipo="gerente">
              <LayoutGerente>
                <GerenciarFerramentas />
              </LayoutGerente>
            </PrivateRoute>
          }
        />

        <Route
          path="/gerente/nova-ferramenta"
          element={
            <PrivateRoute tipo="gerente">
              <LayoutGerente>
                <NovaFerramenta />
              </LayoutGerente>
            </PrivateRoute>
          }
        />

        <Route
          path="/gerente/editar-ferramenta/:id"
          element={
            <PrivateRoute tipo="gerente">
              <LayoutGerente>
                <EditarFerramenta />
              </LayoutGerente>
            </PrivateRoute>
          }
        />

        <Route
          path="/gerente/mecanicos"
          element={
            <PrivateRoute tipo="gerente">
              <LayoutGerente>
                <GerenciarMecanicos />
              </LayoutGerente>
            </PrivateRoute>
          }
        />

        <Route
          path="/gerente/novo-mecanico"
          element={
            <PrivateRoute tipo="gerente">
              <LayoutGerente>
                <NovoMecanico />
              </LayoutGerente>
            </PrivateRoute>
          }
        />

        <Route
          path="/gerente/editar-mecanico/:id"
          element={
            <PrivateRoute tipo="gerente">
              <LayoutGerente>
                <EditarMecanico />
              </LayoutGerente>
            </PrivateRoute>
          }
        />

        <Route
          path="/gerente/locais"
          element={
            <PrivateRoute tipo="gerente">
              <LayoutGerente>
                <GerenciarLocais />
              </LayoutGerente>
            </PrivateRoute>
          }
        />

        <Route
          path="/gerente/novo-local"
          element={
            <PrivateRoute tipo="gerente">
              <LayoutGerente>
                <NovoLocal />
              </LayoutGerente>
            </PrivateRoute>
          }
        />

        <Route
          path="/gerente/editar-local/:id"
          element={
            <PrivateRoute tipo="gerente">
              <LayoutGerente>
                <EditarLocal />
              </LayoutGerente>
            </PrivateRoute>
          }
        />

        <Route
          path="/gerente/relatorios"
          element={
            <PrivateRoute tipo="gerente">
              <LayoutGerente>
                <Relatorios />
              </LayoutGerente>
            </PrivateRoute>
          }
        />

        <Route
          path="/gerente/relatorios/historico"
          element={
            <PrivateRoute tipo="gerente">
              <LayoutGerente>
                <RelatorioHistorico />
              </LayoutGerente>
            </PrivateRoute>
          }
        />

        <Route
          path="/gerente/relatorios/visao-geral"
          element={
            <PrivateRoute tipo="gerente">
              <LayoutGerente>
                <RelatorioVisaoGeral />
              </LayoutGerente>
            </PrivateRoute>
          }
        />

        <Route
          path="/gerente/relatorios/ferramentas-mais-usadas"
          element={
            <PrivateRoute tipo="gerente">
              <LayoutGerente>
                <RelatorioFerramentasMaisUsadas />
              </LayoutGerente>
            </PrivateRoute>
          }
        />

        <Route
          path="/gerente/relatorios/atrasos-mecanico"
          element={
            <PrivateRoute tipo="gerente">
              <LayoutGerente>
                <RelatorioAtrasosMecanico />
              </LayoutGerente>
            </PrivateRoute>
          }
        />

        <Route
          path="/gerente/relatorios/ferramentas-em-uso"
          element={
            <PrivateRoute tipo="gerente">
              <LayoutGerente>
                <RelatorioFerramentasEmUso />
              </LayoutGerente>
            </PrivateRoute>
          }
        />

        <Route
          path="/gerente/relatorios/reservas"
          element={
            <PrivateRoute tipo="gerente">
              <LayoutGerente>
                <RelatorioReservas />
              </LayoutGerente>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;