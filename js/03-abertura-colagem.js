// Etapa 1, colagem: calcula tamanho e posição de cada foto na tela.
// Não decide quando as fotos aparecem; isso é do 03-abertura.js.
(function (DR30) {
  'use strict';

  const C = DR30.Config;
  const U = DR30.Utils;

  // Divide a área em regiões (uma por foto); a foto fica maior que a região
  // para formar uma colagem que cobre a tela toda.
  function medir(mural, total) {
    const estilo = window.getComputedStyle(document.documentElement);
    const borda = {
      lado: parseFloat(estilo.getPropertyValue('--foto-borda')) || 0,
      base: parseFloat(estilo.getPropertyValue('--foto-borda-base')) || 0
    };
    const largura = mural.clientWidth;
    const altura = mural.clientHeight;
    const grade = U.melhorGrade(total, largura, altura, proporcaoDaMoldura(C.FOTOS.PROPORCAO_PADRAO, borda));
    return {
      largura,
      altura,
      borda,
      grade,
      total,
      caixaX: grade.largura * C.ABERTURA.ESCALA_FOTO,
      caixaY: grade.altura * C.ABERTURA.ESCALA_FOTO
    };
  }

  // A borda branca é mais grossa embaixo; a moldura soma a foto e as bordas.
  function proporcaoDaMoldura(proporcaoFoto, borda) {
    return 1 / ((1 - 2 * borda.lado) / proporcaoFoto + borda.lado + borda.base);
  }

  // Põe a foto perto do centro da região sorteada dela, com o desvio e o giro guardados.
  function posicionar(area, foto) {
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
    const naLinha = Math.min(grade.colunas, area.total - linha * grade.colunas);
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

  DR30.AberturaColagem = { medir, posicionar };
})(window.DR30 = window.DR30 || {});
