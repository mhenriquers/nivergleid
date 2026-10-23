// Etapa 1: as fotos sobem uma a uma e se empilham no centro, e a etapa termina sozinha.
// Não tem botão de pular: quem decide o fim é o tempo configurado.
(function (DR30) {
  'use strict';

  const C = DR30.Config;
  const U = DR30.Utils;
  let mural = null;
  let fotos = [];
  let timers = [];
  let quadroPendente = 0;

  function iniciar(secao) {
    const A = C.ABERTURA;
    mural = secao.querySelector('[data-mural]');
    mural.textContent = '';
    const arquivos = U.ordenarAlfabetico(C.FOTOS.ARQUIVOS);
    const total = U.limitar(A.DURACAO_TOTAL_MS, A.DURACAO_MIN_MS, A.DURACAO_MAX_MS);
    // As entradas se espalham no tempo que sobra depois da última subida e da pausa final.
    const janela = Math.max(0, total - A.ATRASO_INICIAL_MS - A.ENTRADA_FOTO_MS - A.PAUSA_FINAL_MS);
    const intervalo = arquivos.length > 1 ? janela / (arquivos.length - 1) : 0;

    fotos = arquivos.map((arquivo, indice) => criarFoto(arquivo, indice, arquivos.length));
    distribuir();
    fotos.forEach((foto, indice) => {
      agendar(() => liberar(foto), A.ATRASO_INICIAL_MS + indice * intervalo);
    });
    window.addEventListener('resize', aoRedimensionar);
    agendar(() => DR30.App.concluir('abertura'), total);
  }

  function criarFoto(arquivo, indice, total) {
    const A = C.ABERTURA;
    const celula = document.createElement('div');
    celula.className = 'mural__celula';
    const moldura = document.createElement('figure');
    moldura.className = 'foto';
    // Deslocamento e rotação sorteados por foto, para a pilha parecer jogada à mão.
    const dx = U.aleatorio(-A.DESLOCAMENTO_MAX, A.DESLOCAMENTO_MAX) * 100;
    const dy = U.aleatorio(-A.DESLOCAMENTO_MAX, A.DESLOCAMENTO_MAX) * 100;
    const giro = U.aleatorio(-A.ROTACAO_MAX_GRAUS, A.ROTACAO_MAX_GRAUS);
    moldura.style.transform = 'translate(' + dx + '%, ' + dy + '%) rotate(' + giro + 'deg)';

    const imagem = document.createElement('img');
    imagem.className = 'foto__imagem';
    imagem.alt = U.formatar(C.TEXTOS.FOTO_ALT, { numero: indice + 1, total });
    imagem.setAttribute('loading', 'eager');
    imagem.setAttribute('decoding', 'async');

    const foto = { celula, pronta: false, naHora: false, descartada: false };
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

  // Todas as fotos têm o mesmo tamanho: a maior que cabe sozinha no centro da área.
  function distribuir() {
    quadroPendente = 0;
    if (!mural) return;
    const maior = U.melhorGrade(1, mural.clientWidth, mural.clientHeight, C.FOTOS.PROPORCAO_MOLDURA);
    const ocupacao = C.ABERTURA.OCUPACAO_AREA;
    mural.style.setProperty('--foto-largura', maior.largura * ocupacao + 'px');
    mural.style.setProperty('--foto-altura', maior.altura * ocupacao + 'px');
  }

  function aoRedimensionar() {
    if (!quadroPendente) quadroPendente = window.requestAnimationFrame(distribuir);
  }

  function agendar(funcao, atraso) {
    timers.push(window.setTimeout(funcao, atraso));
  }

  function encerrar() {
    timers.forEach((timer) => window.clearTimeout(timer));
    timers = [];
    window.removeEventListener('resize', aoRedimensionar);
    window.cancelAnimationFrame(quadroPendente);
    quadroPendente = 0;
    // Depois do fade de saída, solta as fotos da memória (pesa em celular antigo).
    const muralAntigo = mural;
    if (muralAntigo) window.setTimeout(() => { muralAntigo.textContent = ''; }, C.TROCA_ETAPA_MS);
    mural = null;
    fotos = [];
  }

  DR30.Abertura = { iniciar, encerrar };
})(window.DR30 = window.DR30 || {});
