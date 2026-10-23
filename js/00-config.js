// Constantes do projeto: tempos, limites, paleta, textos e caminho das fotos.
// Mexa aqui para ajustar o ritmo da festa sem tocar na lógica.
(function (DR30) {
  'use strict';

  DR30.Config = {
    // Ordem da experiência; o 08-app.js avança nessa sequência.
    ETAPAS: ['abertura', 'notas', 'transicao', 'roleta'],

    // Fade entre a abertura e as notas (a virada de página tem tempo próprio).
    TROCA_ETAPA_MS: 600,

    FOTOS: {
      PASTA: 'assets/',
      // Em file:// o navegador não consegue listar uma pasta, então os arquivos ficam aqui.
      // A exibição é sempre em ordem alfabética, seja qual for a ordem desta lista.
      ARQUIVOS: [
        'WhatsApp Image 2026-10-23 at 13.00.03 (1).jpeg',
        'WhatsApp Image 2026-10-23 at 13.00.03 (2).jpeg',
        'WhatsApp Image 2026-10-23 at 13.00.03 (3).jpeg',
        'WhatsApp Image 2026-10-23 at 13.00.03 (4).jpeg',
        'WhatsApp Image 2026-10-23 at 13.00.03 (5).jpeg',
        'WhatsApp Image 2026-10-23 at 13.00.03 (6).jpeg',
        'WhatsApp Image 2026-10-23 at 13.00.03 (7).jpeg',
        'WhatsApp Image 2026-10-23 at 13.00.03.jpeg'
      ],
      // Largura dividida pela altura da moldura; as fotos atuais são retrato (904x1280).
      PROPORCAO_MOLDURA: 0.78
    },

    ABERTURA: {
      DURACAO_TOTAL_MS: 7500, // a especificação pede entre 6 e 10 segundos
      DURACAO_MIN_MS: 6000,
      DURACAO_MAX_MS: 10000,
      ATRASO_INICIAL_MS: 400, // o título aparece sozinho antes da primeira foto
      ENTRADA_FOTO_MS: 900,
      PAUSA_FINAL_MS: 1300, // mural completo parado antes de seguir
      ROTACAO_MAX_GRAUS: 3,
      DESLOCAMENTO_MAX: 0.06, // fração da foto, para o mural não ficar alinhado demais
      OCUPACAO_CELULA: 0.9 // quanto da célula da grade a foto ocupa
    },

    NOTAS: {
      // Barra o disparo duplo de um mesmo encostar de dedos; a especificação aceita até 120 ms.
      TRAVA_TOQUE_MS: 100,
      PAUSA_FINAL_MS: 2500, // entre 2 e 3 segundos depois da última nota
      ENTRADA_MS: 320,
      ROTACAO_MAX_GRAUS: 8,
      FONTE_MIN_PX: 18, // piso ao encolher adjetivo comprido demais para a nota
      // Reserva para nota sem cor válida: creme, amarelo, rosa antigo, azul desbotado.
      CORES_RESERVA: ['#f4ecd8', '#f7e6a2', '#f3c9c9', '#cddcea']
    },

    TRANSICAO: {
      DURACAO_MS: 800, // virada de página, entre 600 e 900 ms
      DURACAO_REDUZIDA_MS: 600 // com movimento reduzido vira um fade simples
    },

    ROLETA: {
      MIN_NOMES: 2,
      MAX_NOMES: 20,
      NOME_MAX_CARACTERES: 20,
      MIN_PARA_NAO_REPETIR: 4, // a partir daqui o último sorteado não sai duas vezes seguidas
      GIRO_MS: 4000,
      GIRO_REDUZIDO_MS: 1500,
      VOLTAS_MIN: 5,
      VOLTAS_MAX: 7,
      VOLTAS_REDUZIDO: 1,
      MARGEM_FATIA: 0.15, // o ponteiro nunca para colado na divisa entre duas fatias
      DPR_MAX: 2, // teto de densidade do canvas para não pesar em celular antigo
      RESULTADO_FONTE_MIN_PX: 28,
      // Papel e cartolina; fatias vizinhas nunca repetem cor.
      CORES: ['#f4ecd8', '#f7e6a2', '#f3c9c9', '#cddcea', '#d9e4c5', '#dcc29a', '#ebc7ad'],
      COR_TEXTO: '#2f2a26',
      COR_DIVISA: 'rgba(47, 42, 38, 0.28)',
      COR_BORDA: '#a7845a',
      COR_VAZIA: '#efe4c9',
      DIVISAS_VAZIA: 8, // riscos de enfeite na roleta ainda sem nomes
      TRACO_RAIO: 0.04,
      BORDA_RAIO: 0.04, // espessura da borda de cartolina, em fração do raio
      DIVISA_RAIO: 0.008,
      TEXTO_INICIO_RAIO: 0.3, // o nome começa depois do botão central
      TEXTO_MARGEM_RAIO: 0.07,
      TEXTO_REFERENCIA_RAIO: 0.5, // a altura da fatia nesse ponto define o tamanho da letra
      TEXTO_OCUPACAO: 0.75,
      FONTE_MAX_RAIO: 0.15,
      FONTE_MIN_RAIO: 0.075,
      FONTE_PESO: '700'
    },

    CONFETE: {
      MAX_PARTICULAS: 120, // teto duro de partículas vivas ao mesmo tempo
      DPR_MAX: 1.5,
      PASSO_MAX_S: 0.05, // evita salto quando a aba volta do segundo plano
      // Física em frações da altura da tela, para ficar igual no celular e na TV.
      GRAVIDADE: 1.5,
      QUEDA_MAX: 0.22, // confete cai devagar, como papel
      ARRASTO_LATERAL: 1.2,
      CORES: ['#e0b13a', '#d65a5a', '#5b8fd1', '#6cb784', '#b4475a', '#f7e6a2', '#f3c9c9'],
      NORMAL: { CONFETES_POR_LADO: 28, FOGUETES: 3, FAISCAS: 22, INTERVALO_FOGUETE_MS: 450 },
      REDUZIDO: { CONFETES_POR_LADO: 10, FOGUETES: 0, FAISCAS: 0, INTERVALO_FOGUETE_MS: 0 },
      CONFETE_SUBIDA: [0.45, 0.85], // quanto da tela o confete sobe
      CONFETE_ANGULO_GRAUS: 72, // inclinação do lançamento a partir do chão
      CONFETE_ABERTURA_GRAUS: 14,
      CONFETE_TAMANHO_PX: [7, 12],
      CONFETE_PROPORCAO: 0.5,
      CONFETE_VIDA_S: 3.4,
      BALANCO_PX: 30,
      BALANCO_HZ: 1.4,
      GIRO_MAX: 9,
      FOGUETE_FAIXA_X: [0.2, 0.8],
      FOGUETE_SUBIDA: [0.55, 0.8],
      FOGUETE_GRAVIDADE: 1.2,
      FOGUETE_RASTRO_PX: [2, 9],
      FAISCA_VELOCIDADE: [0.22, 0.42],
      FAISCA_GRAVIDADE: 0.35,
      FAISCA_ARRASTO: 1.6,
      FAISCA_VIDA_S: 1.1,
      FAISCA_TAMANHO_PX: 3,
      ESMAECER_S: 0.6, // fade no fim da vida de cada partícula
      MARGEM_PX: 40
    },

    TEXTOS: {
      FOTO_ALT: 'Foto {numero} de {total}',
      CONTADOR_NOTAS: '{atual}/{total}',
      CONTADOR_NOMES: '{total}/{max} nomes',
      NOME_VAZIO: 'Escreve um nome antes de adicionar.',
      NOME_DUPLICADO: '"{nome}" já está na roleta.',
      NOME_LIMITE: 'Chegou no limite de {max} nomes.',
      NOME_ADICIONADO: '{nome} entrou na roleta.',
      NOME_REMOVIDO: '{nome} saiu da roleta.',
      REMOVER: 'remover {nome}',
      FALTAM_NOMES: 'Adicione pelo menos {min} nomes para girar.',
      GIRANDO: 'Girando...',
      ERRO_NOTAS_AUSENTE: 'O arquivo notas.js não carregou ou tem erro de digitação (confira vírgulas, aspas e colchetes).',
      ERRO_NOTAS_FORMATO: 'O notas.js precisa ter a lista no formato const NOTAS = [ ... ];',
      ERRO_NOTAS_VAZIA: 'A lista NOTAS do notas.js está vazia.',
      ERRO_NOTAS_INVALIDAS: 'Nenhuma nota do notas.js tem o adjetivo preenchido.',
      ERRO_MODULO: 'Um arquivo da pasta js/ não carregou ({modulo}). Confira se todos os arquivos foram copiados.',
      ERRO_INESPERADO: 'Algo travou nesta parte da página.',
      PULAR_ETAPA: 'pular para a próxima parte',
      PULAR_PARA_ROLETA: 'ir direto para a roleta'
    }
  };
})(window.DR30 = window.DR30 || {});
