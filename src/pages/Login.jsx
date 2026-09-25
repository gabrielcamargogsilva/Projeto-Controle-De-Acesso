import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, LogIn, ShieldCheck } from 'lucide-react';
import { login } from '../services/authService';
import './Login.css';

function Login() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrar, setLembrar] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      await login(usuario, senha);
      navigate('/gestao');
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login">
      {/* Painel esquerdo — identidade/branding. Some no mobile. */}
      <div className="login__painel">
        <div className="login__marca">
          <img src="../src/assets/logo_senai.png" alt="Logo SENAI" className="login__logo" />
        </div>

        <div className="login__mensagem">
          <ShieldCheck size={36} className="login__mensagem-icone" />
          <h1>Sistema Integrado de Controle de Acesso &amp; Portaria Segura</h1>
          <p>
            Gerencie o acesso de pessoas, acompanhe registros de entrada e saída e monitore
            catracas e dispositivos em tempo real.
          </p>
        </div>

        <span className="login__rodape-painel">SENAI SP • Unidade Sorocaba</span>
      </div>

      {/* Painel direito — formulário */}
      <div className="login__conteudo">
        <form className="login__form" onSubmit={handleSubmit}>
          <img src="../src/assets/logo_senai.png" alt="Logo SENAI" className="login__logo login__logo--mobile" />

          <h2>Acesso Administrativo</h2>
          <p className="login__subtitulo">Entre com suas credenciais para continuar</p>

          {erro && <div className="login__erro">{erro}</div>}

          <label className="login__campo">
            <span>Usuário</span>
            <div className="login__input">
              <User size={16} />
              <input
                type="text"
                placeholder="Digite seu usuário"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </label>

          <label className="login__campo">
            <span>Senha</span>
            <div className="login__input">
              <Lock size={16} />
              <input
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="login__toggle-senha"
                onClick={() => setMostrarSenha((v) => !v)}
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <div className="login__opcoes">
            <label className="login__lembrar">
              <input
                type="checkbox"
                checked={lembrar}
                onChange={(e) => setLembrar(e.target.checked)}
              />
              Lembrar-me
            </label>
            <button type="button" className="login__esqueci" onClick={() => window.location.href = '/recuperarsenha'}>
              Esqueci minha senha
            </button>
          </div>

          <button type="submit" className="login__entrar" disabled={carregando}>
            {carregando ? (
              'Entrando...'
            ) : (
              <>
                <LogIn size={16} />
                Entrar
              </>
            )}
          </button>

          
        </form>
      </div>
    </div>
  );
}

export default Login;