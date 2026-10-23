// Etapa 4: cadastro dos nomes, giro com desaceleração e resultado com festa.
// O desenho do disco fica no 06-roleta-disco.js.
(function (DR30) {
  'use strict';

  const C = DR30.Config;
  const R = C.ROLETA;
  const T = C.TEXTOS;
  const U = DR30.Utils;
  const estado = DR30.Estado.roleta;
  const PARTES = ['conteudo', 'form', 'campo', 'adicionar', 'contador', 'aviso', 'lista',
    'canvas', 'girar', 'dica', 'resultado', 'vencedor', 'deNovo', 'fechar'];
  const RECUSA = { vazio: T.NOME_VAZIO, limite: T.NOME_LIMITE, duplicado: T.NOME_DUPLICADO };
  const el = {};
  let quadroGiro = 0;
  let quadroPendente = 0;

  function iniciar(secao) {
    PARTES.forEach((parte) => {
      el[parte] = secao.querySelector('[data-roleta="' + parte + '"]');
    });
    el.campo.maxLength = R.NOME_MAX_CARACTERES;
    el.form.addEventListener('submit', aoAdicionar); // cobre o botão e o Enter
    el.lista.addEventListener('click', aoRemover);
    el.girar.addEventListener('click', girar);
    el.deNovo.addEventListener('click', girarDeNovo);
    el.fechar.addEventListener('click', () => fecharResultado(true));
    document.addEventListener('keydown', aoTeclar);
    window.addEventListener('resize', aoRedimensionar);
    DR30.RoletaDisco.preparar(el.canvas);
    DR30.RoletaDisco.redimensionar();
    nomesMudaram();
  }

  function aoAdicionar(evento) {
    evento.preventDefault();
    if (estado.girando) return;
    const nome = U.normalizarNome(el.campo.value).slice(0, R.NOME_MAX_CARACTERES);
    const recusa = U.validarNovoNome(nome, estado.nomes, R.MAX_NOMES);
    if (recusa) {
      avisar(U.formatar(RECUSA[recusa], { nome, max: R.MAX_NOMES }), true);
      // Texto recusado fica selecionado: dá para corrigir ou digitar outro por cima.
      if (!el.campo.disabled) { el.campo.focus(); el.campo.select(); }
      return;
    }
    estado.nomes.push(nome);
    el.campo.value = '';
    const cheio = estado.nomes.length >= R.MAX_NOMES;
    avisar(U.formatar(cheio ? T.NOME_LIMITE : T.NOME_ADICIONADO, { nome, max: R.MAX_NOMES }), false);
    nomesMudaram();
    // Mantém o teclado aberto para o próximo nome.
    if (!el.campo.disabled) el.campo.focus();
  }

  function aoRemover(evento) {
    const botao = evento.target.closest('[data-remover]');
    if (!botao || estado.girando) return;
    const indice = Number(botao.getAttribute('data-remover'));
    const removido = estado.nomes.splice(indice, 1)[0];
    if (removido === undefined) return;
    avisar(U.formatar(T.NOME_REMOVIDO, { nome: removido }), false);
    nomesMudaram();
    // O foco vai para o próximo "remover", ou volta para o campo se a lista esvaziou.
    const botoes = el.lista.querySelectorAll('[data-remover]');
    (botoes[Math.min(indice, botoes.length - 1)] || el.campo).focus();
  }

  function nomesMudaram() {
    renderizarLista();
    DR30.RoletaDisco.desenhar(estado.nomes);
    atualizarControles();
  }

  function renderizarLista() {
    el.lista.textContent = '';
    estado.nomes.forEach((nome, indice) => {
      const item = document.createElement('li');
      item.className = 'lista-nomes__item';
      const texto = document.createElement('span');
      texto.className = 'lista-nomes__nome';
      texto.textContent = nome;
      const remover = document.createElement('button');
      remover.type = 'button';
      remover.className = 'lista-nomes__remover';
      remover.setAttribute('data-remover', String(indice));
      remover.setAttribute('aria-label', U.formatar(T.REMOVER, { nome }));
      remover.textContent = '×';
      item.appendChild(texto);
      item.appendChild(remover);
      el.lista.appendChild(item);
    });
  }

  // Durante o giro nada muda de lugar: campo, remover e girar ficam travados.
  function atualizarControles() {
    const total = estado.nomes.length;
    const cheio = total >= R.MAX_NOMES;
    el.campo.disabled = cheio || estado.girando;
    el.adicionar.disabled = cheio || estado.girando;
    el.girar.disabled = total < R.MIN_NOMES || estado.girando;
    Array.prototype.forEach.call(el.lista.querySelectorAll('[data-remover]'), (botao) => {
      botao.disabled = estado.girando;
    });
    el.contador.textContent = U.formatar(T.CONTADOR_NOMES, { total, max: R.MAX_NOMES });
    el.dica.textContent = total < R.MIN_NOMES ? U.formatar(T.FALTAM_NOMES, { min: R.MIN_NOMES }) : '';
  }

  function avisar(texto, ehErro) {
    el.aviso.textContent = texto;
    el.aviso.classList.toggle('aviso--erro', Boolean(ehErro));
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
    avisar(T.GIRANDO, false);
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
    avisar('', false);
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
