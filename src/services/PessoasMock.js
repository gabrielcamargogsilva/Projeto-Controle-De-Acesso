// Dados de teste para a tela de Gestão de Pessoas.
// Quando a API Java estiver pronta, o pessoasService.js troca essas funções
// por chamadas reais (axios) — a página não precisa mudar.

const NOMES = [
  'Matheus Henrique de Souza Santos',
  'Mariana de Souza Carvalho',
  'Lucas Gabriel Ribeiro Martins',
  'Carlos Eduardo Santos Nogueira',
  'Beatriz Helena Camargo',
  'Roberto Silveira Machado',
  'Ana Paula Mendes Fontes',
  'Fernanda Costa Lima',
  'Pedro Henrique Alves Barros',
  'Juliana Ribeiro Pereira',
  'Gustavo Henrique Dias Moreira',
  'Camila Fernandes Rocha',
  'Rafael Augusto Teixeira',
  'Larissa Oliveira Monteiro',
  'Bruno César Andrade',
  'Patrícia Gomes Vieira',
  'Thiago Martins Correia',
  'Vanessa Almeida Castro',
  'Felipe Souza Barbosa',
  'Débora Cristina Ramos',
  'André Luiz Pinto',
  'Renata Aparecida Lopes',
  'Diego Fernando Cardoso',
  'Simone Rodrigues Nunes',
];

const MOTIVOS_BLOQUEIO = ['Bloqueio Administrativo', 'Documentação Pendente', 'Acesso Suspenso'];

function gerarCpf(seed) {
  const p = (n) => String(n).padStart(3, '0').slice(-3);
  return `${p(seed * 7 + 100)}.${p(seed * 13 + 200)}.${p(seed * 19 + 300)}-${String(seed * 3 + 10).slice(-2)}`;
}

function gerarData(diasAtras) {
  const data = new Date();
  data.setDate(data.getDate() - diasAtras);
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const hora = String(8 + (diasAtras % 10)).padStart(2, '0');
  const minuto = String((diasAtras * 7) % 60).padStart(2, '0');
  return {
    data: `${dia}/${mes}/${data.getFullYear()}`,
    hora: `${hora}:${minuto}`,
  };
}

export const pessoasMock = NOMES.map((nome, i) => {
  const bloqueado = i === 2 || i % 9 === 0 && i !== 0; // mantém o padrão do protótipo (poucos bloqueados)
  const { data, hora } = gerarData(i + 1);

  return {
    id: 88219 + i,
    nome,
    cpf: gerarCpf(i + 1),
    metodoAcesso: 'Biometria Facial',
    confiancaBiometria: 95 + (i % 5),
    status: bloqueado ? 'bloqueado' : 'liberado',
    motivoBloqueio: bloqueado ? MOTIVOS_BLOQUEIO[i % MOTIVOS_BLOQUEIO.length] : null,
    dataCadastro: data,
    horaCadastro: hora,
  };
});