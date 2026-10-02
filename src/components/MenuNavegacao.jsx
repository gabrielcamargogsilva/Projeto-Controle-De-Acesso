import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  KeyRound,
  Users,
  Clock,
  Radio,
  Ban,
  HelpCircle,
  LogOut,
  GraduationCap,
  Menu,
  X,

} from 'lucide-react';
import { estacoesMock } from '../services/EstacoesMock.js';
import './MenuNavegacao.css';

function MenuNavegacao({ children }) {
  const location = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [catracaSelecionada, setCatracaSelecionada] = useState('');
  const [toast, setToast] = useState({ visivel: false, mensagem: '' });
  const toastTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const catracasDisponiveis = estacoesMock.map((estacao) => ({
    id: estacao.id,
    nome: estacao.catraca.nome,
    local: estacao.nome,
  }));

  const isActive = (path) => location.pathname === path;

  function irPara() {
    // fecha a sidebar ao navegar (relevante no mobile)
    setMenuAberto(false);
  }

  function abrirModalLiberacao() {
    setCatracaSelecionada(catracasDisponiveis[0]?.nome ?? '');
    setModalAberto(true);
  }

  function confirmarLiberacao() {
    if (!catracaSelecionada) return;

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({
      visivel: true,
      mensagem: `Acesso liberado para ${catracaSelecionada}.`,
    });

    setModalAberto(false);
    setCatracaSelecionada('');

    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visivel: false }));
    }, 3000);
  }

  return (
    <div className="layout">
      {/* ========================================== */}
      {/* BARRA SUPERIOR (TOP BAR)                    */}
      {/* ========================================== */}
      <header className="topbar">
        <div className="topbar__esquerda">
          <button
            className="topbar__hamburguer"
            onClick={() => setMenuAberto((v) => !v)}
            aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
          >
            {menuAberto ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div className="topbar__marca">
            <img src="../src/assets/logo_senai.png" alt="Logo SENAI" className="topbar__logo" />
            <div className="topbar__titulo">
              <h1>Controle de Acesso</h1>
              <span>Portaria Segura • Sorocaba</span>
            </div>
          </div>
        </div>

        <div className="topbar__centro">
          <div className="topbar__status">
            <span className="topbar__status-ponto" /> Rede Online (SP-01)
          </div>
        </div>

        <div className="topbar__direita">
          <button type="button" className="topbar__acao" onClick={abrirModalLiberacao}>
            <KeyRound size={16} />
            <span>Liberar Catraca</span>
          </button>
          <div className="topbar__perfil">
            <strong>Usuário</strong>
            <span>
              Operador de Portaria • <span className="destaque">SENAI SP</span>
            </span>
          </div>
          <div className="topbar__avatar" />
        </div>
      </header>

      {/* ========================================== */}
      {/* ÁREA INFERIOR (MENU LATERAL + CONTEÚDO)     */}
      {/* ========================================== */}
      <div className="corpo">
        {menuAberto && <div className="overlay" onClick={() => setMenuAberto(false)} />}

        {modalAberto && (
          <div className="modal__overlay" onClick={() => setModalAberto(false)}>
            <div
              className="modal__container"
              role="dialog"
              aria-modal="true"
              aria-labelledby="titulo-liberar-catraca"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="modal__header">
                <div>
                  <span className="modal__eyebrow">Acesso manual</span>
                  <h2 id="titulo-liberar-catraca">Liberar catraca</h2>
                </div>
                <button
                  type="button"
                  className="modal__fechar"
                  onClick={() => setModalAberto(false)}
                  aria-label="Fechar modal"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="modal__descricao">
                Selecione a catraca que será liberada manualmente para passagem autorizada.
              </p>

              <div className="modal__lista">
                {catracasDisponiveis.map((catraca) => (
                  <button
                    key={catraca.id}
                    type="button"
                    className={`modal__item ${catracaSelecionada === catraca.nome ? 'modal__item--ativo' : ''}`}
                    onClick={() => setCatracaSelecionada(catraca.nome)}
                  >
                    <div className="modal__item-texto">
                      <strong>{catraca.nome}</strong>
                      <span>{catraca.local}</span>
                    </div>
                    {catracaSelecionada === catraca.nome && <span className="modal__check">✓</span>}
                  </button>
                ))}
              </div>

              <div className="modal__acoes">
                <button type="button" className="modal__cancelar" onClick={() => setModalAberto(false)}>
                  Cancelar
                </button>
                <button type="button" className="modal__confirmar" onClick={confirmarLiberacao} disabled={!catracaSelecionada}>
                  Liberar acesso
                </button>
              </div>
            </div>
          </div>
        )}

        {toast.visivel && (
          <div className="menu-toast menu-toast--visivel" role="status" aria-live="polite">
            <span className="menu-toast__ponto" />
            {toast.mensagem}
          </div>
        )}

        <aside className={`sidebar ${menuAberto ? 'sidebar--aberta' : ''}`}>
          <div className="sidebar__unidade">
            <span className="sidebar__unidade-icone">
              <GraduationCap size={20} color="white" />
            </span>
            <div>
              <strong>SENAI SP - Operação</strong>
              <span>Unidade Sorocaba</span>
            </div>
          </div>

          <nav className="sidebar__nav">
            <Link
              to="/gestao"
              onClick={irPara}
              className={`sidebar__link ${isActive('/gestao') ? 'sidebar__link--ativo' : ''}`}
            >
              <Users size={18} />
              Pessoas Cadastradas
            </Link>

            <Link
              to="/logs"
              onClick={irPara}
              className={`sidebar__link ${isActive('/logs') ? 'sidebar__link--ativo' : ''}`}
            >
              <Clock size={18} />
              Logs de Entrada/Saída
            </Link>

            <Link
              to="/monitoramento"
              onClick={irPara}
              className={`sidebar__link ${isActive('/monitoramento') ? 'sidebar__link--ativo' : ''}`}
            >
              <Radio size={18} />
              Dispositivos & Catracas
            </Link>
          </nav>

          <div className="sidebar__rodape">
            <button className="sidebar__bloqueio">
              <Ban size={16} />
              Bloqueio Geral Catracas
            </button>
            <button className="sidebar__suporte">
              <HelpCircle size={16} />
              Suporte Técnico SENAI
            </button>
            <Link to="/" className="sidebar__sair">
              <LogOut size={16} />
              Encerrar Sessão
            </Link>
          </div>
        </aside>

        <main className="conteudo">{children}</main>
      </div>
    </div>
  );
}

export default MenuNavegacao;