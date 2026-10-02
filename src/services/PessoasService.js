import { pessoasMock } from './PessoasMock';

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

export function cadastrarPessoa(formData) {
  // formData é um objeto FormData contendo os campos 'nome', 'cpf' e 'foto' (arquivo).
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const nome = formData.get('nome');
        const cpf = formData.get('cpf');
        const agora = new Date();

        const novaPessoa = {
          id: Math.max(..._pessoas.map((p) => p.id), 0) + 1,
          nome,
          cpf,
          metodoAcesso: 'Biometria Facial',
          confiancaBiometria: 97,
          status: 'liberado',
          motivoBloqueio: null,
          dataCadastro: `${String(agora.getDate()).padStart(2, '0')}/${String(agora.getMonth() + 1).padStart(2, '0')}/${agora.getFullYear()}`,
          horaCadastro: `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`,
        };

        _pessoas = [novaPessoa, ..._pessoas];
        resolve(novaPessoa);
      }, 600);
    });
  }

  // Quando a API Java estiver pronta, troque por uma chamada multipart real, por exemplo:
  // return api.post('/pessoas', formData, {
  //   headers: { 'Content-Type': 'multipart/form-data' },
  // }).then((res) => res.data);
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