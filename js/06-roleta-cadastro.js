// Etapa 4, cadastro: adiciona nomes, lista e tira com confirmação.
// Só mexe em DR30.Estado.roleta.nomes e avisa o 06-roleta.js pelo retorno aoMudar.
(function (DR30) {
  'use strict';

  const C = DR30.Config;
  const R = C.ROLETA;
  const T = C.TEXTOS;
  const U = DR30.Utils;
  const estado = DR30.Estado.roleta;
  const PARTES = ['conteudo', 'form', 'campo', 'adicionar', 'contador', 'aviso', 'lista',
    'confirmar', 'confirmarTexto', 'confirmarSim', 'confirmarNao'];
  const RECUSA = { vazio: T.NOME_VAZIO, limite: T.NOME_LIMITE, duplicado: T.NOME_DUPLICADO };
  const el = {};
  let avisarMudanca = () => {};
  let indicePendente = -1; // nome esperando a confirmação para sair

  function preparar(secao, aoMudar) {
    PARTES.forEach((parte) => {
      el[parte] = secao.querySelector('[data-roleta="' + parte + '"]');
    });
    avisarMudanca = aoMudar;
    el.campo.maxLength = R.NOME_MAX_CARACTERES;
    el.form.addEventListener('submit', aoAdicionar); // cobre o botão e o Enter
    el.lista.addEventListener('click', aoTocarNome);
    el.confirmarSim.addEventListener('click', confirmarRemocao);
    el.confirmarNao.addEventListener('click', () => fecharConfirmacao(true));
    // Tocar no fundo escuro, fora do cartão, também cancela.
    el.confirmar.addEventListener('click', (evento) => {
      if (evento.target === el.confirmar) fecharConfirmacao(true);
    });
    document.addEventListener('keydown', (evento) => {
      if (evento.key === 'Escape' || evento.key === 'Esc') fecharConfirmacao(true);
    });
    renderizarLista();
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
    renderizarLista();
    avisarMudanca();
    // Mantém o teclado aberto para o próximo nome.
    if (!el.campo.disabled) el.campo.focus();
  }

  function aoTocarNome(evento) {
    const botao = evento.target.closest('[data-remover]');
    if (!botao || estado.girando) return;
    pedirConfirmacao(Number(botao.getAttribute('data-remover')));
  }

  function pedirConfirmacao(indice) {
    const nome = estado.nomes[indice];
    if (nome === undefined) return;
    indicePendente = indice;
    el.confirmarTexto.textContent = U.formatar(T.CONFIRMAR_REMOCAO, { nome });
    el.confirmar.hidden = false;
    el.conteudo.setAttribute('aria-hidden', 'true');
    el.conteudo.inert = true;
    el.confirmarNao.focus(); // ação que apaga: o foco começa no "cancelar"
  }

  function confirmarRemocao() {
    const indice = indicePendente;
    fecharConfirmacao(false);
    const removido = estado.nomes.splice(indice, 1)[0];
    if (removido === undefined) return;
    avisar(U.formatar(T.NOME_REMOVIDO, { nome: removido }), false);
    renderizarLista();
    avisarMudanca();
    // O foco vai para o nome seguinte, ou volta para o campo se a lista esvaziou.
    const botoes = el.lista.querySelectorAll('[data-remover]');
    (botoes[Math.min(indice, botoes.length - 1)] || el.campo).focus();
  }

  function fecharConfirmacao(devolverFoco) {
    if (indicePendente < 0) return;
    const indice = indicePendente;
    indicePendente = -1;
    el.confirmar.hidden = true;
    el.conteudo.removeAttribute('aria-hidden');
    el.conteudo.inert = false;
    if (devolverFoco) {
      const botao = el.lista.querySelector('[data-remover="' + indice + '"]');
      if (botao) botao.focus();
    }
  }

  // Cada etiqueta inteira é um botão: tocar no nome abre a confirmação.
  function renderizarLista() {
    el.lista.textContent = '';
    estado.nomes.forEach((nome, indice) => {
      const item = document.createElement('li');
      item.className = 'lista-nomes__item';
      const botao = document.createElement('button');
      botao.type = 'button';
      botao.className = 'lista-nomes__botao';
      botao.setAttribute('data-remover', String(indice));
      botao.setAttribute('aria-label', U.formatar(T.REMOVER, { nome }));
      const texto = document.createElement('span');
      texto.className = 'lista-nomes__nome';
      texto.textContent = nome;
      const icone = document.createElement('span');
      icone.className = 'lista-nomes__icone';
      icone.setAttribute('aria-hidden', 'true');
      icone.textContent = '×';
      botao.appendChild(texto);
      botao.appendChild(icone);
      item.appendChild(botao);
      el.lista.appendChild(item);
    });
  }

  // Durante o giro nada muda de lugar: campo e etiquetas ficam travados.
  function atualizar() {
    const cheio = estado.nomes.length >= R.MAX_NOMES;
    el.campo.disabled = cheio || estado.girando;
    el.adicionar.disabled = cheio || estado.girando;
    Array.prototype.forEach.call(el.lista.querySelectorAll('[data-remover]'), (botao) => {
      botao.disabled = estado.girando;
    });
    el.contador.textContent = U.formatar(T.CONTADOR_NOMES, { total: estado.nomes.length, max: R.MAX_NOMES });
  }

  function avisar(texto, ehErro) {
    el.aviso.textContent = texto;
    el.aviso.classList.toggle('aviso--erro', Boolean(ehErro));
  }

  DR30.RoletaCadastro = { preparar, atualizar, avisar };
})(window.DR30 = window.DR30 || {});
