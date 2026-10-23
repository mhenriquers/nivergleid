// Etapa 2: cada toque cola uma nota nova por cima das anteriores.
// Na última, instrução e contador somem, espera um pouco e passa para a virada de página.
(function (DR30) {
  'use strict';

  const C = DR30.Config;
  const U = DR30.Utils;
  const estado = DR30.Estado.notas;
  const TECLAS = ['Enter', ' ', 'Spacebar', 'ArrowRight'];
  // Celular sem Pointer Events (iOS antigo) cai no touchstart, que também não espera o "click".
  const EVENTO_TOQUE = window.PointerEvent ? 'pointerdown' : 'touchstart';
  const coladas = []; // posição sorteada de cada nota, guardada para reposicionar se a tela girar
  let secao = null;
  let mural = null;
  let contador = null;
  let timerFinal = 0;
  let quadroPendente = 0;

  // NOTAS é um const do notas.js. Const global não vira window.NOTAS, por isso o typeof.
  function lerBruto() {
    try {
      return typeof NOTAS === 'undefined' ? undefined : NOTAS; // eslint-disable-line no-undef
    } catch (erro) {
      return undefined; // o notas.js quebrou no meio e deixou NOTAS inacessível
    }
  }

  function validar() {
    const T = C.TEXTOS;
    const bruto = lerBruto();
    if (bruto === undefined) return { ok: false, motivo: T.ERRO_NOTAS_AUSENTE };
    if (!Array.isArray(bruto)) return { ok: false, motivo: T.ERRO_NOTAS_FORMATO };
    if (!bruto.length) return { ok: false, motivo: T.ERRO_NOTAS_VAZIA };
    const lista = bruto.map(normalizar).filter(Boolean);
    if (!lista.length) return { ok: false, motivo: T.ERRO_NOTAS_INVALIDAS };
    return { ok: true, lista, ignoradas: bruto.length - lista.length };
  }

  // Item sem adjetivo é pulado; cor e rotação ausentes ganham valor de reserva.
  function normalizar(item, indice) {
    if (!item || typeof item.adjetivo !== 'string' || !item.adjetivo.trim()) return null;
    const N = C.NOTAS;
    const temRotacao = typeof item.rotacao === 'number' && isFinite(item.rotacao);
    return {
      adjetivo: item.adjetivo.trim(),
      frase: typeof item.frase === 'string' ? item.frase.trim() : '',
      cor: typeof item.cor === 'string' ? item.cor.trim() : '',
      corReserva: N.CORES_RESERVA[indice % N.CORES_RESERVA.length],
      rotacao: temRotacao
        ? U.limitar(item.rotacao, -N.ROTACAO_MAX_GRAUS, N.ROTACAO_MAX_GRAUS)
        : U.aleatorio(-N.ROTACAO_MAX_GRAUS, N.ROTACAO_MAX_GRAUS)
    };
  }

  function iniciar(elemento) {
    secao = elemento;
    mural = secao.querySelector('[data-mural]');
    contador = secao.querySelector('[data-contador]');
    secao.addEventListener(EVENTO_TOQUE, aoTocar);
    document.addEventListener('keydown', aoTeclar);
    window.addEventListener('resize', aoRedimensionar);
    atualizarContador();
  }

  function aoTocar(evento) {
    if (evento.pointerType === 'mouse' && evento.button !== 0) return;
    registrarToque();
  }

  // Teclado ajuda no notebook ligado na TV: espaço, enter ou seta para a direita.
  function aoTeclar(evento) {
    const alvo = evento.target;
    const emControle = alvo && alvo.closest && alvo.closest('button, input, a');
    if (evento.repeat || emControle || TECLAS.indexOf(evento.key) === -1) return;
    evento.preventDefault();
    registrarToque();
  }

  // A trava só barra o disparo duplo de um mesmo encostar de dedos; toque rápido de verdade passa.
  function registrarToque() {
    const agora = window.performance.now();
    if (agora - estado.ultimoToque < C.NOTAS.TRAVA_TOQUE_MS) return;
    estado.ultimoToque = agora;
    revelar();
  }

  function revelar() {
    if (estado.concluida || estado.reveladas >= estado.lista.length) return;
    const nota = estado.lista[estado.reveladas];
    estado.reveladas += 1;
    const colada = { elemento: criarPostit(nota), rotacao: nota.rotacao, fx: Math.random(), fy: Math.random() };
    coladas.push(colada);
    mural.appendChild(colada.elemento);
    ajustarAdjetivo(colada);
    posicionar(colada);
    atualizarContador();
    if (estado.reveladas === estado.lista.length) finalizar();
  }

  function criarPostit(nota) {
    const postit = document.createElement('article');
    postit.className = 'postit';
    postit.style.transform = 'rotate(' + nota.rotacao + 'deg)';
    const papel = document.createElement('div');
    papel.className = 'postit__papel';
    papel.style.backgroundColor = nota.corReserva;
    // Cor inválida no notas.js é ignorada pelo navegador e a reserva continua valendo.
    if (nota.cor) papel.style.backgroundColor = nota.cor;
    const adjetivo = document.createElement('h2');
    adjetivo.className = 'postit__adjetivo';
    adjetivo.textContent = nota.adjetivo;
    papel.appendChild(adjetivo);
    if (nota.frase) {
      const frase = document.createElement('p');
      frase.className = 'postit__frase';
      frase.textContent = nota.frase;
      papel.appendChild(frase);
    }
    postit.appendChild(papel);
    return postit;
  }

  function ajustarAdjetivo(colada) {
    DR30.App.caberNaLargura(colada.elemento.querySelector('.postit__adjetivo'), C.NOTAS.FONTE_MIN_PX);
  }

  // Sorteia o centro dentro da área livre, já descontando a caixa da nota girada.
  function posicionar(colada) {
    const largura = colada.elemento.offsetWidth;
    const altura = colada.elemento.offsetHeight;
    const caixa = U.caixaGirada(largura, altura, colada.rotacao);
    const folgaX = mural.clientWidth - caixa.largura;
    const folgaY = mural.clientHeight - caixa.altura;
    const centroX = folgaX > 0 ? caixa.largura / 2 + folgaX * colada.fx : mural.clientWidth / 2;
    const centroY = folgaY > 0 ? caixa.altura / 2 + folgaY * colada.fy : mural.clientHeight / 2;
    colada.elemento.style.left = centroX - largura / 2 + 'px';
    colada.elemento.style.top = centroY - altura / 2 + 'px';
  }

  function aoRedimensionar() {
    if (quadroPendente) return;
    quadroPendente = window.requestAnimationFrame(() => {
      quadroPendente = 0;
      coladas.forEach((colada) => {
        ajustarAdjetivo(colada);
        posicionar(colada);
      });
    });
  }

  function atualizarContador() {
    contador.textContent = U.formatar(C.TEXTOS.CONTADOR_NOTAS, {
      atual: estado.reveladas,
      total: estado.lista.length
    });
  }

  function finalizar() {
    estado.concluida = true;
    secao.classList.add('notas--fim');
    timerFinal = window.setTimeout(() => DR30.App.concluir('notas'), C.NOTAS.PAUSA_FINAL_MS);
  }

  function encerrar() {
    if (secao) secao.removeEventListener(EVENTO_TOQUE, aoTocar);
    document.removeEventListener('keydown', aoTeclar);
    window.removeEventListener('resize', aoRedimensionar);
    window.cancelAnimationFrame(quadroPendente);
    window.clearTimeout(timerFinal);
  }

  DR30.Notas = { validar, iniciar, encerrar };
})(window.DR30 = window.DR30 || {});
