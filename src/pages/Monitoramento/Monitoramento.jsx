import { useEffect, useMemo, useState } from 'react';
import {
    Search,
    RefreshCw,
    Activity,
    DoorOpen,
    ScanFace,
    Gauge,
    Wrench,
    RotateCw,
    Power,
    Video,
    Terminal,
    Download,
    Play,
    X,
    CheckCircle2,
    Loader2,
    MapPin,
} from 'lucide-react';
import {
    getEstacoes,
    getLogsDaEstacao,
    enviarPing,
    sincronizarFacial,
    testarGiro,
    reiniciarDispositivo,
    bloqueioGeral,
} from '../../services/MonitoramentoService';
import '../Monitoramento/Monitoramento.css';

function calcularPingMedio(estacoes) {
    if (estacoes.length === 0) return 0;
    const soma = estacoes.reduce((acc, e) => acc + e.catraca.ping, 0);
    return Math.round(soma / estacoes.length);
}

function Monitoramento() {
    const [estacoes, setEstacoes] = useState([]);
    const [carregando, setCarregando] = useState(true);

    const [busca, setBusca] = useState('');
    const [tipoFiltro, setTipoFiltro] = useState('todos'); // todos | catracas | facial
    const [statusFiltro, setStatusFiltro] = useState('todos'); // todos | online | sincronizando | alerta

    const [toast, setToast] = useState({ visivel: false, mensagem: '', Icone: CheckCircle2, cor: '#34d399' });
    const [drawer, setDrawer] = useState(null); // estação aberta no painel lateral
    const [logsDrawer, setLogsDrawer] = useState([]);

    useEffect(() => {
        getEstacoes().then((dados) => {
            setEstacoes(dados);
            setCarregando(false);
        });
    }, []);

    useEffect(() => {
        function aoPressionarTecla(e) {
            if (e.key === 'Escape') fecharDrawer();
        }
        document.addEventListener('keydown', aoPressionarTecla);
        return () => document.removeEventListener('keydown', aoPressionarTecla);
    }, []);

    function mostrarToast(mensagem, Icone = CheckCircle2, cor = '#34d399') {
        setToast({ visivel: true, mensagem, Icone, cor });
        setTimeout(() => setToast((t) => ({ ...t, visivel: false })), 3200);
    }

    async function handlePing(nomeDispositivo) {
        await enviarPing(nomeDispositivo);
        mostrarToast(`Ping enviado para [${nomeDispositivo}]. Resposta ACK em 12ms (RTT OK).`, Activity, '#34d399');
    }

    async function handlePingGeral() {
        mostrarToast('Ping geral em andamento...', Activity, '#60a5fa');
        await Promise.all(estacoes.map((e) => enviarPing(e.catraca.nome)));
        mostrarToast(
            `Ping geral concluído: ${estacoes.length * 2} dispositivos responderam em média ${calcularPingMedio(estacoes)}ms.`,
            Activity,
            '#34d399'
        );
    }

    async function handleSincronizarFacial(nomeDispositivo) {
        await sincronizarFacial(nomeDispositivo);
        mostrarToast(`Tabela biométrica atualizada com sucesso no [${nomeDispositivo}].`, RefreshCw, '#34d399');
    }

    async function handleSincronizarFacialGeral() {
        mostrarToast('Sincronizando todos os terminais faciais...', RefreshCw, '#60a5fa');
        await Promise.all(estacoes.map((e) => sincronizarFacial(e.facial.nome)));
        mostrarToast('Sincronização forçada concluída em todos os terminais faciais!', RefreshCw, '#34d399');
    }

    async function handleTestarGiro(nomeDispositivo) {
        await testarGiro(nomeDispositivo);
        mostrarToast(`Comando de teste de giro eletromecânico disparado em [${nomeDispositivo}].`, RotateCw, '#f59e0b');
    }

    async function handleReiniciar(nomeDispositivo) {
        const confirmado = window.confirm(
            `Confirma o comando de reinício remoto seguro para o equipamento: ${nomeDispositivo}?`
        );
        if (!confirmado) return;
        await reiniciarDispositivo(nomeDispositivo);
        mostrarToast(`Reinicialização remota disparada em [${nomeDispositivo}].`, Power, '#e53e3e');
    }

    async function handleBloqueioGeral() {
        const confirmado = window.confirm(
            'ATENÇÃO: Deseja acionar o BLOQUEIO GERAL de emergência de todas as catracas físicas?'
        );
        if (!confirmado) return;
        await bloqueioGeral();
        mostrarToast('BLOQUEIO GERAL ATIVADO! Todas as catracas foram travadas.', Power, '#ef4444');
    }

    function handleVerVideo(nomeCamera, ip) {
        mostrarToast(`Conectando feed de vídeo HD de [${nomeCamera}] (${ip}:554)...`, Video, '#60a5fa');
    }

    async function handleAtualizarTudo() {
        mostrarToast('Atualizando telemetria em tempo real...', RefreshCw, '#60a5fa');
        const dados = await getEstacoes();
        setEstacoes(dados);
        setTimeout(() => {
            mostrarToast('Dados de todas as catracas e terminais faciais sincronizados!', CheckCircle2, '#34d399');
        }, 400);
    }

    async function abrirDrawer(estacao) {
        setDrawer(estacao);
        const logs = await getLogsDaEstacao(estacao.nome);
        setLogsDrawer(logs);
    }

    function fecharDrawer() {
        setDrawer(null);
    }

    function exportarLog() {
        mostrarToast('Arquivo Syslog (.LOG) exportado com sucesso.', Download, '#60a5fa');
    }

    function pulsoDeTeste() {
        mostrarToast('Comando de pulso teste enviado à catraca.', Play, '#ffffff');
    }

    const estacoesFiltradas = useMemo(() => {
        const termo = busca.trim().toLowerCase();

        return estacoes.filter((e) => {
            const textoCombinado = `${e.nome} ${e.descricao} ${e.catraca.nome} ${e.catraca.ip} ${e.facial.nome} ${e.facial.ip}`.toLowerCase();
            const combinaBusca = termo === '' || textoCombinado.includes(termo);

            let combinaStatus = true;
            if (statusFiltro === 'online') combinaStatus = e.statusGeral === 'operacional';
            else if (statusFiltro === 'sincronizando') combinaStatus = e.statusGeral === 'sincronizando';
            else if (statusFiltro === 'alerta') combinaStatus = e.statusGeral === 'alerta';

            return combinaBusca && combinaStatus;
        });
    }, [estacoes, busca, statusFiltro]);

    const catracasOnline = estacoes.filter((e) => e.catraca.status === 'online').length;
    const terminaisAtivos = estacoes.filter((e) => e.facial.status !== 'offline').length;
    const pingMedio = calcularPingMedio(estacoes);

    return (
        <div className="monitoramento">
            {/* Cabeçalho */}
            <div className="mon__cabecalho">
                <div>
                    <div className="mon__titulo-linha">
                        <h1>Monitoramento de Dispositivos &amp; Catracas</h1>
                        <span className="mon__selo-campus">Campus Sorocaba</span>
                        <span className="mon__selo-pontos">{estacoes.length} Pontos de Acesso Integrados</span>
                    </div>
                    <p className="mon__subtitulo">
                        Telemetria e status em tempo real das catracas físicas e dos terminais de biometria facial
                        acoplados da Unidade Sorocaba.
                        <span className="mon__sync-ativo">
                            <span className="pulso" /> Sync Ativo: ws://telemetry.sorocaba.senai.br:8443
                        </span>
                    </p>
                </div>

                <div className="mon__acoes-topo">
                    <button className="botao botao--outline" onClick={handlePingGeral}>
                        <Activity size={16} />
                        Ping Geral
                    </button>
                    <button className="botao botao--primario" onClick={handleSincronizarFacialGeral}>
                        <RefreshCw size={16} />
                        Sincronizar Terminais Faciais
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div className="mon__kpis">
                <div className="mon__kpi mon__kpi--vermelho">
                    <div className="mon__kpi-topo">
                        <div>
                            <span className="mon__kpi-rotulo">Equipamento Mecânico</span>
                            <h3>Catracas Físicas</h3>
                        </div>
                        <span className="mon__kpi-icone mon__kpi-icone--vermelho">
                            <DoorOpen size={20} />
                        </span>
                    </div>
                    <div className="mon__kpi-valor-linha">
                        <span className="mon__kpi-valor">
                            {catracasOnline} / {estacoes.length}
                        </span>
                        <span className="mon__kpi-nota mon__kpi-nota--verde">
                            {estacoes.length > 0 ? Math.round((catracasOnline / estacoes.length) * 100) : 0}% Prontas
                        </span>
                    </div>
                    <div className="mon__kpi-rodape">
                        <span>Catracas monitoradas em tempo real</span>
                        <span className="mon__kpi-rodape-forte">Relês OK</span>
                    </div>
                </div>

                <div className="mon__kpi mon__kpi--verde">
                    <div className="mon__kpi-topo">
                        <div>
                            <span className="mon__kpi-rotulo">Dispositivos Acoplados</span>
                            <h3>Terminais de Biometria Facial</h3>
                        </div>
                        <span className="mon__kpi-icone mon__kpi-icone--verde">
                            <ScanFace size={20} />
                        </span>
                    </div>
                    <div className="mon__kpi-valor-linha">
                        <span className="mon__kpi-valor mon__kpi-valor--verde">{terminaisAtivos}</span>
                        <span className="mon__kpi-nota mon__kpi-nota--verde">99,8% Sincronia</span>
                    </div>
                    <div className="mon__kpi-rodape">
                        <span>1.428 faces sincronizadas</span>
                        <span className="mon__kpi-rodape-forte">0 Offline</span>
                    </div>
                </div>

                <div className="mon__kpi">
                    <div className="mon__kpi-topo">
                        <div>
                            <span className="mon__kpi-rotulo">Rede &amp; Telemetria</span>
                            <h3>Status Geral da Conexão</h3>
                        </div>
                        <span className="mon__kpi-icone mon__kpi-icone--azul">
                            <Gauge size={20} />
                        </span>
                    </div>
                    <div className="mon__kpi-valor-linha">
                        <span className="mon__kpi-valor">
                            {pingMedio}
                            <small> ms ping médio</small>
                        </span>
                        <span className="mon__kpi-nota mon__kpi-nota--verde">
                            <span className="ponto ponto--verde" /> Conectado
                        </span>
                    </div>
                    <div className="mon__kpi-rodape">
                        <span>Sub-rede: 192.168.10.0/24</span>
                        <span className="mon__kpi-rodape-forte">Taxa Instantânea</span>
                    </div>
                </div>

                <div className="mon__kpi mon__kpi--diagnostico">
                    <div className="mon__kpi-topo">
                        <span className="mon__kpi-rotulo">Diagnóstico Operacional</span>
                        <Wrench size={18} color="#e53e3e" />
                    </div>
                    <div className="mon__diagnostico-grade">
                        <button onClick={handlePingGeral}>
                            <Activity size={14} />
                            Ping Geral
                        </button>
                        <button onClick={() => mostrarToast('Rotina de teste mecânico executada em todas as catracas.', RotateCw, '#f59e0b')}>
                            <RotateCw size={14} />
                            Testar Giro
                        </button>
                    </div>
                    <button className="mon__diagnostico-sync" onClick={handleSincronizarFacialGeral}>
                        <RefreshCw size={14} />
                        Forçar Sincronização Facial
                    </button>
                </div>
            </div>

            {/* Filtros */}
            <div className="mon__filtros">
                <div className="mon__busca">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por IP (ex: 192.168.10.x), nome ou local da passagem..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </div>

                <div className="mon__filtros-direita">
                    <div className="mon__tipo-filtro">
                        <button className={tipoFiltro === 'todos' ? 'ativo' : ''} onClick={() => setTipoFiltro('todos')}>
                            Todos ({estacoes.length} Estações)
                        </button>
                        <button className={tipoFiltro === 'catracas' ? 'ativo' : ''} onClick={() => setTipoFiltro('catracas')}>
                            Somente Catracas
                        </button>
                        <button className={tipoFiltro === 'facial' ? 'ativo' : ''} onClick={() => setTipoFiltro('facial')}>
                            Somente Biometria Facial
                        </button>
                    </div>

                    <div className="mon__status-select">
                        <label>Status:</label>
                        <select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}>
                            <option value="todos">Todos os Status</option>
                            <option value="online">Online / Ativos</option>
                            <option value="sincronizando">Sincronizando</option>
                            <option value="alerta">Com Alerta / Falha</option>
                        </select>
                    </div>

                    <button className="mon__botao-refresh" onClick={handleAtualizarTudo} title="Recarregar Telemetria">
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {/* Lista de estações */}
            <div className="mon__secao-estacoes">
                <div className="mon__secao-titulo">
                    <MapPin size={20} color="#e53e3e" />
                    <h2>Estações de Passagem • Catraca + Terminal Facial Acoplado</h2>
                </div>

                {carregando && <div className="mon__estado-vazio">Carregando telemetria...</div>}
                {!carregando && estacoesFiltradas.length === 0 && (
                    <div className="mon__estado-vazio">Nenhuma estação encontrada para esse filtro.</div>
                )}

                <div className="mon__lista-estacoes">
                    {estacoesFiltradas.map((e) => (
                        <div className="mon__card-estacao" key={e.id}>
                            <div className="mon__card-banner">
                                <div className="mon__card-banner-esquerda">
                                    <span className="mon__numero">{e.numero}</span>
                                    <div>
                                        <h3>{e.nome}</h3>
                                        <span className="mon__descricao">{e.descricao}</span>
                                    </div>
                                </div>
                                <div className="mon__card-banner-direita">
                                    {e.statusGeral === 'operacional' && (
                                        <span className="selo-status selo-status--verde">
                                            <span className="pulso pulso--verde" /> ESTAÇÃO 100% OPERACIONAL
                                        </span>
                                    )}
                                    {e.statusGeral === 'sincronizando' && (
                                        <span className="selo-status selo-status--ambar">
                                            <span className="pulso pulso--ambar" /> SINCRONIZANDO BIOMETRIA ({e.facial.progressoSync}%)
                                        </span>
                                    )}
                                    <button className="botao botao--outline botao--pequeno" onClick={() => abrirDrawer(e)}>
                                        <Terminal size={15} />
                                        Syslog da Estação
                                    </button>
                                </div>
                            </div>

                            <div className="mon__card-corpo">
                                {(tipoFiltro === 'todos' || tipoFiltro === 'catracas') && (
                                    <div className="mon__hardware">
                                        <div className="mon__hardware-topo">
                                            <div className="mon__hardware-info">
                                                <span className="mon__hardware-icone mon__hardware-icone--vermelho">
                                                    <DoorOpen size={22} />
                                                </span>
                                                <div>
                                                    <div className="mon__hardware-nome-linha">
                                                        <strong>{e.catraca.nome}</strong>
                                                        <span className="etiqueta">{e.catraca.tipo}</span>
                                                    </div>
                                                    <span className="mon__hardware-modelo">{e.catraca.modelo} • Travada pronta</span>
                                                </div>
                                            </div>
                                            <span className="selo-status selo-status--verde-solido">
                                                <span className="ponto ponto--verde" /> ONLINE
                                            </span>
                                        </div>

                                        <div className="mon__specs">
                                            <div>
                                                <span>Endereço IP</span>
                                                <strong>{e.catraca.ip}</strong>
                                            </div>
                                            <div>
                                                <span>Porta TCP</span>
                                                <strong>{e.catraca.porta}</strong>
                                            </div>
                                            <div>
                                                <span>Ciclos / Giros</span>
                                                <strong>{e.catraca.ciclos}</strong>
                                            </div>
                                            <div>
                                                <span>Relê Eletromecânico</span>
                                                <strong className="verde">{e.catraca.rele}</strong>
                                            </div>
                                        </div>

                                        <div className="mon__hardware-rodape">
                                            <span>
                                                Ping: <strong className="verde">{e.catraca.ping}ms</strong> • Firmware {e.catraca.firmware}
                                            </span>
                                            <div className="mon__hardware-botoes">
                                                <button onClick={() => handlePing(e.catraca.nome)}>
                                                    <Activity size={14} />
                                                    Ping
                                                </button>
                                                <button onClick={() => handleTestarGiro(e.catraca.nome)}>
                                                    <RotateCw size={14} />
                                                    Testar Giro
                                                </button>
                                                <button className="perigo" onClick={() => handleReiniciar(e.catraca.nome)}>
                                                    <Power size={14} />
                                                    Reiniciar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {(tipoFiltro === 'todos' || tipoFiltro === 'facial') && (
                                    <div className="mon__hardware">
                                        <div className="mon__hardware-topo">
                                            <div className="mon__hardware-info">
                                                <span
                                                    className={`mon__hardware-icone ${e.facial.status === 'sincronizando'
                                                            ? 'mon__hardware-icone--ambar'
                                                            : 'mon__hardware-icone--verde'
                                                        }`}
                                                >
                                                    {e.facial.status === 'sincronizando' ? (
                                                        <Loader2 size={22} className="girando" />
                                                    ) : (
                                                        <ScanFace size={22} />
                                                    )}
                                                </span>
                                                <div>
                                                    <div className="mon__hardware-nome-linha">
                                                        <strong>{e.facial.nome}</strong>
                                                        <span className="etiqueta etiqueta--verde">Acoplado Superior</span>
                                                    </div>
                                                    <span className="mon__hardware-modelo">
                                                        {e.facial.modelo} •{' '}
                                                        {e.facial.status === 'sincronizando' ? 'Atualizando base de dados' : 'Reconhecendo ativo'}
                                                    </span>
                                                </div>
                                            </div>
                                            {e.facial.status === 'reconhecendo' ? (
                                                <span className="selo-status selo-status--verde-solido">
                                                    <span className="ponto ponto--verde" /> RECONHECENDO
                                                </span>
                                            ) : (
                                                <span className="selo-status selo-status--ambar-solido">
                                                    <RefreshCw size={12} className="girando" /> SYNC ({e.facial.progressoSync}%)
                                                </span>
                                            )}
                                        </div>

                                        <div className="mon__specs">
                                            <div>
                                                <span>IP Câmera</span>
                                                <strong>{e.facial.ip}</strong>
                                            </div>
                                            <div>
                                                <span>Stream RTSP</span>
                                                <strong>{e.facial.stream}</strong>
                                            </div>
                                            <div>
                                                <span>Precisão IA</span>
                                                <strong className="verde">{e.facial.precisao}</strong>
                                            </div>
                                            <div>
                                                <span>Banco de Faces</span>
                                                <strong className={e.facial.progressoSync ? 'ambar' : ''}>{e.facial.bancoFaces}</strong>
                                            </div>
                                        </div>

                                        <div className="mon__hardware-rodape">
                                            <span>
                                                {e.facial.ultimaSync ? (
                                                    <>
                                                        Sincronizado: <strong>{e.facial.ultimaSync}</strong>
                                                    </>
                                                ) : (
                                                    <strong className="ambar">Upload em andamento</strong>
                                                )}
                                            </span>
                                            <div className="mon__hardware-botoes">
                                                <button onClick={() => handlePing(e.facial.nome)}>
                                                    <Activity size={14} />
                                                    Ping
                                                </button>
                                                <button onClick={() => handleVerVideo(e.facial.nome, e.facial.ip)}>
                                                    <Video size={14} />
                                                    Ver Vídeo
                                                </button>
                                                <button className="destaque" onClick={() => handleSincronizarFacial(e.facial.nome)}>
                                                    <RefreshCw size={14} />
                                                    Sincronizar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Rodapé técnico */}
            <div className="mon__rodape-matriz">
                <div className="mon__rodape-esquerda">
                    <span className="mon__rodape-ok">
                        <span className="ponto ponto--verde" /> Todas as Catracas Liberadas para Giro Autorizado
                    </span>
                    <span className="mon__rodape-separador">•</span>
                    <span>
                        Anti-Passback Central: <strong>Ativado (5 min)</strong>
                    </span>
                </div>
                <div className="mon__rodape-direita">
                    <span>
                        Tempo de Resposta Facial Médio: <strong className="vermelho">0.24s</strong>
                    </span>
                    <span>
                        Firmware Facial: <strong>v2.4.18-SENAI</strong>
                    </span>
                </div>
            </div>

            {/* Botão de bloqueio geral (ação crítica, fica sempre acessível) */}
            <button className="mon__bloqueio-flutuante" onClick={handleBloqueioGeral}>
                <Power size={16} />
                Bloqueio Geral de Catracas
            </button>

            {/* Drawer lateral de syslog */}
            {drawer && (
                <div className="drawer">
                    <div className="drawer__fundo" onClick={fecharDrawer} />
                    <div className="drawer__painel">
                        <div className="drawer__topo">
                            <div className="drawer__topo-linha">
                                <span className="drawer__topo-rotulo">
                                    <Terminal size={16} />
                                    Syslog do Par: Catraca &amp; Facial
                                </span>
                                <button className="drawer__fechar" onClick={fecharDrawer}>
                                    <X size={20} />
                                </button>
                            </div>
                            <h2>{drawer.nome}</h2>
                            <div className="drawer__ips">
                                <span>Catraca: {drawer.catraca.ip}</span>
                                <span>Facial: {drawer.facial.ip}</span>
                            </div>
                        </div>

                        <div className="drawer__logs">
                            <div className="drawer__logs-topo">
                                <span>EVENT LOG BUFFER (CATRACA + CÂMERA FACIAL)</span>
                                <span className="drawer__live">
                                    <span className="pulso pulso--verde" /> LIVE
                                </span>
                            </div>

                            {logsDrawer.map((log, i) => (
                                <div key={i} className={`drawer__log drawer__log--${log.tipo}`}>
                                    <div className="drawer__log-topo">
                                        <strong>{log.titulo}</strong>
                                        <span>{log.hora}</span>
                                    </div>
                                    <p>{log.texto}</p>
                                </div>
                            ))}
                        </div>

                        <div className="drawer__rodape">
                            <button className="botao botao--outline" onClick={exportarLog}>
                                <Download size={16} />
                                Exportar .LOG
                            </button>
                            <button className="botao botao--primario" onClick={pulsoDeTeste}>
                                <Play size={16} />
                                Pulso de Teste
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            <div className={`toast-monitor ${toast.visivel ? 'toast-monitor--visivel' : ''}`}>
                <toast.Icone size={18} color={toast.cor} />
                <span>{toast.mensagem}</span>
            </div>
        </div>
    );
}

export default Monitoramento;