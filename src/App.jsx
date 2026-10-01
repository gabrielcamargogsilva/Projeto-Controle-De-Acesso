import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MenuNavegacao from './components/MenuNavegacao.jsx';
import Login from './pages/Login/Login.jsx';
import RecuperarSenha from './pages/EsqueciSenha/RecuperarSenha.jsx';
import GestaoPessoas from './pages/GestaoPessoas/GestaoPessoas.jsx';
// import CadastroPessoas from './pages/CadastroPessoas';

// ==========================================
// COMPONENTES PROVISÓRIOS (MOCKS)
// Criamos telas falsas apenas para testar a navegação visualmente
// ==========================================


const LogsMock = () => (
  <div style={{ padding: '40px', color: '#334155' }}>
    <h2>TELA TESTE: Logs de Entrada/Saída</h2>
    <p>Se o menu lateral estiver marcado a vermelho nesta opção, o useLocation está a funcionar.</p>
  </div>
);

const MonitoramentoMock = () => (
  <div style={{ padding: '40px', color: '#334155' }}>
    <h2>TELA TESTE: Monitoramento</h2>
    <p>Área de dispositivos e catracas simulada.</p>
  </div>
);


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
            <LogsMock />
          </MenuNavegacao>
        } />

        <Route path="/monitoramento" element={
          <MenuNavegacao>
            <MonitoramentoMock />
          </MenuNavegacao>
        } />

        <Route path="/cadastro" element={
          <MenuNavegacao>
          </MenuNavegacao>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;