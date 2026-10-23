// Etapa 4: giro com desaceleração e resultado com festa.
// O cadastro de nomes fica no 06-roleta-cadastro.js e o desenho do disco no 06-roleta-disco.js.
(function (DR30) {
  'use strict';

  const C = DR30.Config;
  const R = C.ROLETA;
  const T = C.TEXTOS;
  const U = DR30.Utils;
  const estado = DR30.Estado.roleta;
  const PARTES = ['conteudo', 'canvas', 'girar', 'dica', 'resultado', 'vencedor', 'deNovo', 'fechar'];
  const el = {};
  let quadroGiro = 0;
  let quadroPendente = 0;

  function iniciar(secao) {
    PARTES.forEach((parte) => {
      el[parte] = secao.querySelector('[data-roleta="' + parte + '"]');
    });
    el.girar.addEventListener('click', girar);
    el.deNovo.addEventListener('click', girarDeNovo);
    el.fechar.addEventListener('click', () => fecharResultado(true));
    document.addEventListener('keydown', aoTeclar);
    window.addEventListener('resize', aoRedimensionar);
    DR30.RoletaDisco.preparar(el.canvas);
    DR30.RoletaDisco.redimensionar();
    DR30.RoletaCadastro.preparar(secao, nomesMudaram);
    nomesMudaram();
  }

  function nomesMudaram() {
    DR30.RoletaDisco.desenhar(estado.nomes);
    atualizarControles();
  }

  function atualizarControles() {
    const total = estado.nomes.length;
    el.girar.disabled = total < R.MIN_NOMES || estado.girando;
    el.dica.textContent = total < R.MIN_NOMES ? U.formatar(T.FALTAM_NOMES, { min: R.MIN_NOMES }) : '';
    DR30.RoletaCadastro.atualizar();
  }

  // O vencedor é sorteado antes; o giro só calcula o ângulo que para nele.
  function girar() {
    if (estado.girando || estado.nomes.length < R.MIN_NOMES) return;
    const indice = U.escolherVencedor(estado.nomes, estado.ultimoVencedor, R.MIN_PARA_NAO_REPETIR);
    if (indice < 0) return;
    const reduzido = DR30.App.movimentoReduzido();
    const voltas = reduzido ? R.VOLTAS_REDUZIDO : U.inteiroAleatorio(R.VOLTAS_MIN, R.VOLTAS_MAX);
    const folga = 1 / 2 - R.MARGEM_FATIA; // meia fatia menos a margem longe da divisa
    const inicio = estado.angulo;
    const fim = U.anguloFinal(inicio, indice, estado.nomes.length, voltas, U.aleatorio(-folga, folga));
    const duracao = reduzido ? R.GIRO_REDUZIDO_MS : R.GIRO_MS;
    const comeco = window.performance.now();
    estado.girando = true;
    DR30.RoletaCadastro.avisar(T.GIRANDO, false);
    atualizarControles();
    const passo = (agora) => {
      const progresso = U.limitar((agora - comeco) / duracao, 0, 1);
      estado.angulo = inicio + (fim - inicio) * U.desacelerar(progresso);
      DR30.RoletaDisco.girarPara(estado.angulo);
      if (progresso < 1) quadroGiro = window.requestAnimationFrame(passo);
      else terminarGiro(indice);
    };
    quadroGiro = window.requestAnimationFrame(passo);
  }

  function terminarGiro(indice) {
    quadroGiro = 0;
    estado.angulo %= 360; // mesmo desenho, número menor para a próxima rodada
    DR30.RoletaDisco.girarPara(estado.angulo);
    estado.girando = false;
    estado.ultimoVencedor = estado.nomes[indice];
    estado.rodadas += 1;
    DR30.RoletaCadastro.avisar('', false);
    atualizarControles();
    mostrarResultado(estado.ultimoVencedor);
  }

  function mostrarResultado(nome) {
    el.vencedor.textContent = nome;
    el.resultado.hidden = false;
    el.conteudo.setAttribute('aria-hidden', 'true');
    el.conteudo.inert = true;
    estado.resultadoAberto = true;
    DR30.App.caberNaLargura(el.vencedor, R.RESULTADO_FONTE_MIN_PX);
    el.deNovo.focus();
    DR30.App.celebrar();
  }

  function fecharResultado(devolverFoco) {
    if (!estado.resultadoAberto) return;
    DR30.App.pararCelebracao();
    el.resultado.hidden = true;
    el.conteudo.removeAttribute('aria-hidden');
    el.conteudo.inert = false;
    estado.resultadoAberto = false;
    if (devolverFoco) el.girar.focus();
  }

  // Mantém os nomes: só fecha o resultado e gira outra vez.
  function girarDeNovo() {
    fecharResultado(false);
    girar();
  }

  function aoTeclar(evento) {
    if (evento.key === 'Escape' || evento.key === 'Esc') fecharResultado(true);
  }

  function aoRedimensionar() {
    if (quadroPendente) return;
    quadroPendente = window.requestAnimationFrame(() => {
      quadroPendente = 0;
      DR30.RoletaDisco.redimensionar();
    });
  }

  function encerrar() {
    window.cancelAnimationFrame(quadroGiro);
    window.cancelAnimationFrame(quadroPendente);
    document.removeEventListener('keydown', aoTeclar);
    window.removeEventListener('resize', aoRedimensionar);
  }

  DR30.Roleta = { iniciar, encerrar };
})(window.DR30 = window.DR30 || {});
