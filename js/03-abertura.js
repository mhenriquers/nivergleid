// Etapa 1: as fotos sobem uma a uma e se espalham pela tela como uma colagem.
// Sozinha, cada foto espera o tempo de leitura; um toque traz a próxima antes da hora
// e, depois da última, leva direto para as notas.
(function (DR30) {
  'use strict';

  const C = DR30.Config;
  const U = DR30.Utils;
  const TECLAS = ['Enter', ' ', 'Spacebar', 'ArrowRight'];
  // Celular sem Pointer Events (iOS antigo) cai no touchstart, que também não espera o "click".
  const EVENTO_TOQUE = window.PointerEvent ? 'pointerdown' : 'touchstart';
  let secao = null;
  let mural = null;
  let fotos = [];
  let proxima = 0; // índice da próxima foto a subir
  let timerProxima = 0;
  let ultimoToque = -Infinity;
  let quadroPendente = 0;
  let area = null; // grade e tamanho máximo de foto calculados para a tela atual

  function iniciar(elemento) {
    secao = elemento;
    mural = secao.querySelector('[data-mural]');
    mural.textContent = '';
    const arquivos = U.ordenarAlfabetico(C.FOTOS.ARQUIVOS);
    fotos = arquivos.map((arquivo, indice) => criarFoto(arquivo, indice, arquivos.length));
    // As fotos entram em ordem alfabética, mas cada uma cai numa região sorteada da tela.
    U.embaralhar(fotos.map((foto, indice) => indice)).forEach((lugar, indice) => {
      fotos[indice].lugar = lugar;
    });
    proxima = 0;
    distribuir();
    secao.addEventListener(EVENTO_TOQUE, aoTocar);
    document.addEventListener('keydown', aoTeclar);
    window.addEventListener('resize', aoRedimensionar);
    agendarProxima(C.ABERTURA.ATRASO_INICIAL_MS);
  }

  function agendarProxima(atraso) {
    window.clearTimeout(timerProxima);
    timerProxima = window.setTimeout(avancar, atraso);
  }

  // Sobe a próxima foto e marca a vez da seguinte; depois da última, passa para as notas.
  function avancar() {
    const A = C.ABERTURA;
    if (proxima >= fotos.length) {
      DR30.App.concluir('abertura');
      return;
    }
    liberar(fotos[proxima]);
    proxima += 1;
    const ultima = proxima === fotos.length;
    agendarProxima(ultima ? A.ENTRADA_FOTO_MS + A.PAUSA_FINAL_MS : A.TEMPO_POR_FOTO_MS);
  }

  function aoTocar(evento) {
    if (evento.pointerType === 'mouse' && evento.button !== 0) return;
    adiantar();
  }

  // Teclado ajuda no notebook ligado na TV: espaço, enter ou seta para a direita.
  function aoTeclar(evento) {
    const alvo = evento.target;
    const emControle = alvo && alvo.closest && alvo.closest('button, input, a');
    if (evento.repeat || emControle || TECLAS.indexOf(evento.key) === -1) return;
    evento.preventDefault();
    adiantar();
  }

  // A trava impede que um toque só (ou dois dedos juntos) pule duas fotos de uma vez.
  function adiantar() {
    const agora = window.performance.now();
    if (agora - ultimoToque < C.ABERTURA.TRAVA_TOQUE_MS) return;
    ultimoToque = agora;
    avancar();
  }

  function criarFoto(arquivo, indice, total) {
    const A = C.ABERTURA;
    const celula = document.createElement('div');
    celula.className = 'mural__celula';
    const moldura = document.createElement('figure');
    moldura.className = 'foto';
    // Giro e desvio sorteados uma vez por foto e guardados, para a tela poder girar sem embaralhar tudo.
    const foto = {
      celula,
      lugar: indice,
      proporcao: C.FOTOS.PROPORCAO_PADRAO,
      giro: (indice % 2 ? -1 : 1) * U.aleatorio(A.ROTACAO_MIN_GRAUS, A.ROTACAO_MAX_GRAUS),
      desvioX: U.aleatorio(-A.DESVIO_MAX, A.DESVIO_MAX),
      desvioY: U.aleatorio(-A.DESVIO_MAX, A.DESVIO_MAX),
      pronta: false,
      naHora: false,
      descartada: false
    };
    moldura.style.transform = 'rotate(' + foto.giro + 'deg)';

    const imagem = document.createElement('img');
    imagem.className = 'foto__imagem';
    imagem.alt = U.formatar(C.TEXTOS.FOTO_ALT, { numero: indice + 1, total });
    imagem.setAttribute('loading', 'eager');
    imagem.setAttribute('decoding', 'async');
    imagem.addEventListener('load', () => aoCarregar(foto, imagem));
    imagem.addEventListener('error', () => descartar(foto));
    imagem.src = C.FOTOS.PASTA + encodeURIComponent(arquivo);

    moldura.appendChild(imagem);
    celula.appendChild(moldura);
    mural.appendChild(celula);
    return foto;
  }

  function aoCarregar(foto, imagem) {
    if (!imagem.naturalWidth) {
      descartar(foto);
      return;
    }
    // O navegador já devolve o tamanho com a orientação da foto aplicada (deitada ou em pé).
    foto.proporcao = imagem.naturalWidth / imagem.naturalHeight;
    if (area) DR30.AberturaColagem.posicionar(area, foto);
    const marcarPronta = () => {
      foto.pronta = true;
      mostrarSePuder(foto);
    };
    // decode() evita engasgo no meio da subida; se recusar, a foto já carregou e segue assim.
    if (imagem.decode) imagem.decode().then(marcarPronta, marcarPronta);
    else marcarPronta();
  }

  function liberar(foto) {
    foto.naHora = true;
    mostrarSePuder(foto);
  }

  // A foto só sobe quando chegou a vez dela e já carregou; se atrasar, sobe assim que chegar.
  function mostrarSePuder(foto) {
    if (mural && foto.pronta && foto.naHora && !foto.descartada) {
      foto.celula.classList.add('mural__celula--visivel');
    }
  }

  // Foto quebrada fica fora sem empurrar as outras e sem travar a sequência.
  function descartar(foto) {
    foto.descartada = true;
    foto.celula.classList.add('mural__celula--vazia');
  }

  // Tamanho e posição de cada foto vêm do 03-abertura-colagem.js.
  function distribuir() {
    quadroPendente = 0;
    if (!mural || !fotos.length) return;
    area = DR30.AberturaColagem.medir(mural, fotos.length);
    fotos.forEach((foto) => DR30.AberturaColagem.posicionar(area, foto));
  }

  function aoRedimensionar() {
    if (!quadroPendente) quadroPendente = window.requestAnimationFrame(distribuir);
  }

  function encerrar() {
    window.clearTimeout(timerProxima);
    if (secao) secao.removeEventListener(EVENTO_TOQUE, aoTocar);
    document.removeEventListener('keydown', aoTeclar);
    window.removeEventListener('resize', aoRedimensionar);
    window.cancelAnimationFrame(quadroPendente);
    quadroPendente = 0;
    // Depois do fade de saída, solta as fotos da memória (pesa em celular antigo).
    const muralAntigo = mural;
    if (muralAntigo) window.setTimeout(() => { muralAntigo.textContent = ''; }, C.TROCA_ETAPA_MS);
    mural = null;
    fotos = [];
    area = null;
  }

  DR30.Abertura = { iniciar, encerrar };
})(window.DR30 = window.DR30 || {});
