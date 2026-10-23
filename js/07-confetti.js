// Confetes e fogos num único canvas. Nunca passa de MAX_PARTICULAS vivas,
// usa requestAnimationFrame e limpa o canvas quando a última partícula some.
(function (DR30) {
  'use strict';

  const C = DR30.Config.CONFETE;
  const U = DR30.Utils;
  const GRAU = Math.PI / 180;
  const particulas = [];
  let canvas = null;
  let ctx = null;
  let largura = 0;
  let altura = 0;
  let densidade = 1;
  let agenda = [];
  let quadro = 0;
  let inicio = 0;
  let ultimo = 0;

  function preparar(elemento) {
    canvas = elemento;
    ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
  }

  function dimensionar() {
    densidade = Math.min(window.devicePixelRatio || 1, C.DPR_MAX);
    largura = canvas.clientWidth;
    altura = canvas.clientHeight;
    canvas.width = Math.round(largura * densidade);
    canvas.height = Math.round(altura * densidade);
  }

  function disparar(reduzido) {
    if (!ctx) return;
    parar();
    dimensionar();
    const perfil = reduzido ? C.REDUZIDO : C.NORMAL;
    lancarConfetes(perfil.CONFETES_POR_LADO, 1); // canto de baixo à esquerda
    lancarConfetes(perfil.CONFETES_POR_LADO, -1); // canto de baixo à direita
    for (let i = 0; i < perfil.FOGUETES; i += 1) {
      agenda.push({ quando: i * perfil.INTERVALO_FOGUETE_MS, faiscas: perfil.FAISCAS });
    }
    inicio = window.performance.now();
    ultimo = inicio;
    quadro = window.requestAnimationFrame(passo);
  }

  // Teto duro: partícula nova só entra se houver vaga.
  function adicionar(particula) {
    if (particulas.length < C.MAX_PARTICULAS) particulas.push(particula);
  }

  function lancarConfetes(quantidade, lado) {
    const gravidade = C.GRAVIDADE * altura;
    for (let i = 0; i < quantidade; i += 1) {
      const angulo = (C.CONFETE_ANGULO_GRAUS + U.aleatorio(-C.CONFETE_ABERTURA_GRAUS, C.CONFETE_ABERTURA_GRAUS)) * GRAU;
      // Velocidade para subir a fração sorteada da tela: v = raiz(2 · g · h).
      const subida = U.aleatorio(C.CONFETE_SUBIDA[0], C.CONFETE_SUBIDA[1]) * altura;
      const velocidade = Math.sqrt(2 * gravidade * subida) / Math.sin(angulo);
      adicionar({
        tipo: 'confete',
        x: lado > 0 ? 0 : largura,
        y: altura,
        vx: Math.cos(angulo) * velocidade * lado,
        vy: -Math.sin(angulo) * velocidade,
        tamanho: U.aleatorio(C.CONFETE_TAMANHO_PX[0], C.CONFETE_TAMANHO_PX[1]),
        giro: U.aleatorio(0, Math.PI * 2),
        velocidadeGiro: U.aleatorio(-C.GIRO_MAX, C.GIRO_MAX),
        fase: U.aleatorio(0, Math.PI * 2),
        cor: C.CORES[i % C.CORES.length],
        idade: 0,
        vida: C.CONFETE_VIDA_S
      });
    }
  }

  function lancarFoguete(faiscas) {
    const gravidade = C.FOGUETE_GRAVIDADE * altura;
    const subida = U.aleatorio(C.FOGUETE_SUBIDA[0], C.FOGUETE_SUBIDA[1]) * altura;
    adicionar({
      tipo: 'foguete',
      x: U.aleatorio(C.FOGUETE_FAIXA_X[0], C.FOGUETE_FAIXA_X[1]) * largura,
      y: altura,
      vx: 0,
      vy: -Math.sqrt(2 * gravidade * subida),
      gravidade,
      faiscas,
      cor: C.CORES[U.inteiroAleatorio(0, C.CORES.length - 1)],
      idade: 0,
      vida: Infinity
    });
  }

  // O foguete estoura no topo da subida em um anel de faíscas, até onde houver vaga.
  function explodir(foguete) {
    const total = Math.min(foguete.faiscas, C.MAX_PARTICULAS - particulas.length);
    for (let i = 0; i < total; i += 1) {
      const angulo = (Math.PI * 2 * i) / total;
      const velocidade = U.aleatorio(C.FAISCA_VELOCIDADE[0], C.FAISCA_VELOCIDADE[1]) * altura;
      adicionar({
        tipo: 'faisca',
        x: foguete.x,
        y: foguete.y,
        vx: Math.cos(angulo) * velocidade,
        vy: Math.sin(angulo) * velocidade,
        cor: foguete.cor,
        idade: 0,
        vida: C.FAISCA_VIDA_S
      });
    }
  }

  function atualizar(dt) {
    for (let i = particulas.length - 1; i >= 0; i -= 1) {
      const p = particulas[i];
      p.idade += dt;
      if (p.tipo === 'foguete') {
        p.vy += p.gravidade * dt;
        p.y += p.vy * dt;
        if (p.vy >= 0) {
          particulas.splice(i, 1);
          explodir(p);
        }
        continue;
      }
      if (p.tipo === 'confete') {
        // Sobe rápido e desce devagar balançando, como papel picado.
        p.vy = Math.min(p.vy + C.GRAVIDADE * altura * dt, C.QUEDA_MAX * altura);
        p.vx *= Math.exp(-C.ARRASTO_LATERAL * dt);
        p.fase += C.BALANCO_HZ * Math.PI * 2 * dt;
        p.x += (p.vx + Math.sin(p.fase) * C.BALANCO_PX) * dt;
        p.giro += p.velocidadeGiro * dt;
      } else {
        const freio = Math.exp(-C.FAISCA_ARRASTO * dt);
        p.vx *= freio;
        p.vy = p.vy * freio + C.FAISCA_GRAVIDADE * altura * dt;
        p.x += p.vx * dt;
      }
      p.y += p.vy * dt;
      if (p.idade >= p.vida || p.y > altura + C.MARGEM_PX) particulas.splice(i, 1);
    }
  }

  function desenhar() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particulas.forEach((p) => {
      ctx.globalAlpha = p.vida === Infinity ? 1 : U.limitar((p.vida - p.idade) / C.ESMAECER_S, 0, 1);
      ctx.fillStyle = p.cor;
      if (p.tipo === 'confete') {
        // Gira no plano e "vira de lado" achatando na vertical, sem save/restore por partícula.
        const cosseno = Math.cos(p.giro) * densidade;
        const seno = Math.sin(p.giro) * densidade;
        const achatado = Math.cos(p.fase);
        ctx.setTransform(cosseno, seno, -seno * achatado, cosseno * achatado, p.x * densidade, p.y * densidade);
        ctx.fillRect(-p.tamanho / 2, (-p.tamanho * C.CONFETE_PROPORCAO) / 2, p.tamanho, p.tamanho * C.CONFETE_PROPORCAO);
        return;
      }
      ctx.setTransform(densidade, 0, 0, densidade, 0, 0);
      if (p.tipo === 'foguete') {
        const rastro = C.FOGUETE_RASTRO_PX;
        ctx.fillRect(p.x - rastro[0] / 2, p.y, rastro[0], rastro[1]);
      } else {
        const lado = C.FAISCA_TAMANHO_PX;
        ctx.fillRect(p.x - lado / 2, p.y - lado / 2, lado, lado);
      }
    });
    ctx.globalAlpha = 1;
  }

  function passo(agora) {
    try {
      const dt = U.limitar((agora - ultimo) / 1000, 0, C.PASSO_MAX_S);
      ultimo = agora;
      while (agenda.length && agora - inicio >= agenda[0].quando) lancarFoguete(agenda.shift().faiscas);
      atualizar(dt);
      desenhar();
      if (particulas.length || agenda.length) quadro = window.requestAnimationFrame(passo);
      else parar();
    } catch (erro) {
      parar(); // é enfeite: se der problema, some sem atrapalhar o resultado
    }
  }

  function parar() {
    window.cancelAnimationFrame(quadro);
    quadro = 0;
    particulas.length = 0;
    agenda = [];
    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  DR30.Confetti = { preparar, disparar, parar };
})(window.DR30 = window.DR30 || {});
