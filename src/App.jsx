import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MenuNavegacao from './components/MenuNavegacao.jsx';
import Login from './pages/Login/Login.jsx';
import RecuperarSenha from './pages/EsqueciSenha/RecuperarSenha.jsx';
import GestaoPessoas from './pages/GestaoPessoas/GestaoPessoas.jsx';
import LogsAcesso from './pages/Logs/LogsAcesso.jsx';
import CadastroPessoas from './pages/CadastroPessoa/CadastroPessoas.jsx';
import Monitoramento from './pages/Monitoramento/Monitoramento.jsx';

// ==========================================
// GESTOR DE ROTAS
// ==========================================
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota raiz (Login) fora do menu */}
        <Route path="/" element={<Login />} />

        <Route path="/recuperarsenha" element={<RecuperarSenha />} />

        {/* Rotas envolvidas pelo MenuNavegacao */}
        <Route path="/gestao" element={
          <MenuNavegacao>
            <GestaoPessoas />
          </MenuNavegacao>
        } />
        
        <Route path="/logs" element={
          <MenuNavegacao>
            <LogsAcesso />
          </MenuNavegacao>
        } />

        <Route path="/monitoramento" element={
          <MenuNavegacao>
            <Monitoramento />
          </MenuNavegacao>
        } />

        <Route path="/pessoas/cadastro" element={
          <MenuNavegacao>
            <CadastroPessoas />
          </MenuNavegacao>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;