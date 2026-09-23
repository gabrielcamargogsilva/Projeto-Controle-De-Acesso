import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importação das Telas e do Componente de Navegação
import Login from './pages/Login';
// import GestaoPessoas from './pages/GestaoPessoas';
// import CadastroPessoas from './pages/CadastroPessoas';
// Importa também as outras páginas que vais criar depois:
// import LogsAcesso from './pages/LogsAcesso';
// import Monitoramento from './pages/Monitoramento';

import MenuNavegacao from './components/MenuNavegacao';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* A tela de Login fica fora do Menu de Navegação */}
        <Route path="/" element={<Login />} />

        {/* As outras telas ficam embrulhadas (wrapped) pelo MenuNavegacao */}
        <Route path="/gestao" element={
          <MenuNavegacao>
            <GestaoPessoas />
          </MenuNavegacao>
        } />
        
        <Route path="/cadastro" element={
          <MenuNavegacao>
            <CadastroPessoas />
          </MenuNavegacao>
        } />

        {/* Quando as criares, adiciona as rotas para /logs e /monitoramento aqui, seguindo o mesmo padrão acima */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;