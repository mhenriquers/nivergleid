// Desenho da roleta em canvas. Só desenha e gira o disco; quem decide nomes,
// sorteio e ângulo é o 06-roleta.js.
(function (DR30) {
  'use strict';

  const R = DR30.Config.ROLETA;
  const U = DR30.Utils;
  const VOLTA = Math.PI * 2;
  let canvas = null;
  let ctx = null;
  let nomesDesenhados = [];

  function preparar(elemento) {
    canvas = elemento;
    ctx = canvas.getContext('2d');
    // Se um dia entrar fonte própria (TODO no 01-tokens.css), redesenha quando ela carregar.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => desenhar(nomesDesenhados), () => {});
    }
  }

  // Canvas no tamanho do CSS vezes a densidade da tela, com teto para não pesar.
  function redimensionar() {
    if (!canvas) return;
    const lado = canvas.parentNode.clientWidth;
    const densidade = Math.min(window.devicePixelRatio || 1, R.DPR_MAX);
    const pixels = Math.max(1, Math.round(lado * densidade));
    if (canvas.width === pixels && canvas.height === pixels) return;
    canvas.width = pixels;
    canvas.height = pixels;
    desenhar(nomesDesenhados);
  }

  function desenhar(nomes) {
    nomesDesenhados = nomes.slice();
    if (!ctx) return;
    const raio = canvas.width / 2;
    const miolo = raio * (1 - R.BORDA_RAIO);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(raio, raio);
    if (nomes.length) desenharFatias(nomes, miolo);
    else desenharVazia(miolo);
    // Borda de cartolina por cima, escondendo a ponta das divisas.
    ctx.beginPath();
    ctx.arc(0, 0, raio - (raio * R.BORDA_RAIO) / 2, 0, VOLTA);
    ctx.lineWidth = raio * R.BORDA_RAIO;
    ctx.strokeStyle = R.COR_BORDA;
    ctx.stroke();
  }

  function desenharFatias(nomes, raio) {
    const total = nomes.length;
    const fatia = VOLTA / total;
    // A altura da fatia no meio do texto define a maior letra que cabe sem invadir a vizinha.
    const alturaFatia = 2 * raio * R.TEXTO_REFERENCIA_RAIO * Math.sin(Math.min(fatia, Math.PI) / 2);
    const fonteMax = Math.min(raio * R.FONTE_MAX_RAIO, alturaFatia * R.TEXTO_OCUPACAO);
    const fonteMin = Math.min(fonteMax, raio * R.FONTE_MIN_RAIO);
    const familia = familiaManuscrita();
    for (let i = 0; i < total; i += 1) {
      const inicio = -Math.PI / 2 + i * fatia; // a primeira fatia começa no topo, sob o ponteiro
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, raio, inicio, inicio + fatia);
      ctx.closePath();
      ctx.fillStyle = R.CORES[U.corDaFatia(i, total, R.CORES.length)];
      ctx.fill();
      if (total > 1) {
        ctx.lineWidth = Math.max(1, raio * R.DIVISA_RAIO);
        ctx.strokeStyle = R.COR_DIVISA;
        ctx.stroke();
      }
      escreverNome(nomes[i], inicio + fatia / 2, raio, fonteMax, fonteMin, familia);
    }
  }

  // O nome sai do centro para a borda, alinhado perto da borda onde a fatia é mais larga.
  function escreverNome(nome, angulo, raio, fonteMax, fonteMin, familia) {
    const fim = raio * (1 - R.TEXTO_MARGEM_RAIO);
    const espaco = fim - raio * R.TEXTO_INICIO_RAIO;
    const medir = (texto, tamanho) => {
      ctx.font = fonte(tamanho, familia);
      return ctx.measureText(texto).width;
    };
    const ajuste = U.encaixarTexto(medir, nome, espaco, fonteMax, fonteMin);
    ctx.save();
    ctx.rotate(angulo);
    ctx.font = fonte(ajuste.tamanho, familia);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = R.COR_TEXTO;
    ctx.fillText(ajuste.texto, fim, 0);
    ctx.restore();
  }

  // Roleta sem nomes: disco liso com riscos tracejados, para não parecer quebrada.
  function desenharVazia(raio) {
    ctx.beginPath();
    ctx.arc(0, 0, raio, 0, VOLTA);
    ctx.fillStyle = R.COR_VAZIA;
    ctx.fill();
    ctx.setLineDash([raio * R.TRACO_RAIO, raio * R.TRACO_RAIO]);
    ctx.lineWidth = Math.max(1, raio * R.DIVISA_RAIO);
    ctx.strokeStyle = R.COR_DIVISA;
    for (let i = 0; i < R.DIVISAS_VAZIA; i += 1) {
      const angulo = (i * VOLTA) / R.DIVISAS_VAZIA;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angulo) * raio, Math.sin(angulo) * raio);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  function fonte(tamanho, familia) {
    return R.FONTE_PESO + ' ' + tamanho + 'px ' + familia;
  }

  // A família vem do 01-tokens.css para canvas e página usarem a mesma letra.
  function familiaManuscrita() {
    const valor = window.getComputedStyle(document.documentElement).getPropertyValue('--fonte-manuscrita');
    return valor.trim() || 'cursive';
  }

  function girarPara(graus) {
    if (canvas) canvas.style.transform = 'rotate(' + graus + 'deg)';
  }

  DR30.RoletaDisco = { preparar, redimensionar, desenhar, girarPara };
})(window.DR30 = window.DR30 || {});
