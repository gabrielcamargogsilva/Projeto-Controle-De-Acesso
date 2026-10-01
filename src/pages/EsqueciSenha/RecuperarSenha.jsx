import { Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck, PhoneCall, Mail, ArrowLeft, Building2 } from 'lucide-react';
import './RecuperarSenha.css';

function RecuperarSenha() {
  return (
    <div className="recuperar">
      {/* Painel esquerdo — mesma identidade visual do login. Some no mobile. */}
      <div className="recuperar__painel">
        <div className="recuperar__marca">
          <img src="../src/assets/logo_senai.png" alt="Logo SENAI" className="recuperar__logo" />
        </div>

        <div className="recuperar__mensagem">
          <ShieldCheck size={36} className="recuperar__mensagem-icone" />
          <h1>Sistema Integrado de Controle de Acesso &amp; Portaria Segura</h1>
          <p>
            Por segurança, o acesso a este sistema é restrito e a recuperação de senha é feita
            de forma assistida pela equipe responsável.
          </p>
        </div>

        <span className="recuperar__rodape-painel">SENAI SP • Unidade Sorocaba</span>
      </div>

      {/* Painel direito — orientação */}
      <div className="recuperar__conteudo">
        <div className="recuperar__card">
          <span className="recuperar__logo recuperar__logo--mobile">
            <GraduationCap size={18} />
            SENAI
          </span>

          <div className="recuperar__icone-topo">
            <Building2 size={28} />
          </div>

          <h2>Recuperação de senha</h2>
          <p className="recuperar__texto">
            Este é um sistema de uso interno. Para preservar a segurança dos acessos, a
            redefinição de senha não é feita automaticamente pelo site — ela precisa ser
            solicitada diretamente à administração ou à secretaria da sua unidade.
          </p>

          <div className="recuperar__passos">
            <p className="recuperar__passos-titulo">Como recuperar sua senha:</p>
            <ol>
              <li>Procure a administração ou secretaria responsável pela sua unidade.</li>
              <li>Informe seu nome completo e matrícula (ou usuário de acesso).</li>
              <li>A equipe irá validar sua identidade e gerar uma nova senha para você.</li>
            </ol>
          </div>

          <div className="recuperar__contato">
            <a href="tel:+551533333333" className="recuperar__contato-item">
              <PhoneCall size={16} />
              <div>
                <strong>Telefone</strong>
                <span>(15) 3333-3333</span>
              </div>
            </a>
            <a href="mailto:secretaria@senaisorocaba.exemplo" className="recuperar__contato-item">
              <Mail size={16} />
              <div>
                <strong>E-mail</strong>
                <span>secretaria@senaisorocaba.exemplo</span>
              </div>
            </a>
          </div>

          <Link to="/" className="recuperar__voltar">
            <ArrowLeft size={16} />
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RecuperarSenha;