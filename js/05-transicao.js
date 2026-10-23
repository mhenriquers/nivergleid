// Etapa 3: a página das notas vira como folha de caderno e revela a página da roleta.
// O movimento mora no CSS (05-etapas.css e 06-animacoes.css, ligado ao data-etapa="transicao");
// aqui só se espera o tempo da virada para avisar o app.
(function (DR30) {
  'use strict';

  let timer = 0;

  function iniciar() {
    const T = DR30.Config.TRANSICAO;
    const duracao = DR30.App.movimentoReduzido() ? T.DURACAO_REDUZIDA_MS : T.DURACAO_MS;
    timer = window.setTimeout(() => DR30.App.concluir('transicao'), duracao);
  }

  function encerrar() {
    window.clearTimeout(timer);
  }

  DR30.Transicao = { iniciar, encerrar };
})(window.DR30 = window.DR30 || {});
