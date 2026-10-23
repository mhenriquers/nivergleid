// js/notas.js
// 30 notas do "De Repente 30".
// Regra: edite apenas o texto entre aspas. Não mexa na estrutura.

const NOTAS = [
  // Faceta 1, jeito de ser no dia a dia
  {
    adjetivo: "Pavio curto",
    frase: "Perde a paciência em três segundos e recupera em cinco, o que é quase bonito de ver.",
    cor: "#f7e6a2",
    rotacao: -6
  },
  {
    adjetivo: "Organizada",
    frase: "Tem planilha pra tudo, inclusive uma planilha pra decidir onde almoçar.",
    cor: "#cddcea",
    rotacao: 4
  },
  {
    adjetivo: "Teimosa",
    frase: "Se você disser que está frio, ela sai de manga curta só pra provar o contrário.",
    cor: "#f3c9c9",
    rotacao: -3
  },
  {
    adjetivo: "Ansiosa",
    frase: "Compra o presente de Natal em agosto e passa quatro meses segurando a ansiedade.",
    cor: "#d9e4c5",
    rotacao: 7
  },
  {
    adjetivo: "Econômica",
    frase: "Pesquisa preço em cinco sites diferentes pra economizar três reais.",
    cor: "#f4ecd8",
    rotacao: -8
  },

  // Faceta 2, como ela trata as pessoas
  {
    adjetivo: "Abrigo",
    frase: "Quem passa aperto na família liga pra ela primeiro, até quem já devia saber se virar sozinho.",
    cor: "#f3c9c9",
    rotacao: 5
  },
  {
    adjetivo: "Conselheira",
    frase: "Escuta o problema inteiro antes de falar, e o conselho vem com solução, não com pena.",
    cor: "#f7e6a2",
    rotacao: -5
  },
  {
    adjetivo: "Persuasiva",
    frase: "Convence qualquer pessoa a fazer o que ela já tinha decidido que era o certo.",
    cor: "#cddcea",
    rotacao: 8
  },
  {
    adjetivo: "Generosa",
    frase: "Divide o último pedaço, mas cobra juros emocionais por uns dez anos.",
    cor: "#f4ecd8",
    rotacao: -2
  },

  // Faceta 3, na festa, depois de beber
  {
    adjetivo: "Eufórica",
    frase: "Duas doses e ela vira DJ, segurança e mestre de cerimônias ao mesmo tempo.",
    cor: "#f3c9c9",
    rotacao: -7
  },
  {
    adjetivo: "Confidente",
    frase: "Depois da terceira, conta pra festa inteira um segredo que ela jurou guardar.",
    cor: "#f7e6a2",
    rotacao: 3
  },
  {
    adjetivo: "Dançarina",
    frase: "Não sabe a coreografia, mas convence a pista de que sabe.",
    cor: "#d9e4c5",
    rotacao: 6
  },
  {
    adjetivo: "Insistente",
    frase: "Oferece a última rodada pra todo mundo e não aceita não como resposta.",
    cor: "#cddcea",
    rotacao: -4
  },

  // Faceta 4, trabalhando e resolvendo problema
  {
    adjetivo: "Resolvedora",
    frase: "Resolve em oito minutos um problema que a família arrasta há três anos.",
    cor: "#f4ecd8",
    rotacao: 2
  },
  {
    adjetivo: "Criteriosa",
    frase: "Revisa o e-mail três vezes antes de enviar e acha o erro logo depois de enviado.",
    cor: "#f3c9c9",
    rotacao: -8
  },
  {
    adjetivo: "Líder",
    frase: "Assume o comando de qualquer grupo em dois minutos, com ou sem convite.",
    cor: "#f7e6a2",
    rotacao: 5
  },
  {
    adjetivo: "Incansável",
    frase: "Diz que vai parar de trabalhar às seis, e às onze ainda está só terminando uma coisinha.",
    cor: "#cddcea",
    rotacao: -3
  },

  // Faceta 5, quando ninguém está vendo
  {
    adjetivo: "Chorona",
    frase: "Chora com comercial de margarina e depois nega que chorou.",
    cor: "#d9e4c5",
    rotacao: 7
  },
  {
    adjetivo: "Discreta",
    frase: "Ajuda sem contar pra ninguém, e fica brava quando descobrem.",
    cor: "#f4ecd8",
    rotacao: -5
  },
  {
    adjetivo: "Nostálgica",
    frase: "Guarda ingresso de cinema de 2011, mas não sabe onde colocou o documento de identidade.",
    cor: "#f3c9c9",
    rotacao: 4
  },
  {
    adjetivo: "Perfeccionista",
    frase: "Refaz o bolo três vezes pra ninguém perceber que não precisava refazer nenhuma.",
    cor: "#f7e6a2",
    rotacao: -6
  },

  // Faceta 6, criança e adolescente
  {
    adjetivo: "Curiosa",
    frase: "Mexia em toda gaveta da casa e ainda entregava quem também tinha mexido.",
    cor: "#cddcea",
    rotacao: 8
  },
  {
    adjetivo: "Dramática",
    frase: "Aos treze, achava que nenhum ser humano tinha sofrido tanto por causa de uma nota oito.",
    cor: "#f3c9c9",
    rotacao: -2
  },
  {
    adjetivo: "Cantora",
    frase: "Cantava no chuveiro como se o chuveiro fosse plateia paga.",
    cor: "#d9e4c5",
    rotacao: 6
  },
  {
    adjetivo: "Estudiosa",
    frase: "Estudava escondido e depois jurava que não tinha estudado nada.",
    cor: "#f4ecd8",
    rotacao: -7
  },

  // Faceta 7, defeitos que são motivo de afeto
  {
    adjetivo: "Mandona",
    frase: "Manda na vida de todo mundo, inclusive na de quem não pediu opinião nenhuma.",
    cor: "#f7e6a2",
    rotacao: 3
  },
  {
    adjetivo: "Atrasada",
    frase: "Marca às sete da noite, chega às sete e quarenta, e culpa o trânsito num sábado.",
    cor: "#cddcea",
    rotacao: -5
  },
  {
    adjetivo: "Fofoqueira",
    frase: "Sabe da vida de todo mundo antes de todo mundo saber que tem vida.",
    cor: "#f3c9c9",
    rotacao: 7
  },
  {
    adjetivo: "Exagerada",
    frase: "Uma dor de cabeça vira ressonância magnética na hora de contar a história.",
    cor: "#d9e4c5",
    rotacao: -4
  },
  {
    adjetivo: "Insubstituível",
    frase: "Tem defeito pra caramba, mas ninguém aqui trocaria por uma versão mais comportada.",
    cor: "#f7e6a2",
    rotacao: 2
  }
];