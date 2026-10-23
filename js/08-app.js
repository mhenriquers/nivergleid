// Liga tudo: confere os módulos, valida as notas, troca de etapa e mostra erro legível.
// É o único arquivo que conhece todas as etapas; elas só falam com ele e com o estado.
(function (DR30) {
  'use strict';

  const MODULOS = ['Config', 'Utils', 'Estado', 'Abertura', 'Notas', 'Transicao', 'RoletaDisco', 'RoletaCadastro', 'Roleta', 'Confetti'];
  const MODULO_DA_ETAPA = { abertura: 'Abertura', notas: 'Notas', transicao: 'Transicao', roleta: 'Roleta' };
  // Sem o 00-config.js não há textos, então o aviso de reserva fica aqui mesmo.
  const TEXTO_RESERVA = 'A página não conseguiu abrir direito. Recarregue para tentar de novo.';
  const raiz = document.documentElement;
  const erro = {};

  function iniciar() {
    try {
      prepararPainelDeErro();
      const faltando = MODULOS.filter((nome) => !DR30[nome]);
      if (faltando.length) {
        mostrarErro(texto('ERRO_MODULO', { modulo: faltando.join(', ') }), null);
        return;
      }
      raiz.classList.add('js-ok');
      aplicarTempos();
      window.addEventListener('error', aoErroGlobal);
      DR30.Confetti.preparar(document.getElementById('confete'));
      const notas = DR30.Notas.validar();
      if (!notas.ok) {
        mostrarErro(notas.motivo, 'roleta');
        return;
      }
      DR30.Estado.notas.lista = notas.lista;
      irPara(DR30.Config.ETAPAS[0]);
    } catch (falha) {
      mostrarErro(texto('ERRO_INESPERADO'), null, falha);
    }
  }

  // Os tempos coreografados moram no 00-config.js; o CSS os recebe como variáveis.
  function aplicarTempos() {
    const C = DR30.Config;
    const tempos = {
      '--duracao-troca': C.TROCA_ETAPA_MS,
      '--duracao-foto': C.ABERTURA.ENTRADA_FOTO_MS,
      '--duracao-nota': C.NOTAS.ENTRADA_MS,
      '--duracao-virada': C.TRANSICAO.DURACAO_MS,
      '--duracao-virada-reduzida': C.TRANSICAO.DURACAO_REDUZIDA_MS
    };
    Object.keys(tempos).forEach((nome) => raiz.style.setProperty(nome, tempos[nome] + 'ms'));
  }

  function irPara(nome) {
    const anterior = DR30[MODULO_DA_ETAPA[DR30.Estado.etapa]];
    if (anterior && anterior.encerrar) anterior.encerrar();
    DR30.Estado.etapa = nome;
    raiz.setAttribute('data-etapa', nome); // o CSS decide o que aparece em cada etapa
    try {
      DR30[MODULO_DA_ETAPA[nome]].iniciar(document.getElementById('etapa-' + nome));
    } catch (falha) {
      mostrarErro(texto('ERRO_INESPERADO'), proximaEtapa(nome), falha);
    }
  }

  // Cada etapa avisa quando termina; aviso atrasado de etapa que já passou é ignorado.
  function concluir(nome) {
    if (nome !== DR30.Estado.etapa) return;
    const proxima = proximaEtapa(nome);
    if (proxima) irPara(proxima);
  }

  function proximaEtapa(nome) {
    const etapas = DR30.Config.ETAPAS;
    const indice = etapas.indexOf(nome);
    return indice >= 0 && indice < etapas.length - 1 ? etapas[indice + 1] : null;
  }

  function prepararPainelDeErro() {
    const painel = document.getElementById('erro');
    if (!painel) return;
    erro.painel = painel;
    ['mensagem', 'detalhe', 'pular', 'recarregar'].forEach((parte) => {
      erro[parte] = painel.querySelector('[data-erro="' + parte + '"]');
    });
    erro.recarregar.addEventListener('click', () => window.location.reload());
    erro.pular.addEventListener('click', () => {
      const destino = erro.destino;
      erro.painel.hidden = true;
      if (destino) irPara(destino);
    });
  }

  // "destino" é a etapa para onde o botão de pular leva; sem destino, só resta recarregar.
  function mostrarErro(mensagem, destino, falha) {
    raiz.classList.add('js-ok'); // o painel substitui o aviso genérico de página travada
    if (!erro.painel) return;
    erro.destino = destino;
    erro.mensagem.textContent = mensagem;
    erro.detalhe.textContent = falha && falha.message ? falha.message : '';
    erro.pular.hidden = !destino;
    erro.pular.textContent = texto(destino === 'roleta' ? 'PULAR_PARA_ROLETA' : 'PULAR_ETAPA');
    erro.painel.hidden = false;
    (destino ? erro.pular : erro.recarregar).focus();
  }

  // Só reage a erro dos arquivos do projeto; extensão do navegador não derruba a festa.
  function aoErroGlobal(evento) {
    const base = window.location.href.split(/[?#]/)[0].replace(/[^/]*$/, '');
    if (!evento.filename || evento.filename.indexOf(base) !== 0) return;
    mostrarErro(texto('ERRO_INESPERADO'), proximaEtapa(DR30.Estado.etapa), evento.error);
  }

  function texto(chave, valores) {
    const textos = DR30.Config && DR30.Config.TEXTOS;
    if (!textos || !textos[chave] || !DR30.Utils) return TEXTO_RESERVA;
    return DR30.Utils.formatar(textos[chave], valores);
  }

  function movimentoReduzido() {
    return Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function celebrar() {
    DR30.Confetti.disparar(movimentoReduzido());
  }

  function pararCelebracao() {
    DR30.Confetti.parar();
  }

  // A fonte de reserva muda de aparelho para aparelho: se a palavra não couber, a letra encolhe
  // em vez de quebrar a palavra no meio.
  function caberNaLargura(elemento, minimoPx) {
    if (!elemento) return;
    elemento.style.fontSize = '';
    const largura = elemento.clientWidth;
    if (!largura || elemento.scrollWidth <= largura) return;
    const atual = parseFloat(window.getComputedStyle(elemento).fontSize);
    elemento.style.fontSize = Math.max(minimoPx, Math.floor((atual * largura) / elemento.scrollWidth)) + 'px';
  }

  DR30.App = { iniciar, concluir, irPara, mostrarErro, movimentoReduzido, celebrar, pararCelebracao, caberNaLargura };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})(window.DR30 = window.DR30 || {});
