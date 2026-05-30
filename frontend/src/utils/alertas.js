// frontend/src/utils/alertas.js

import Swal from 'sweetalert2';

// Configuração para notificações rápidas no canto da tela (Toasts)
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: '#1f2228',
  color: '#ffffff',
});

// Toast específico para erros, com mais tempo de leitura
const ToastErro = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 8000,
  timerProgressBar: true,
  background: '#1f2228',
  color: '#ffffff',
});

// Substitui o alert() de Sucesso
export const alertaSucesso = (mensagem) => {
  Toast.fire({ icon: 'success', title: mensagem });
};

// Substitui o alert() de Erro
export const alertaErro = (mensagem) => {
  ToastErro.fire({ icon: 'error', title: mensagem });
};

// Substitui o window.confirm()
export const confirmarAcao = async (mensagem, textoBotao = "Confirmar") => {
  const result = await Swal.fire({
    title: 'Atenção',
    text: mensagem,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ffc400',
    cancelButtonColor: '#d32f2f',
    confirmButtonText: `<span style="color: #000; font-weight: bold;">${textoBotao}</span>`,
    cancelButtonText: 'Cancelar',
    background: '#1f2228',
    color: '#ffffff',
  });

  return result.isConfirmed;
};