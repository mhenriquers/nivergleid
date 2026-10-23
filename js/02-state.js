// Estado da aplicação em um único objeto. Cada etapa lê e escreve só a própria parte;
// "etapa" é escrita apenas pelo 08-app.js.
(function (DR30) {
  'use strict';

  DR30.Estado = {
    etapa: null,

    notas: {
      lista: [], // notas já validadas a partir do notas.js da raiz
      reveladas: 0,
      ultimoToque: -Infinity,
      concluida: false
    },

    roleta: {
      nomes: [],
      girando: false,
      angulo: 0, // giro atual do disco, em graus
      ultimoVencedor: null,
      rodadas: 0,
      resultadoAberto: false
    }
  };
})(window.DR30 = window.DR30 || {});
