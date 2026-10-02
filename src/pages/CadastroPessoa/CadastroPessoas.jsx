import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';
import {
  Home,
  ChevronRight,
  ArrowLeft,
  Save,
  User,
  IdCard,
  ImagePlus,
  Camera,
  CheckCircle2,
  X,
  CheckCircle,
} from 'lucide-react';
import { cadastrarPessoa } from '../../services/PessoasService';
import '../CadastroPessoa/CadastroPessoas.css';

const TIPOS_ACEITOS = ['image/jpeg', 'image/jpg'];
const TAMANHO_MAXIMO_MB = 5;

function calcularMolduraRosto(deteccao, larguraImagem, alturaImagem) {
  const caixa = deteccao?.boundingBox;
  if (!caixa || !larguraImagem || !alturaImagem) return null;

  const lado = Math.min(Math.max(caixa.width, caixa.height) * 1.8, larguraImagem, alturaImagem);
  const centroX = caixa.originX + caixa.width / 2;
  const centroY = caixa.originY + caixa.height / 2;
  const x = Math.min(Math.max(centroX - lado / 2, 0), larguraImagem - lado);
  const y = Math.min(Math.max(centroY - lado / 2, 0), alturaImagem - lado);

  return { x, y, lado, larguraImagem, alturaImagem };
}

function formatarCpf(valor) {
  const digitos = valor.replace(/\D/g, '').slice(0, 11);
  return digitos
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function CadastroPessoas() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const processandoUploadRef = useRef(false);
  const quantidadeRostosRef = useRef(null);

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [foto, setFoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [erroFoto, setErroFoto] = useState('');
  const [erroCamera, setErroCamera] = useState('');
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mostrarToast, setMostrarToast] = useState(false);
  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [detectorPronto, setDetectorPronto] = useState(false);
  const [erroDetector, setErroDetector] = useState('');
  const [quantidadeRostos, setQuantidadeRostos] = useState(null);
  const [molduraRosto, setMolduraRosto] = useState(null);
  const [proporcaoCamera, setProporcaoCamera] = useState(4 / 3);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    let montado = true;

    async function inicializarDetector() {
      try {
        const arquivosWasm = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm'
        );
        const detector = await FaceDetector.createFromOptions(arquivosWasm, {
          baseOptions: { modelAssetPath: '/mediapipe/blaze_face_short_range.tflite' },
          runningMode: 'VIDEO',
          minDetectionConfidence: 0.65,
        });

        if (!montado) {
          detector.close();
          return;
        }

        detectorRef.current = detector;
        setDetectorPronto(true);
      } catch (error) {
        console.error(error);
        if (montado) setErroDetector('Não foi possível carregar a identificação facial.');
      }
    }

    inicializarDetector();

    return () => {
      montado = false;
      detectorRef.current?.close();
      detectorRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!cameraAtiva || !videoRef.current || !streamRef.current) return;

    const video = videoRef.current;
    const stream = streamRef.current;
    video.srcObject = stream;
    video.play().catch((error) => {
      console.error(error);
      setErroCamera('A câmera foi liberada, mas não foi possível iniciar o vídeo. Tente novamente.');
    });

    return () => {
      if (video.srcObject === stream) video.srcObject = null;
    };
  }, [cameraAtiva]);

  useEffect(() => {
    if (!cameraAtiva || !detectorPronto) return;

    let frameId;
    let ultimaAnalise = 0;
    let falhou = false;

    function analisarQuadro(tempo) {
      frameId = requestAnimationFrame(analisarQuadro);
      const video = videoRef.current;

      if (
        !video ||
        video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
        processandoUploadRef.current ||
        tempo - ultimaAnalise < 180
      ) return;

      ultimaAnalise = tempo;

      try {
        const deteccoes = detectorRef.current.detectForVideo(video, tempo).detections;
        const total = deteccoes.length;
        setMolduraRosto(total === 1
          ? calcularMolduraRosto(deteccoes[0], video.videoWidth, video.videoHeight)
          : null);

        if (quantidadeRostosRef.current !== total) {
          quantidadeRostosRef.current = total;
          setQuantidadeRostos(total);
        }
      } catch (error) {
        console.error(error);
        if (!falhou) setErroCamera('Não foi possível analisar a imagem da câmera.');
        setMolduraRosto(null);
        falhou = true;
      }
    }

    frameId = requestAnimationFrame(analisarQuadro);
    return () => cancelAnimationFrame(frameId);
  }, [cameraAtiva, detectorPronto]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  function pararCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    quantidadeRostosRef.current = null;
    setQuantidadeRostos(null);
    setMolduraRosto(null);
    setCameraAtiva(false);
  }

  function atualizarFotoArquivo(arquivo) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setErroFoto('');
    setFoto(arquivo);
    setPreviewUrl(URL.createObjectURL(arquivo));
    pararCamera();
  }

  async function abrirCamera() {
    if (!detectorPronto) {
      setErroCamera(erroDetector || 'A identificação facial ainda está carregando.');
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErroCamera('Este navegador não suporta acesso à câmera. Tente enviar uma imagem do arquivo.');
      return;
    }

    setErroCamera('');
    quantidadeRostosRef.current = null;
    setQuantidadeRostos(null);
    setMolduraRosto(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });

      streamRef.current = stream;
      setCameraAtiva(true);
    } catch (error) {
      console.error(error);
      setErroCamera('Não foi possível acessar a câmera. Verifique a permissão e tente novamente.');
    }
  }

  async function capturarFoto() {
    if (!videoRef.current) return;

    const video = videoRef.current;
    if (!detectorRef.current || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;

    const deteccoes = detectorRef.current.detectForVideo(video, performance.now()).detections;
    const total = deteccoes.length;
    quantidadeRostosRef.current = total;
    setQuantidadeRostos(total);
    const moldura = total === 1
      ? calcularMolduraRosto(deteccoes[0], video.videoWidth, video.videoHeight)
      : null;
    setMolduraRosto(moldura);

    if (total !== 1 || !moldura) {
      setErroCamera(total === 0
        ? 'Nenhum rosto detectado. Posicione uma pessoa diante da câmera.'
        : `Foram detectados ${total} rostos. Deixe apenas uma pessoa na imagem.`);
      return;
    }

    setErroCamera('');
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(moldura.lado);
    canvas.height = Math.round(moldura.lado);

    const contexto = canvas.getContext('2d');
    if (!contexto || !canvas.width || !canvas.height) {
      setErroCamera('Não foi possível capturar a imagem. Tente novamente.');
      return;
    }
    contexto.drawImage(
      video,
      moldura.x,
      moldura.y,
      moldura.lado,
      moldura.lado,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setErroCamera('Não foi possível capturar a imagem. Tente novamente.');
          return;
        }

        const arquivo = new File([blob], 'foto-capturada.jpg', { type: 'image/jpeg' });
        atualizarFotoArquivo(arquivo);
      },
      'image/jpeg',
      0.92
    );
  }

  async function handleSelecionarFoto(e) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    if (!TIPOS_ACEITOS.includes(arquivo.type)) {
      setErroFoto('Formato inválido. Envie um arquivo .jpg ou .jpeg.');
      setFoto(null);
      setPreviewUrl(null);
      return;
    }

    if (arquivo.size > TAMANHO_MAXIMO_MB * 1024 * 1024) {
      setErroFoto(`Arquivo muito grande. O limite é ${TAMANHO_MAXIMO_MB}MB.`);
      setFoto(null);
      setPreviewUrl(null);
      return;
    }

    if (!detectorPronto || !detectorRef.current) {
      setErroFoto(erroDetector || 'A identificação facial ainda está carregando. Tente novamente em instantes.');
      return;
    }

    let imagem;
    processandoUploadRef.current = true;

    try {
      imagem = await createImageBitmap(arquivo);
      const detector = detectorRef.current;
      await detector.setOptions({ runningMode: 'IMAGE' });
      const total = detector.detect(imagem).detections.length;

      if (total !== 1) {
        setErroFoto(total === 0
          ? 'Nenhum rosto detectado. Escolha uma imagem com um rosto visível.'
          : `Foram detectados ${total} rostos. A imagem deve conter apenas uma pessoa.`);
        return;
      }

      atualizarFotoArquivo(arquivo);
    } catch (error) {
      console.error(error);
      setErroFoto('Não foi possível analisar a imagem. Escolha outro arquivo e tente novamente.');
    } finally {
      imagem?.close();
      await detectorRef.current?.setOptions({ runningMode: 'VIDEO' });
      processandoUploadRef.current = false;
    }
  }

  function removerFoto() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setFoto(null);
    setPreviewUrl(null);
    setErroFoto('');
    setErroCamera('');
    pararCamera();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErroGeral('');

    if (!nome.trim() || !cpf.trim() || !foto) {
      setErroGeral('Preencha o nome, o CPF e selecione uma foto antes de salvar.');
      return;
    }

    const formData = new FormData();
    formData.append('nome', nome.trim());
    formData.append('cpf', cpf);
    formData.append('foto', foto); // enviado como multipart/form-data (MultipartFile no Java)

    setEnviando(true);
    try {
      await cadastrarPessoa(formData);
      setMostrarToast(true);
      setTimeout(() => navigate('/gestao'), 1400);
    } catch (error) {
      console.error(error);
      setErroGeral('Não foi possível salvar o cadastro. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="cadastro">
        {/* Breadcrumb */}
        <nav className="cadastro__breadcrumb">
          <Home size={14} />
          <Link to="/">Início</Link>
          <ChevronRight size={14} />
          <Link to="/gestao">Pessoas Cadastradas</Link>
          <ChevronRight size={14} />
          <strong>Novo Cadastro</strong>
        </nav>

        {/* Cabeçalho */}
        <div className="cadastro__cabecalho">
          <div>
            <span className="cadastro__selo">Módulo Acadêmico &amp; Operacional • SENAI Sorocaba</span>
            <h1>Cadastrar Nova Pessoa Autorizada</h1>
            <p>Habilitação de acesso físico e controle biométrico integrado às catracas da unidade.</p>
          </div>
          <Link to="/gestao" className="botao botao--outline">
            <ArrowLeft size={16} />
            Voltar para Lista
          </Link>
        </div>

        {/* Formulário */}
        <form className="cadastro__card" onSubmit={handleSubmit}>
          {/* 1. Foto */}
          <section className="cadastro__secao">
            <div className="cadastro__secao-titulo">
              <ImagePlus size={18} />
              <h2>1. Foto de Identificação</h2>
            </div>

            <div className="cadastro__foto-area">
              <div className="cadastro__foto-preview">
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Pré-visualização da foto selecionada" />
                    <span className="cadastro__foto-check">
                      <CheckCircle2 size={14} />
                    </span>
                  </>
                ) : (
                  <ImagePlus size={28} className="cadastro__foto-placeholder-icone" />
                )}
              </div>

              <div className="cadastro__foto-controles">
                <h3>Upload da foto (.jpg ou .jpeg)</h3>
                <p>
                  Envie uma foto nítida, de rosto, com fundo neutro — ela será usada para
                  identificação na portaria.
                </p>

                <div className="cadastro__foto-botoes">
                  <label className="botao botao--outline cadastro__botao-upload">
                    <ImagePlus size={16} />
                    {foto ? 'Trocar foto' : 'Selecionar foto'}
                    <input
                      type="file"
                      accept=".jpg,.jpeg,image/jpeg"
                      capture="environment"
                      onChange={handleSelecionarFoto}
                      hidden
                    />
                  </label>

                  <button
                    type="button"
                    className="botao botao--outline"
                    onClick={cameraAtiva ? capturarFoto : abrirCamera}
                    disabled={cameraAtiva ? quantidadeRostos !== 1 || !detectorPronto : !detectorPronto}
                  >
                    <Camera size={16} />
                    {cameraAtiva ? 'Capturar agora' : detectorPronto ? 'Usar câmera' : 'Carregando detector...'}
                  </button>

                  {foto && (
                    <button type="button" className="cadastro__remover-foto" onClick={removerFoto}>
                      <X size={14} />
                      Remover
                    </button>
                  )}
                </div>

                {cameraAtiva && (
                  <div className="cadastro__camera">
                    <div className="cadastro__camera-visual" style={{ aspectRatio: proporcaoCamera }}>
                      <video
                        ref={videoRef}
                        className="cadastro__camera-video"
                        autoPlay
                        muted
                        playsInline
                        onLoadedMetadata={(evento) => {
                          const video = evento.currentTarget;
                          if (video.videoHeight) {
                            setProporcaoCamera(video.videoWidth / video.videoHeight);
                          }
                        }}
                      />
                      {molduraRosto && (
                        <div
                          className="cadastro__camera-moldura"
                          aria-hidden="true"
                          style={{
                            left: `${(molduraRosto.x / molduraRosto.larguraImagem) * 100}%`,
                            top: `${(molduraRosto.y / molduraRosto.alturaImagem) * 100}%`,
                            width: `${(molduraRosto.lado / molduraRosto.larguraImagem) * 100}%`,
                            height: `${(molduraRosto.lado / molduraRosto.alturaImagem) * 100}%`,
                          }}
                        />
                      )}
                    </div>
                    <span className={`cadastro__rostos ${quantidadeRostos === 1 ? 'cadastro__rostos--valido' : ''}`}>
                      {quantidadeRostos === null
                        ? 'Analisando imagem...'
                        : quantidadeRostos === 1
                          ? '1 rosto detectado'
                          : `${quantidadeRostos} rostos detectados. Deixe somente um na imagem.`}
                    </span>
                    <div className="cadastro__camera-botoes">
                      <button
                        type="button"
                        className="botao botao--primario"
                        onClick={capturarFoto}
                        disabled={quantidadeRostos !== 1 || !detectorPronto}
                      >
                        <Camera size={16} />
                        Tirar foto
                      </button>
                      <button type="button" className="botao botao--outline" onClick={pararCamera}>
                        Fechar câmera
                      </button>
                    </div>
                  </div>
                )}

                {erroCamera && <span className="cadastro__erro-campo">{erroCamera}</span>}

                {erroFoto && <span className="cadastro__erro-campo">{erroFoto}</span>}
                {foto && !erroFoto && (
                  <span className="cadastro__foto-nome">{foto.name}</span>
                )}
              </div>
            </div>
          </section>

          {/* 2. Identificação */}
          <section className="cadastro__secao">
            <div className="cadastro__secao-titulo">
              <User size={18} />
              <h2>2. Identificação Básica</h2>
            </div>

            <div className="cadastro__grade">
              <label className="cadastro__campo">
                <span>
                  Nome Completo <strong className="obrigatorio">*</strong>
                </span>
                <div className="cadastro__input">
                  <User size={16} />
                  <input
                    type="text"
                    placeholder="Ex: Matheus Henrique de Souza Santos"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </div>
                <small>Insira o nome completo sem abreviações.</small>
              </label>

              <label className="cadastro__campo">
                <span>
                  CPF <strong className="obrigatorio">*</strong>
                </span>
                <div className="cadastro__input">
                  <IdCard size={16} />
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(formatarCpf(e.target.value))}
                    inputMode="numeric"
                    maxLength={14}
                    required
                  />
                </div>
                <small>Formatação automática (11 dígitos).</small>
              </label>
            </div>
          </section>

          {erroGeral && <div className="cadastro__erro-geral">{erroGeral}</div>}

          {/* Ações */}
          <div className="cadastro__acoes">
            <Link to="/gestao" className="botao botao--outline">
              Cancelar / Voltar
            </Link>
            <button type="submit" className="botao botao--primario" disabled={enviando}>
              <Save size={16} />
              {enviando ? 'Salvando...' : 'Salvar e Ativar Acesso'}
            </button>
          </div>
        </form>

      {/* Toast de sucesso */}
      <div className={`toast ${mostrarToast ? 'toast--visivel' : ''}`}>
        <CheckCircle size={20} className="toast__icone" />
        <div>
          <strong>Cadastro salvo com sucesso!</strong>
          <span>A pessoa já pode ser localizada em "Pessoas Cadastradas".</span>
        </div>
      </div>
    </div>
  );
}

export default CadastroPessoas;