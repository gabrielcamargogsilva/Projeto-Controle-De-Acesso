import { useEffect, useMemo, useState } from 'react';
import {
  SlidersHorizontal,
  Search,
  Filter,
  ClipboardList,
  ScanFace,
  CheckCircle2,
  XCircle,
  ArrowDown,
  ArrowUp,
  LogIn,
  LogOut,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { getLogs } from '../../services/LogsService.js';
import './LogsAcesso.css';

const ITENS_POR_PAGINA = 6;
const CORES_AVATAR = ['#e53e3e', '#2563eb', '#059669', '#9333ea', '#d97706', '#0891b2'];

function iniciais(nome) {
  const partes = nome.trim().split(' ');
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

function corAvatar(nome) {
  const soma = nome.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return CORES_AVATAR[soma % CORES_AVATAR.length];
}

function dataISOParaCampo(data) {
  return data.toISOString().slice(0, 10);
}

function LogsAcesso() {
  const [logs, setLogs] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizadoAs, setAtualizadoAs] = useState('');

  const hoje = new Date();
  const hojeInicial = dataISOParaCampo(hoje);

  const [atalhoAtivo, setAtalhoAtivo] = useState('hoje');
  const [dataInicio, setDataInicio] = useState(hojeInicial);
  const [dataFim, setDataFim] = useState(hojeInicial);
  const [horaInicio, setHoraInicio] = useState('00:00');
  const [horaFim, setHoraFim] = useState('23:59');
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);

  function carregarLogs() {
    setCarregando(true);
    getLogs().then((dados) => {
      setLogs(dados);
      setCarregando(false);
      const agora = new Date();
      setAtualizadoAs(
        `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`
      );
    });
  }

  function aplicarAtalho(atalho) {
    const hojeAtual = new Date();
    let inicio = new Date();

    if (atalho === 'ontem') {
      inicio.setDate(hojeAtual.getDate() - 1);
      hojeAtual.setDate(hojeAtual.getDate() - 1);
    } else if (atalho === '7dias') {
      inicio.setDate(hojeAtual.getDate() - 6);
    } else if (atalho === 'mes') {
      inicio.setDate(hojeAtual.getDate() - 29);
    }

    setAtalhoAtivo(atalho);
    setDataInicio(dataISOParaCampo(inicio));
    setDataFim(dataISOParaCampo(hojeAtual));
    setPagina(1);
  }

  useEffect(() => {
    const carregarDadosIniciais = async () => {
      aplicarAtalho('hoje');
      carregarLogs();
    };

    carregarDadosIniciais();
  }, []);

  const logsFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return logs.filter((log) => {
      const dataLog = log.dataHora.slice(0, 10);
      const horaLog = log.dataHora.slice(11, 16);

      const dentroData = (!dataInicio || dataLog >= dataInicio) && (!dataFim || dataLog <= dataFim);
      const dentroHora = (!horaInicio || horaLog >= horaInicio) && (!horaFim || horaLog <= horaFim);
      const combinaBusca =
        termo === '' || log.nome.toLowerCase().includes(termo) || log.cpf.toLowerCase().includes(termo);

      return dentroData && dentroHora && combinaBusca;
    });
  }, [logs, dataInicio, dataFim, horaInicio, horaFim, busca]);

  const totalEntradas = logsFiltrados.filter((l) => l.sentido === 'entrada').length;
  const totalSaidas = logsFiltrados.filter((l) => l.sentido === 'saida').length;

  const totalPaginas = Math.max(1, Math.ceil(logsFiltrados.length / ITENS_POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const inicioPagina = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const logsDaPagina = logsFiltrados.slice(inicioPagina, inicioPagina + ITENS_POR_PAGINA);

  function numerosPagina() {
    const numeros = [];
    const janela = 1;
    for (let n = 1; n <= totalPaginas; n++) {
      const pertoDoInicio = n === 1;
      const pertoDoFim = n === totalPaginas;
      const pertoDaAtual = Math.abs(n - paginaAtual) <= janela;
      if (pertoDoInicio || pertoDoFim || pertoDaAtual) {
        numeros.push(n);
      } else if (numeros[numeros.length - 1] !== '...') {
        numeros.push('...');
      }
    }
    return numeros;
  }

  function formatarDataHora(iso) {
    const data = iso.slice(0, 10).split('-').reverse().join('/');
    const hora = iso.slice(11, 19);
    return { data, hora };
  }

  return (
    <div className="logs">
      {/* Cabeçalho da página */}
      <div className="logs__cabecalho">
          <div>
            <div className="logs__selo-tempo-real">
              <span className="pulso" />
              Operação em Tempo Real
            </div>
            <span className="logs__catracas-online">Catracas 01, 02, 03 e 04 Online</span>
            <h1>Registro de Entradas e Saídas</h1>
            <p>Log cronológico unificado de todas as passagens nas catracas da unidade SENAI Sorocaba.</p>
          </div>

          <div className="logs__resumo-rapido">
            <div className="logs__resumo-item">
              <span className="logs__resumo-icone logs__resumo-icone--entrada">
                <LogIn size={18} />
              </span>
              <div>
                <span className="logs__resumo-label">Entradas</span>
                <span className="logs__resumo-valor">{totalEntradas}</span>
              </div>
            </div>
            <div className="logs__resumo-item">
              <span className="logs__resumo-icone logs__resumo-icone--saida">
                <LogOut size={18} />
              </span>
              <div>
                <span className="logs__resumo-label">Saídas</span>
                <span className="logs__resumo-valor">{totalSaidas}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Painel de filtros */}
        <section className="logs__filtros">
          <div className="logs__filtros-topo">
            <h3>
              <SlidersHorizontal size={16} />
              Filtros de Log
            </h3>
            <span>
              Filtro ativo: <strong>{dataInicio === dataFim ? dataInicio?.split('-').reverse().join('/') : `${dataInicio?.split('-').reverse().join('/')} – ${dataFim?.split('-').reverse().join('/')}`} ({horaInicio} - {horaFim})</strong>
            </span>
          </div>

          <div className="logs__filtros-grade">
            <div className="logs__campo logs__campo--atalho">
              <label>1. Atalho Rápido de Dia</label>
              <div className="logs__atalhos">
                {[
                  { chave: 'hoje', rotulo: 'Hoje' },
                  { chave: 'ontem', rotulo: 'Ontem' },
                  { chave: '7dias', rotulo: '7 Dias' },
                  { chave: 'mes', rotulo: 'Mês' },
                ].map((item) => (
                  <button
                    key={item.chave}
                    className={atalhoAtivo === item.chave ? 'logs__atalho--ativo' : ''}
                    onClick={() => aplicarAtalho(item.chave)}
                  >
                    {item.rotulo}
                  </button>
                ))}
              </div>
            </div>

            <div className="logs__campo">
              <label>2. Data (Início e Fim)</label>
              <div className="logs__datas">
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => {
                    setAtalhoAtivo(null);
                    setDataInicio(e.target.value);
                    setPagina(1);
                  }}
                />
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => {
                    setAtalhoAtivo(null);
                    setDataFim(e.target.value);
                    setPagina(1);
                  }}
                />
              </div>
            </div>

            <div className="logs__campo">
              <label>3. Intervalo de Horas</label>
              <div className="logs__horas">
                <input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => {
                    setHoraInicio(e.target.value);
                    setPagina(1);
                  }}
                />
                <span>às</span>
                <input
                  type="time"
                  value={horaFim}
                  onChange={(e) => {
                    setHoraFim(e.target.value);
                    setPagina(1);
                  }}
                />
              </div>
            </div>

            <div className="logs__campo logs__campo--busca">
              <label>4. Buscar Pessoa (Nome ou CPF)</label>
              <div className="logs__busca">
                <Search size={15} />
                <input
                  type="text"
                  placeholder="Ex: Lucas Gabriel ou 412.***.898-04"
                  value={busca}
                  onChange={(e) => {
                    setBusca(e.target.value);
                    setPagina(1);
                  }}
                />
              </div>
            </div>

            <button className="logs__botao-filtrar" title="Filtrar" onClick={() => setPagina(1)}>
              <Filter size={16} />
            </button>
          </div>
        </section>

        {/* Tabela de logs */}
        <section className="logs__tabela-secao">
          <div className="logs__tabela-topo">
            <div className="logs__tabela-titulo">
              <ClipboardList size={18} />
              <h2>Registros do Período</h2>
              <span className="logs__contador-passagens">{logsFiltrados.length} passagens</span>
            </div>
            <div className="logs__tabela-acoes">
              <span className="logs__selo-facial">
                <ScanFace size={13} /> Exclusivo Facial
              </span>
              <span className="logs__texto-ws">Atualizado às {atualizadoAs}</span>
              <button className="logs__atualizar" onClick={carregarLogs}>
                <RefreshCw size={14} />
                Atualizar Agora
              </button>
            </div>
          </div>

          <div className="logs__tabela-wrapper">
            <table className="logs__tabela">
              <thead>
                <tr>
                  <th>Data &amp; Hora</th>
                  <th>Sentido / Operação</th>
                  <th>Pessoa (Nome / CPF)</th>
                  <th>Ponto de Acesso / Catraca</th>
                  <th>Método</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {carregando && (
                  <tr>
                    <td colSpan={6} className="logs__estado-vazio">
                      Carregando registros...
                    </td>
                  </tr>
                )}

                {!carregando && logsDaPagina.length === 0 && (
                  <tr>
                    <td colSpan={6} className="logs__estado-vazio">
                      Nenhum registro encontrado para esse filtro.
                    </td>
                  </tr>
                )}

                {logsDaPagina.map((log) => {
                  const { data, hora } = formatarDataHora(log.dataHora);
                  return (
                    <tr key={log.id}>
                      <td className="logs__mono">
                        <div className="logs__data-forte">{data}</div>
                        <div className="logs__hora-fraca">{hora}</div>
                      </td>
                      <td>
                        {log.sentido === 'entrada' ? (
                          <span className="pill-sentido pill-sentido--entrada">
                            <ArrowDown size={14} />
                            Entrada
                          </span>
                        ) : (
                          <span className="pill-sentido pill-sentido--saida">
                            <ArrowUp size={14} />
                            Saída
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="logs__pessoa">
                          <span className="avatar-pequeno" style={{ backgroundColor: corAvatar(log.nome) }}>
                            {iniciais(log.nome)}
                          </span>
                          <div>
                            <span className="logs__pessoa-nome">{log.nome}</span>
                            <span className="logs__pessoa-cpf">CPF: {log.cpf}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="logs__ponto-acesso">{log.catraca}</div>
                        <div className="logs__ponto-local">{log.local}</div>
                      </td>
                      <td>
                        <span className="pill-metodo">
                          <ScanFace size={14} />
                          {log.metodo}
                        </span>
                      </td>
                      <td>
                        {log.status === 'liberado' ? (
                          <span className="pill-status pill-status--liberado">
                            <CheckCircle2 size={14} />
                            Liberado
                          </span>
                        ) : (
                          <span className="pill-status pill-status--negado">
                            <XCircle size={14} />
                            Negado
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="logs__paginacao">
            <span>
              Mostrando {logsFiltrados.length === 0 ? 0 : inicioPagina + 1} a{' '}
              {Math.min(inicioPagina + ITENS_POR_PAGINA, logsFiltrados.length)} de {logsFiltrados.length}{' '}
              registros de acesso
            </span>

            <div className="logs__paginacao-botoes">
              <button
                className="logs__botao-pag"
                disabled={paginaAtual === 1}
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={14} />
                Anterior
              </button>

              {numerosPagina().map((n, idx) =>
                n === '...' ? (
                  <span key={`ellipsis-${idx}`} className="logs__paginacao-ellipsis">
                    ...
                  </span>
                ) : (
                  <button
                    key={n}
                    className={`logs__pagina-numero ${n === paginaAtual ? 'logs__pagina-numero--ativo' : ''}`}
                    onClick={() => setPagina(n)}
                  >
                    {n}
                  </button>
                )
              )}

              <button
                className="logs__botao-pag"
                disabled={paginaAtual === totalPaginas}
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              >
                Próxima
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </section>
      </div>
  );
}

export default LogsAcesso;