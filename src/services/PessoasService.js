import { pessoasMock } from './PessoasMock.js';

// Troque para false (ou use VITE_USE_MOCK no .env) quando a API Java estiver disponível.
const USE_MOCK = true;

let _pessoas = [...pessoasMock];

export function getPessoas() {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve([..._pessoas]), 300);
    });
  }
  // return api.get('/pessoas').then((res) => res.data);
}

export function alterarStatusAcesso(id, novoStatus) {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        _pessoas = _pessoas.map((p) =>
          p.id === id
            ? { ...p, status: novoStatus, motivoBloqueio: novoStatus === 'bloqueado' ? 'Bloqueio Administrativo' : null }
            : p
        );
        resolve(_pessoas.find((p) => p.id === id));
      }, 250);
    });
  }
  // return api.patch(`/pessoas/${id}/status`, { status: novoStatus }).then((res) => res.data);
}