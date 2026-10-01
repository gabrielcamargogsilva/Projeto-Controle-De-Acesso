import { pessoasMock } from './PessoasMock.js';

// Este arquivo simula o serviço de pessoas do backend.
// Quando a API Java estiver pronta, este boolean pode virar false
// e as funções abaixo passarão a chamar o backend real via axios/api.
const USE_MOCK = true;

// Copia os dados mockados para uma variável interna.
// Assim, a lista pode ser alterada em memória sem mexer no array original.
let _pessoas = [...pessoasMock];

// Busca todas as pessoas no sistema.
// Se estiver em modo mock, retorna uma Promise que "simula" uma requisição.
export function getPessoas() {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      // Simula o tempo de resposta de uma API real.
      setTimeout(() => resolve([..._pessoas]), 300);
    });
  }

  // Quando a API real existir, a linha abaixo será usada:
  // return api.get('/pessoas').then((res) => res.data);
}

// Altera o status de acesso de uma pessoa (ex.: liberado ou bloqueado).
// id = identificador da pessoa
// novoStatus = novo valor do status
export function alterarStatusAcesso(id, novoStatus) {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Atualiza a lista em memória:
        // - encontra a pessoa pelo id
        // - troca o status
        // - define o motivo de bloqueio se o status for bloqueado
        // - limpa o motivo se a pessoa for liberada
        _pessoas = _pessoas.map((p) =>
          p.id === id
            ? {
                ...p,
                status: novoStatus,
                motivoBloqueio:
                  novoStatus === 'bloqueado' ? 'Bloqueio Administrativo' : null,
              }
            : p
        );

        // Retorna a pessoa que foi atualizada.
        resolve(_pessoas.find((p) => p.id === id));
      }, 250);
    });
  }

  // Quando a API real existir, a linha abaixo será usada:
  // return api.patch(`/pessoas/${id}/status`, { status: novoStatus }).then((res) => res.data);
}