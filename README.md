# De repente, 30

Página de aniversário em 4 etapas: abertura com fotos, 30 notas reveladas a cada toque,
virada de página e a roleta do brinde. HTML, CSS e JavaScript puro, sem internet,
sem instalação e sem servidor.

## Como abrir

Dê dois cliques no `index.html`. Funciona direto do arquivo (`file://`) e também no GitHub Pages.

## Onde mexer

| Quero mudar...                   | Arquivo                                     |
|----------------------------------|---------------------------------------------|
| Texto, cor ou rotação das notas  | `notas.js` (só o que está entre aspas e os números) |
| Fotos da abertura                | pasta `assets/` **e** a lista `FOTOS.ARQUIVOS` em `js/00-config.js` |
| Tempos (abertura, pausa final, virada, giro) | `js/00-config.js`               |
| Limites (mínimo e máximo de nomes, trava de toque) | `js/00-config.js`         |
| Mensagens de aviso e de erro     | `js/00-config.js`, bloco `TEXTOS`           |
| Cores da roleta e do confete     | `js/00-config.js`, blocos `ROLETA` e `CONFETE` |
| Cores do papel, tinta, fita, tamanhos | `css/01-tokens.css`                    |
| Fontes                           | pasta `fontes/` + TODO no topo de `css/01-tokens.css` |
| Título, regra e textos fixos     | `index.html`                                |

**Fotos:** o navegador não consegue listar uma pasta quando abre por `file://`,
por isso cada foto nova precisa entrar também na lista `FOTOS.ARQUIVOS`.
A ordem de exibição é sempre alfabética. Foto que falhar ao carregar é ignorada.

## Mapa do código

```
index.html            as 4 seções, na ordem
notas.js              array NOTAS (conteúdo, não é lógica)
css/01-tokens.css     variáveis de cor, fonte, tamanho e camada
css/02-base.css       reset e o papel pautado
css/03-layout.css     posição das seções e quem aparece em cada etapa
css/04-componentes.css foto, fita, post-it, cartão, botão, campo, lista
css/05-etapas.css     visual exclusivo de cada etapa
css/06-animacoes.css  keyframes e versão com movimento reduzido
js/00-config.js       constantes (tempos, limites, paleta, textos, fotos)
js/01-utils.js        funções puras (sorteio, ângulo, grade, validação)
js/02-state.js        estado único da aplicação
js/03-abertura.js     etapa 1
js/04-notas.js        etapa 2 (lê o NOTAS do notas.js da raiz)
js/05-transicao.js    etapa 3
js/06-roleta-disco.js desenho da roleta em canvas
js/06-roleta-cadastro.js cadastro de nomes; tocar num nome pede confirmação para tirar
js/06-roleta.js       etapa 4: giro e resultado
js/07-confetti.js     confete e fogos em canvas (máximo 120 partículas)
js/08-app.js          inicialização, troca de etapa e painel de erro
```

Cada arquivo JS registra um módulo no objeto global `DR30`. As etapas não se chamam
entre si: avisam o `DR30.App` quando terminam e guardam dados em `DR30.Estado`.

## Publicar no GitHub Pages

1. Suba todos os arquivos para um repositório público.
2. Em *Settings → Pages*, escolha a branch principal e a pasta raiz.
3. Abra o link gerado no celular, em 4G, e cronometre a abertura (precisa ficar abaixo de 10 s).
