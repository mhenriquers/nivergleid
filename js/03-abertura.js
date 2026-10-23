// Etapa 1: as fotos sobem uma a uma e se espalham pela tela como uma colagem,
// e a etapa termina sozinha. Não tem botão de pular: quem decide o fim é o tempo configurado.
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
    // As fotos entram em ordem alfabética, mas cada uma cai numa região sorteada da tela.
    U.embaralhar(fotos.map((foto, indice) => indice)).forEach((lugar, indice) => {
      fotos[indice].lugar = lugar;
    });
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
    // Giro e desvio sorteados uma vez por foto e guardados, para a tela poder girar sem embaralhar tudo.
    const foto = {
      celula,
      lugar: indice,
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

  // Divide a área em regiões (uma por foto) e põe cada foto perto do centro da sua,
  // com desvio e um pouco maior que a região, para formar uma colagem que cobre a tela toda.
  function distribuir() {
    quadroPendente = 0;
    if (!mural || !fotos.length) return;
    const A = C.ABERTURA;
    const largura = mural.clientWidth;
    const altura = mural.clientHeight;
    const grade = U.melhorGrade(fotos.length, largura, altura, C.FOTOS.PROPORCAO_MOLDURA);
    const larguraFoto = grade.largura * A.ESCALA_FOTO;
    const alturaFoto = grade.altura * A.ESCALA_FOTO;
    const regiaoX = largura / grade.colunas;
    const regiaoY = altura / grade.linhas;
    mural.style.setProperty('--foto-largura', larguraFoto + 'px');
    mural.style.setProperty('--foto-altura', alturaFoto + 'px');

    fotos.forEach((foto) => {
      const linha = Math.floor(foto.lugar / grade.colunas);
      const coluna = foto.lugar % grade.colunas;
      // Última linha incompleta fica centralizada, sem deixar um canto vazio.
      const naLinha = Math.min(grade.colunas, fotos.length - linha * grade.colunas);
      const recuo = ((grade.colunas - naLinha) * regiaoX) / 2;
      const centroX = recuo + (coluna + 1 / 2 + foto.desvioX) * regiaoX;
      const centroY = (linha + 1 / 2 + foto.desvioY) * regiaoY;
      // A foto girada inteira fica dentro da área.
      const caixa = U.caixaGirada(larguraFoto, alturaFoto, foto.giro);
      const x = U.limitar(centroX, caixa.largura / 2, largura - caixa.largura / 2);
      const y = U.limitar(centroY, caixa.altura / 2, altura - caixa.altura / 2);
      foto.celula.style.left = x - larguraFoto / 2 + 'px';
      foto.celula.style.top = y - alturaFoto / 2 + 'px';
    });
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
