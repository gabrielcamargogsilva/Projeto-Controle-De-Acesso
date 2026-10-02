import { logsMock } from './LogsMock.js';

// Troque para false (ou use VITE_USE_MOCK no .env) quando a API Java estiver disponível.
const USE_MOCK = true;

export function getLogs() {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...logsMock]), 300);
    });
  }
  // return api.get('/logs-acesso').then((res) => res.data);
}