# 🛡️ Sistema de Controle de Acesso — Front-End

> **Projeto Integrador — SENAI**
> Interface web moderna e responsiva para gerenciamento e monitoramento de controle de acesso físico (catracas e estações com biometria facial).

---

## 📌 Sobre o Projeto

Este repositório contém o código-fonte da aplicação **Front-End** do **Sistema de Controle de Acesso**.

O sistema foi desenvolvido como uma Single Page Application (SPA) para proporcionar uma gestão centralizada, intuitiva e em tempo real de entradas e saídas em ambientes controlados (como escolas, empresas ou indústrias).

> [!IMPORTANT]
> **Arquitetura Front-End / Back-End:**
> A aplicação está preparada para integração com uma API Back-End em Java. Atualmente, os dados de pessoas, logs e dispositivos e a autenticação são simulados localmente; as chamadas HTTP dos serviços ainda precisam ser habilitadas quando a API estiver disponível.

---

## 🚀 Principais Funcionalidades

- **🔐 Autenticação e Segurança:**
  - Login administrativo com controle de sessão e token de autenticação.
  - Fluxo de recuperação de senha.
  - Menu de navegação com opções de liberação rápida de emergência e logout seguro.

- **👤 Gestão de Pessoas:**
  - Listagem completa de colaboradores, alunos e visitantes cadastrados.
  - Indicadores rápidos de status (liberados e bloqueados).
  - Bloqueio administrativo e liberação de acessos em um clique.
  - Busca rápida e filtros por status de permissão.
  - Visualização de índice de confiança da biometria facial.

- **📷 Cadastro de Pessoas com Detecção Facial:**
  - Cadastro de dados básicos com máscara e validação de CPF.
  - Captura de foto via **Webcam** em tempo real ou upload de arquivo de imagem.
  - **Inteligência Artificial no Navegador:** Detecção facial automática via **Google MediaPipe Vision**, garantindo enquadramento e validação de apenas um rosto por cadastro antes do envio ao servidor.

- **📜 Histórico e Auditoria de Acessos (Logs):**
  - Registro de acessos com data, horário, identificação da estação/catraca e direção (entrada/saída).
  - Status do acesso (liberado ou bloqueado/negado).
  - Filtros avançados por período (hoje, ontem, última semana ou intervalo personalizado), horário e busca textual.

- **🖥️ Monitoramento em Tempo Real de Catracas e Estações:**
  - Painel de telemetria das estações físicas e catracas cadastradas.
  - Monitoramento de status de conectividade (*Online*, *Offline*, *Alerta*, *Sincronizando*).
  - Ações operacionais remotas:
    - Envio de **Ping** para medição de latência da estação.
    - **Sincronização Facial** para envio de dados atualizados aos terminais.
    - **Teste de Giro** remoto de catraca.
    - **Reinicialização** de dispositivos.
    - **Bloqueio Geral de Emergência** de todas as estações.
  - Liberação manual imediata de catraca diretamente pela barra superior.

---

## 🛠️ Tecnologias Utilizadas

- **[React 19](https://react.dev/)**: Biblioteca principal para construção da interface declarativa em componentes.
- **[Vite](https://vite.dev/)**: Ferramenta de build e servidor de desenvolvimento ultrarrápido.
- **[React Router DOM](https://reactrouter.com/)**: Gerenciamento das rotas da aplicação (SPA).
- **[Axios](https://axios-http.com/)**: Cliente HTTP para comunicação e consumo da API Back-End em Java.
- **[Google MediaPipe Vision](https://developers.google.com/mediapipe/solutions/vision/face_detector)**: Modelos de visão computacional para detecção facial client-side.
- **[Lucide React](https://lucide.dev/)**: Biblioteca de ícones moderna e consistente.
- **CSS3 Nativo**: Estilização modularizada, temas visuais, animações e layout responsivo.

---

## 🔌 Integração planejada com o Back-End em Java

A configuração do cliente Axios está em `src/services/api.js`, mas os serviços ainda usam mocks e as chamadas HTTP estão comentadas. O login de demonstração aceita `admin` / `1234`; não use essas credenciais em produção.

Os endpoints previstos para a integração são:
| Recurso | Método HTTP | Descrição |
| :--- | :---: | :--- |
| `/auth/login` | `POST` | Autenticação e obtenção do token de acesso |
| `/pessoas` | `GET` | Listagem de pessoas cadastradas |
| `/pessoas` | `POST` | Cadastro de pessoa com dados e foto biométrica (multipart/form-data) |
| `/pessoas/{id}/status` | `PATCH` | Alteração de status (liberar/bloquear acesso) |
| `/logs-acesso` | `GET` | Consulta ao histórico e registros de auditoria de acessos |
| `/dispositivos/estacoes` | `GET` | Listagem e telemetria de catracas e terminais de reconhecimento |
| `/dispositivos/{id}/ping` | `POST` | Teste de conectividade com a catraca/estação |
| `/dispositivos/{id}/sincronizar-facial` | `POST` | Força sincronismo das faces cadastradas com o dispositivo |
| `/dispositivos/{id}/testar-giro` | `POST` | Acionamento de teste de giro do mecanismo da catraca |
| `/dispositivos/bloqueio-geral` | `POST` | Bloqueio emergencial de todos os pontos de acesso |

> **Nota para Desenvolvimento:**
> As camadas em `src/services/` usam dados simulados (*mocks*) para permitir o desenvolvimento da interface sem o Back-End. A URL configurada em `VITE_API_URL` só será utilizada quando as chamadas reais forem ativadas.

---

## 💻 Pré-requisitos

Antes de iniciar, certifique-se de ter instalado em sua máquina:
- **[Node.js](https://nodejs.org/)** (versão 18 ou superior recomendada)
- **[npm](https://www.npmjs.com/)** ou gerenciador de pacotes equivalente
- **Navegador moderno** com permissão para acesso à câmera (necessário para a captura biométrica via webcam)
- **API Back-End Java** em execução (opcional; necessária somente após habilitar a integração com dados reais)

---

## ⚙️ Instalação e Execução

1. **Clone o repositório:**
   ```bash
   git clone <url-do-repositorio-front-end>
   cd front-end-pi
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as Variáveis de Ambiente (opcional enquanto os mocks estiverem ativos):**
   Copie `.env.example` para `.env` na raiz do projeto e ajuste a URL base da API:
   ```env
   VITE_API_URL=http://localhost:8080
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Acesse no navegador:**
   Abra [http://localhost:5173](http://localhost:5173) (ou o endereço indicado no seu terminal).

---

## 📦 Scripts Disponíveis

No diretório do projeto, você pode executar:

- `npm run dev` — Inicia o servidor local de desenvolvimento com Hot Module Replacement (HMR).
- `npm run build` — Compila e otimiza a aplicação para produção na pasta `dist/`.
- `npm run preview` — Executa um servidor local para visualizar a versão de produção gerada pelo `build`.
- `npm run lint` — Executa o ESLint para verificar a padronização e boas práticas de código.

---

## 📂 Estrutura de Diretórios

```text
front-end-pi/
├── public/                 # Arquivos públicos estáticos
├── src/
│   ├── assets/             # Imagens, logotipos (ex: SENAI) e ícones estáticos
│   ├── components/         # Componentes compartilhados (TopBar, Sidebar, Modais)
│   ├── pages/              # Telas da aplicação
│   │   ├── Login/          # Tela de autenticação
│   │   ├── EsqueciSenha/   # Recuperação de acesso
│   │   ├── GestaoPessoas/  # Listagem e controle de status de usuários
│   │   ├── CadastroPessoa/ # Formulário com captura e validação facial (MediaPipe)
│   │   ├── Logs/           # Histórico e auditoria de passagens
│   │   └── Monitoramento/  # Telemetria e controle de catracas em tempo real
│   ├── services/           # Configuração do Axios (api.js), chamadas HTTP e Mocks
│   ├── App.jsx             # Definição e proteção de rotas
│   ├── index.css           # Variáveis globais de estilo e reset CSS
│   └── main.jsx            # Ponto de entrada da aplicação React
├── .env.example            # Modelo de configuração da API (o arquivo .env local não é versionado)
├── package.json            # Dependências e scripts do projeto
├── vite.config.js          # Configurações do Vite
└── README.md               # Documentação do projeto
```

---

## 👥 Integrantes do Grupo (Autores)

- **Ana Paula Maximo**
- **Gabriel Camargo Gonçalves Silva**
- **Pedro Vitor Ribeiro Silva**
- **Pietro Freire Rezende dos Santos**

---

## 🎓 Contexto Acadêmico

Projeto desenvolvido no âmbito do **Projeto Integrador (PI)** — 2º Semestre.
**Instituição:** SENAI
**Foco:** Solução integrada de hardware/software para segurança patrimonial e controle de fluxo predial.
