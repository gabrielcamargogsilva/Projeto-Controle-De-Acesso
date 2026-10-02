import { estacoesMock, logsMockDaEstacao } from './EstacoesMock.js';

const USE_MOCK = true;

function normalizarIdentificador(valor, nomeParametro) {
  const texto = String(valor ?? '').trim();

  if (!texto) {
    throw new Error(`Parâmetro "${nomeParametro}" inválido: valor ausente.`);
  }

  return texto;
}

export function getEstacoes() {
  if (USE_MOCK) {
    return new Promise((resolve) => setTimeout(() => resolve([...estacoesMock]), 300));
  }
  // return api.get('/dispositivos/estacoes').then((res) => res.data);
}

export function getLogsDaEstacao(nomeEstacao) {
  const estacao = normalizarIdentificador(nomeEstacao, 'nomeEstacao');

  if (USE_MOCK) {
    return new Promise((resolve) => setTimeout(() => resolve(logsMockDaEstacao(estacao)), 200));
  }
  // return api.get(`/dispositivos/estacoes/${id}/logs`).then((res) => res.data);
}

export function enviarPing(nomeDispositivo) {
  const nome = normalizarIdentificador(nomeDispositivo, 'nomeDispositivo');

  if (USE_MOCK) {
    return new Promise((resolve) => setTimeout(() => resolve({ ok: true, latenciaMs: 12, nome }), 500));
  }
  // return api.post(`/dispositivos/${id}/ping`).then((res) => res.data);
}

export function sincronizarFacial(nomeDispositivo) {
  const nome = normalizarIdentificador(nomeDispositivo, 'nomeDispositivo');

  if (USE_MOCK) {
    return new Promise((resolve) => setTimeout(() => resolve({ ok: true, nome }), 700));
  }
  // return api.post(`/dispositivos/${id}/sincronizar-facial`).then((res) => res.data);
}

export function testarGiro(nomeDispositivo) {
  const nome = normalizarIdentificador(nomeDispositivo, 'nomeDispositivo');

  if (USE_MOCK) {
    return new Promise((resolve) => setTimeout(() => resolve({ ok: true, nome }), 500));
  }
  // return api.post(`/dispositivos/${id}/testar-giro`).then((res) => res.data);
}

export function reiniciarDispositivo(nomeDispositivo) {
  const nome = normalizarIdentificador(nomeDispositivo, 'nomeDispositivo');

  if (USE_MOCK) {
    return new Promise((resolve) => setTimeout(() => resolve({ ok: true, nome }), 800));
  }
  // return api.post(`/dispositivos/${id}/reiniciar`).then((res) => res.data);
}

export function bloqueioGeral() {
  if (USE_MOCK) {
    return new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 600));
  }
  // return api.post('/dispositivos/bloqueio-geral').then((res) => res.data);
}