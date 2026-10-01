import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Home,
    ChevronRight,
    CircleCheck,
    Search,
    SlidersHorizontal,
    Download,
    UserPlus,
    ScanFace,
    Pencil,
    Lock,
    Unlock,
    MoreVertical,
    ChevronLeft,
} from 'lucide-react';
import { getPessoas, alterarStatusAcesso } from '../../services/PessoasService.js';
import './GestaoPessoas.css';

const ITENS_POR_PAGINA = 10;
const CORES_AVATAR = ['#e53e3e', '#2563eb', '#059669', '#9333ea', '#d97706', '#0891b2'];

function formatarHoraAtual() {
    const agora = new Date();
    return `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
}

function iniciais(nome) {
    const partes = nome.trim().split(' ');
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

function corAvatar(nome) {
    const soma = nome.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return CORES_AVATAR[soma % CORES_AVATAR.length];
}

function GestaoPessoas() {
    const [pessoas, setPessoas] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [busca, setBusca] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('todos');
    const [pagina, setPagina] = useState(1);
    const [sincronizadoAs, setSincronizadoAs] = useState(() => formatarHoraAtual());

    useEffect(() => {
        getPessoas().then((dados) => {
            setPessoas(dados);
            setCarregando(false);
            setSincronizadoAs(formatarHoraAtual());
        });
    }, []);

    const totalLiberados = pessoas.filter((p) => p.status === 'liberado').length;
    const totalBloqueados = pessoas.filter((p) => p.status === 'bloqueado').length;

    const pessoasFiltradas = useMemo(() => {
        return pessoas.filter((p) => {
            const combinaStatus = filtroStatus === 'todos' || p.status === filtroStatus;
            const termo = busca.trim().toLowerCase();
            const combinaBusca =
                termo === '' || p.nome.toLowerCase().includes(termo) || p.cpf.includes(termo);
            return combinaStatus && combinaBusca;
        });
    }, [pessoas, filtroStatus, busca]);

    const totalPaginas = Math.max(1, Math.ceil(pessoasFiltradas.length / ITENS_POR_PAGINA));
    const paginaAtual = Math.min(pagina, totalPaginas);
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const pessoasDaPagina = pessoasFiltradas.slice(inicio, inicio + ITENS_POR_PAGINA);

    function mudarFiltro(novoFiltro) {
        setFiltroStatus(novoFiltro);
        setPagina(1);
    }

    function mudarBusca(valor) {
        setBusca(valor);
        setPagina(1);
    }

    async function alternarBloqueio(pessoa) {
        const novoStatus = pessoa.status === 'liberado' ? 'bloqueado' : 'liberado';
        const atualizada = await alterarStatusAcesso(pessoa.id, novoStatus);
        setPessoas((atual) => atual.map((p) => (p.id === atualizada.id ? atualizada : p)));
    }

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

    return (
            <div className="gestao">
                {/* Cabeçalho da página */}
                <div className="gestao__topo">
                    <div className="gestao__breadcrumb">
                        <Home size={14} />
                        <span>Início</span>
                        <ChevronRight size={14} />
                        <strong>Pessoas Cadastradas</strong>
                    </div>
                    <div className="gestao__status-sistema">
                        <span className="gestao__status-item">
                             <span className="ponto ponto--verde" /> Catracas Ativas:  {/* {getCatracasAtivas} */}
                        </span>
                        <span className="gestao__status-divisor">|</span>
                        <span className="gestao__status-item">
                            <CircleCheck size={14} className="gestao__status-check" /> Sincronização Facial: 100%
                        </span>
                    </div>
                </div>

                <span className="gestao__badge">Módulo Acadêmico &amp; Operacional • SENAI Sorocaba</span>

                <div className="gestao__cabecalho">
                    <div>
                        <h1>Pessoas Cadastradas</h1>
                        <p>Gestão unificada de pessoas com biometria facial e permissões de acesso às catracas.</p>
                    </div>
                    <div className="gestao__acoes-topo">
                        <button className="botao botao--outline">
                            <Download size={16} />
                            Exportar Lista
                        </button>
                        <Link to="/pessoas/cadastro" className="botao botao--primario">
                            <UserPlus size={16} />
                            Cadastrar Nova Pessoa
                        </Link>
                    </div>
                </div>

                {/* Busca e filtros */}
                <div className="gestao__filtros">
                    <div className="gestao__busca">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou CPF..."
                            value={busca}
                            onChange={(e) => mudarBusca(e.target.value)}
                        />
                    </div>

                    <button
                        className={`chip chip--todos ${filtroStatus === 'todos' ? 'chip--ativo' : ''}`}
                        onClick={() => mudarFiltro('todos')}
                    >
                        Todos <span className="chip__contador">{pessoas.length}</span>
                    </button>
                    <button
                        className={`chip chip--liberado ${filtroStatus === 'liberado' ? 'chip--ativo' : ''}`}
                        onClick={() => mudarFiltro('liberado')}
                    >
                        <span className="ponto ponto--verde" /> Acesso Liberado
                        <span className="chip__contador">{totalLiberados}</span>
                    </button>
                    <button
                        className={`chip chip--bloqueado ${filtroStatus === 'bloqueado' ? 'chip--ativo' : ''}`}
                        onClick={() => mudarFiltro('bloqueado')}
                    >
                        <span className="ponto ponto--vermelho" /> Acesso Bloqueado
                        <span className="chip__contador">{totalBloqueados}</span>
                    </button>

                    <button className="botao botao--outline">
                        <SlidersHorizontal size={16} />
                        Filtros
                    </button>
                </div>

                <div className="gestao__resumo">
                    <span>
                        <strong>{pessoas.length}</strong> pessoas autorizadas no sistema{' '}
                        <span className="gestao__resumo-separador">•</span> 99,8% com biometria facial ativa
                    </span>
                    <span className="gestao__resumo-sync">
                        Banco de Dados Local: Sincronizado às {sincronizadoAs}
                    </span>
                </div>

                {/* Tabela */}
                <div className="gestao__tabela-wrapper">
                    <table className="gestao__tabela">
                        <thead>
                            <tr>
                                <th>Foto / Biometria</th>
                                <th>Nome Completo</th>
                                <th>CPF</th>
                                <th>Método de Acesso</th>
                                <th>Status do Acesso</th>
                                <th>Data do Cadastro</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {carregando && (
                                <tr>
                                    <td colSpan={7} className="gestao__estado-vazio">
                                        Carregando pessoas...
                                    </td>
                                </tr>
                            )}

                            {!carregando && pessoasDaPagina.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="gestao__estado-vazio">
                                        Nenhuma pessoa encontrada para esse filtro.
                                    </td>
                                </tr>
                            )}

                            {pessoasDaPagina.map((p) => (
                                <tr key={p.id}>
                                    <td>
                                        <div className="avatar" style={{ backgroundColor: corAvatar(p.nome) }}>
                                            {iniciais(p.nome)}
                                            <span className="avatar__ponto" />
                                        </div>
                                    </td>
                                    <td>
                                        <div className="gestao__nome">{p.nome}</div>
                                        <div className="gestao__id">ID: #SP-{p.id}</div>
                                        {p.motivoBloqueio && (
                                            <div className="gestao__motivo-bloqueio">{p.motivoBloqueio}</div>
                                        )}
                                    </td>
                                    <td>{p.cpf}</td>
                                    <td>
                                        <span className="pill pill--metodo">
                                            <ScanFace size={14} />
                                            {p.metodoAcesso} ({p.confiancaBiometria}%)
                                        </span>
                                    </td>
                                    <td>
                                        {p.status === 'liberado' ? (
                                            <span className="pill pill--liberado">
                                                <span className="ponto ponto--verde" /> Liberado
                                            </span>
                                        ) : (
                                            <span className="pill pill--bloqueado">
                                                <span className="ponto ponto--vermelho" /> Bloqueado
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <div>{p.dataCadastro}</div>
                                        <div className="gestao__hora">às {p.horaCadastro}</div>
                                    </td>
                                    <td>
                                        <div className="gestao__acoes-linha">
                                            <button className="icone-acao" title="Editar">
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                className={`icone-acao ${p.status === 'bloqueado' ? 'icone-acao--verde' : ''}`}
                                                title={p.status === 'liberado' ? 'Bloquear acesso' : 'Liberar acesso'}
                                                onClick={() => alternarBloqueio(p)}
                                            >
                                                {p.status === 'liberado' ? <Lock size={16} /> : <Unlock size={16} />}
                                            </button>
                                            <button className="icone-acao" title="Mais opções">
                                                <MoreVertical size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Paginação */}
                <div className="gestao__paginacao">
                    <span>
                        Mostrando {pessoasFiltradas.length === 0 ? 0 : inicio + 1} a{' '}
                        {Math.min(inicio + ITENS_POR_PAGINA, pessoasFiltradas.length)} de{' '}
                        {pessoasFiltradas.length} pessoas cadastradas
                    </span>

                    <div className="gestao__paginacao-botoes">
                        <button
                            className="botao botao--outline botao--pequeno"
                            disabled={paginaAtual === 1}
                            onClick={() => setPagina((p) => Math.max(1, p - 1))}
                        >
                            <ChevronLeft size={14} />
                            Anterior
                        </button>

                        {numerosPagina().map((n, idx) =>
                            n === '...' ? (
                                <span key={`ellipsis-${idx}`} className="gestao__paginacao-ellipsis">
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={n}
                                    className={`pagina-numero ${n === paginaAtual ? 'pagina-numero--ativo' : ''}`}
                                    onClick={() => setPagina(n)}
                                >
                                    {n}
                                </button>
                            )
                        )}

                        <button
                            className="botao botao--outline botao--pequeno"
                            disabled={paginaAtual === totalPaginas}
                            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                        >
                            Próxima
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
    );
}

export default GestaoPessoas;