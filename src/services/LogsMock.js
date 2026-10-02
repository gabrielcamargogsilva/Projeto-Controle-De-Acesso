// Dados de teste para a tela de Logs de Entrada/Saída.
// Quando a API Java estiver pronta, o logsService.js troca essas funções
// por chamadas reais (axios) — a página não precisa mudar.

const PESSOAS = [
  { nome: 'Lucas Gabriel Ribeiro Martins', cpf: '412.***.898-04' },
  { nome: 'Mariana de Souza Carvalho', cpf: '289.***.118-72' },
  { nome: 'Carlos Eduardo Santos Nogueira', cpf: '350.***.428-19' },
  { nome: 'Beatriz Helena Camargo', cpf: '501.***.938-55' },
  { nome: 'Roberto Silveira Machado', cpf: '119.***.608-20' },
  { nome: 'Ana Paula Mendes Fontes', cpf: '388.***.718-91' },
  { nome: 'Matheus Henrique de Souza Santos', cpf: '482.***.328-11' },
  { nome: 'Fernanda Costa Lima', cpf: '205.***.774-33' },
  { nome: 'Pedro Henrique Alves Barros', cpf: '619.***.205-67' },
  { nome: 'Juliana Ribeiro Pereira', cpf: '340.***.556-82' },
];

const PONTOS_ACESSO = [
  { catraca: 'Catraca 01 - Portaria Principal', local: 'Portão de Pedestres' },
  { catraca: 'Catraca 02 - Portaria Principal', local: 'Bloco Tecnológico A' },
  { catraca: 'Catraca 03 - Acesso Oficinas', local: 'Galpão Metalmecânica' },
  { catraca: 'Catraca 04 - Estacionamento', local: 'Acesso Veicular / Docência' },
];

// Quantos dias atrás cada registro aconteceu (cobre "hoje", "ontem", "7 dias" e "mês")
const DIAS_ATRAS = [0, 0, 0, 0, 1, 1, 1, 2, 3, 3, 4, 5, 6, 7, 8, 10, 12, 15, 18, 22, 25, 28, 0, 0, 1, 2, 0, 1, 3, 6];

function gerarDataHora(diasAtras, indice) {
  const data = new Date();
  data.setDate(data.getDate() - diasAtras);
  data.setHours(7 + (indice % 13), (indice * 11) % 60, (indice * 7) % 60, 0);
  return data;
}

export const logsMock = DIAS_ATRAS.map((dias, i) => {
  const pessoa = PESSOAS[i % PESSOAS.length];
  const ponto = PONTOS_ACESSO[i % PONTOS_ACESSO.length];
  const sentido = i % 2 === 0 ? 'entrada' : 'saida';
  const negado = i % 13 === 0; // poucos registros negados, pra mostrar o status no visual

  return {
    id: i + 1,
    dataHora: gerarDataHora(dias, i).toISOString(),
    sentido,
    nome: pessoa.nome,
    cpf: pessoa.cpf,
    catraca: ponto.catraca,
    local: ponto.local,
    metodo: 'Facial',
    status: negado ? 'negado' : 'liberado',
  };
}).sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));