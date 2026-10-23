// Funções puras de apoio: recebem dados e devolvem dados, sem tocar no DOM nem no estado.
(function (DR30) {
  'use strict';

  function limitar(valor, minimo, maximo) {
    return Math.min(maximo, Math.max(minimo, valor));
  }

  // O sorteio entra como parâmetro opcional para dar para testar com valores fixos.
  function aleatorio(minimo, maximo, sorteio) {
    return minimo + (sorteio || Math.random)() * (maximo - minimo);
  }

  function inteiroAleatorio(minimo, maximo, sorteio) {
    return Math.floor(aleatorio(minimo, maximo + 1, sorteio));
  }

  // Troca {chave} pelo valor, para os textos ficarem todos no 00-config.js.
  function formatar(modelo, valores) {
    return String(modelo).replace(/\{(\w+)\}/g, (trecho, chave) =>
      (valores && chave in valores ? String(valores[chave]) : trecho));
  }

  function normalizarNome(texto) {
    return String(texto == null ? '' : texto).replace(/\s+/g, ' ').trim();
  }

  // "Ana", "ana" e "Aná" contam como o mesmo nome na roleta.
  function chaveDoNome(nome) {
    const base = normalizarNome(nome).toLocaleLowerCase('pt-BR');
    return base.normalize ? base.normalize('NFD').replace(/[̀-ͯ]/g, '') : base;
  }

  // Devolve o motivo da recusa ('vazio', 'limite', 'duplicado') ou '' quando o nome pode entrar.
  function validarNovoNome(nome, nomes, maximo) {
    if (!nome) return 'vazio';
    if (nomes.length >= maximo) return 'limite';
    const chave = chaveDoNome(nome);
    return nomes.some((outro) => chaveDoNome(outro) === chave) ? 'duplicado' : '';
  }

  // Ordem alfabética natural: "foto 2" vem antes de "foto 10".
  function ordenarAlfabetico(lista) {
    const comparar = window.Intl && Intl.Collator
      ? new Intl.Collator('pt-BR', { numeric: true, sensitivity: 'base' }).compare
      : (a, b) => (a < b ? -1 : a > b ? 1 : 0);
    return lista.slice().sort(comparar);
  }

  // Desaceleração de saída (easeOutQuart): rápido no começo, arrastado no final.
  function desacelerar(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  // Testa cada número de colunas e fica com o que deixa a foto maior sem sair da área.
  function melhorGrade(total, largura, altura, proporcao) {
    const quantidade = Math.max(total, 1);
    let melhor = { colunas: 1, linhas: quantidade, largura: 0, altura: 0 };
    for (let colunas = 1; colunas <= quantidade; colunas += 1) {
      const linhas = Math.ceil(quantidade / colunas);
      const larguraFoto = Math.min(largura / colunas, (altura / linhas) * proporcao);
      if (larguraFoto > melhor.largura) {
        melhor = { colunas, linhas, largura: larguraFoto, altura: larguraFoto / proporcao };
      }
    }
    return melhor;
  }

  // Caixa ocupada por um retângulo girado, para a nota inteira caber na tela.
  function caixaGirada(largura, altura, graus) {
    const radianos = (graus * Math.PI) / 180;
    const cosseno = Math.abs(Math.cos(radianos));
    const seno = Math.abs(Math.sin(radianos));
    return { largura: largura * cosseno + altura * seno, altura: largura * seno + altura * cosseno };
  }

  // Nunca devolve nome vazio. A partir de minimoSemRepetir nomes, o último vencedor fica de fora.
  function escolherVencedor(nomes, anterior, minimoSemRepetir, sorteio) {
    const evitarAnterior = nomes.length >= minimoSemRepetir;
    const candidatos = [];
    nomes.forEach((nome, indice) => {
      const valido = typeof nome === 'string' && nome.trim() !== '';
      if (valido && !(evitarAnterior && nome === anterior)) candidatos.push(indice);
    });
    if (!candidatos.length) return -1;
    return candidatos[Math.floor((sorteio || Math.random)() * candidatos.length)];
  }

  function girarParaPositivo(graus) {
    return ((graus % 360) + 360) % 360;
  }

  // Ângulo final (graus, sentido horário) que deixa a fatia escolhida sob o ponteiro do topo.
  // "desvio" vai de -0,5 a 0,5 e diz em que ponto da fatia o ponteiro para.
  function anguloFinal(anguloAtual, indice, total, voltas, desvio) {
    const fatia = 360 / total;
    const posicaoNaRoda = (indice + 1 / 2 + desvio) * fatia;
    const destino = girarParaPositivo(-posicaoNaRoda);
    const falta = girarParaPositivo(destino - girarParaPositivo(anguloAtual));
    return anguloAtual + voltas * 360 + falta;
  }

  // Qual fatia está sob o ponteiro do topo para um ângulo de giro.
  function indiceNoPonteiro(angulo, total) {
    return Math.floor(girarParaPositivo(-angulo) / (360 / total)) % total;
  }

  // Fatias vizinhas nunca repetem cor, inclusive a última com a primeira.
  function corDaFatia(indice, total, quantidadeCores) {
    const fechaIgual = total > 1 && indice === total - 1 && indice % quantidadeCores === 0;
    return fechaIgual && quantidadeCores > 2 ? 1 : indice % quantidadeCores;
  }

  // Diminui a letra até o texto caber; se nem no mínimo couber, corta com reticências.
  // medir(texto, tamanho) sabe a largura real, assim esta função continua pura.
  function encaixarTexto(medir, texto, larguraMax, fonteMax, fonteMin) {
    const larguraNoMaximo = medir(texto, fonteMax);
    const tamanho = larguraNoMaximo <= larguraMax
      ? fonteMax
      : Math.max(fonteMin, Math.floor((fonteMax * larguraMax) / larguraNoMaximo));
    let base = texto;
    let saida = texto;
    while (base.length > 1 && medir(saida, tamanho) > larguraMax) {
      base = base.slice(0, -1);
      saida = base.replace(/\s+$/, '') + '…';
    }
    return { texto: saida, tamanho };
  }

  DR30.Utils = {
    limitar,
    aleatorio,
    inteiroAleatorio,
    formatar,
    normalizarNome,
    chaveDoNome,
    validarNovoNome,
    ordenarAlfabetico,
    desacelerar,
    melhorGrade,
    caixaGirada,
    escolherVencedor,
    anguloFinal,
    indiceNoPonteiro,
    corDaFatia,
    encaixarTexto
  };
})(window.DR30 = window.DR30 || {});
