// frontend/src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3002/api",
});

// Envia informações básicas do usuário logado para o backend
api.interceptors.request.use((config) => {
  const mecanico = JSON.parse(sessionStorage.getItem("mecanicoLogado") || "null");
  const gerente = JSON.parse(sessionStorage.getItem("gerenteLogado") || "null");

  const usuario = gerente || mecanico;

  if (usuario) {
    config.headers["x-user-id"] = usuario.id_mecanico;
    config.headers["x-user-perfil"] = usuario.perfil;
  }

  return config;
});

export default api;