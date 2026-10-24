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
  let area = null; // grade e tamanho máximo de foto calculados para a tela atual

  function iniciar(secao) {
    const A = C.ABERTURA;
    mural = secao.querySelector('[data-mural]');
    mural.textContent = '';
    const arquivos = U.ordenarAlfabetico(C.FOTOS.ARQUIVOS);
    // Cada foto ganha o mesmo tempo de leitura; a etapa dura o que as fotos precisarem.
    const intervalo = A.TEMPO_POR_FOTO_MS;
    const total = A.ATRASO_INICIAL_MS + Math.max(0, arquivos.length - 1) * intervalo +
      A.ENTRADA_FOTO_MS + A.PAUSA_FINAL_MS;

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
    posicionar(foto);
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

  // Divide a área em regiões (uma por foto); cada foto fica perto do centro da sua,
  // maior que a região, formando uma colagem que cobre a tela toda.
  function distribuir() {
    quadroPendente = 0;
    if (!mural || !fotos.length) return;
    const estilo = window.getComputedStyle(document.documentElement);
    const borda = {
      lado: parseFloat(estilo.getPropertyValue('--foto-borda')) || 0,
      base: parseFloat(estilo.getPropertyValue('--foto-borda-base')) || 0
    };
    const largura = mural.clientWidth;
    const altura = mural.clientHeight;
    const grade = U.melhorGrade(fotos.length, largura, altura, proporcaoDaMoldura(C.FOTOS.PROPORCAO_PADRAO, borda));
    area = {
      largura,
      altura,
      borda,
      grade,
      caixaX: grade.largura * C.ABERTURA.ESCALA_FOTO,
      caixaY: grade.altura * C.ABERTURA.ESCALA_FOTO
    };
    fotos.forEach(posicionar);
  }

  // A borda branca é mais grossa embaixo; a moldura soma a foto e as bordas.
  function proporcaoDaMoldura(proporcaoFoto, borda) {
    return 1 / ((1 - 2 * borda.lado) / proporcaoFoto + borda.lado + borda.base);
  }

  function posicionar(foto) {
    if (!area) return;
    const { grade, borda } = area;
    const proporcao = proporcaoDaMoldura(foto.proporcao, borda);
    // Cabe na caixa da região e, girada, cabe inteira na área.
    let larguraFoto = Math.min(area.caixaX, area.caixaY * proporcao);
    const girada = U.caixaGirada(larguraFoto, larguraFoto / proporcao, foto.giro);
    larguraFoto *= Math.min(1, area.largura / girada.largura, area.altura / girada.altura);
    const alturaFoto = larguraFoto / proporcao;

    const regiaoX = area.largura / grade.colunas;
    const regiaoY = area.altura / grade.linhas;
    const linha = Math.floor(foto.lugar / grade.colunas);
    const coluna = foto.lugar % grade.colunas;
    // Última linha incompleta fica centralizada, sem deixar um canto vazio.
    const naLinha = Math.min(grade.colunas, fotos.length - linha * grade.colunas);
    const recuo = ((grade.colunas - naLinha) * regiaoX) / 2;
    const caixa = U.caixaGirada(larguraFoto, alturaFoto, foto.giro);
    const x = U.limitar(recuo + (coluna + 1 / 2 + foto.desvioX) * regiaoX, caixa.largura / 2, area.largura - caixa.largura / 2);
    const y = U.limitar((linha + 1 / 2 + foto.desvioY) * regiaoY, caixa.altura / 2, area.altura - caixa.altura / 2);

    const s = foto.celula.style;
    s.setProperty('--foto-largura', larguraFoto + 'px');
    s.setProperty('--foto-altura', alturaFoto + 'px');
    s.left = x - larguraFoto / 2 + 'px';
    s.top = y - alturaFoto / 2 + 'px';
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
    area = null;
  }

  DR30.Abertura = { iniciar, encerrar };
})(window.DR30 = window.DR30 || {});
