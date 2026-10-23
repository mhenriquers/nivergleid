
Fase 0, preparação e conteúdo

Essa fase não tem programação, mas é a mais importante. Se o conteúdo não estiver pronto, o resto trava.

Juntar as fotos da sua irmã, escolher as melhores e comprimir cada uma para no máximo 250 KB, em formato webp ou jpg.
Escrever os 30 adjetivos, um por nota, com uma frase curta de exemplo embaixo de cada um.
Agrupar os adjetivos pelas 7 facetas do projeto (jeito de ser, como trata as pessoas, na festa, trabalhando, sozinha, quando criança, defeitos de afeto), para não repetir ideia.
Evitar adjetivos genéricos como "legal" ou "especial", trocar por coisas específicas e verdadeiras, com exemplo real.
Baixar as duas fontes que você vai usar, uma manuscrita para os títulos e adjetivos, uma de máquina de escrever para os textos de apoio, e salvar na pasta de fontes.
Definir as cores dos post-its (papel creme, amarelo, rosa antigo, azul desbotado) e as rotações de cada nota, entre -8 e 8 graus.

Quando terminar a fase 0, me avisa que eu te ajudo a conferir o conteúdo antes de seguir.

Fase 1, esqueleto do projeto

Criar a estrutura de pastas: index.html, css/style.css, js/script.js, img/ e fontes/.
Criar um js/notas.js separado, só com o array das 30 notas, para você editar o conteúdo sem mexer na lógica.
Montar o index.html com as 4 etapas da experiência (abertura, notas, transição e roleta), cada uma como uma seção própria.
Criar o css/style.css com o visual de diário: fundo de papel pautado envelhecido, fita adesiva, post-its, sombras suaves.
Deixar tudo local, sem nenhum CDN externo, para a página não quebrar se a rede da festa falhar.

Fase 2, as 4 etapas da experiência

Etapa 1, abertura: as fotos entram de baixo para cima, uma a uma, com rotação leve e fita adesiva no topo, durando entre 6 e 10 segundos, sem botão de pular.
Etapa 2, notas: um toque em qualquer lugar da tela revela uma nota nova, que vai acumulando com rotação variada e cores diferentes.
Colocar um contador de notas na tela, que some ao chegar na nota 30, com pausa de 2 a 3 segundos antes da transição.
Etapa 3, transição: um giro de página ou fade com textura de papel, bem diferente do toque das notas, para deixar claro que mudou de fase.
Etapa 4, cadastro: campo de texto para digitar nomes, botão de adicionar, lista visível com opção de remover, mínimo de 2 e máximo de 20 nomes.
Roleta: um círculo com os nomes nas fatias, cores de papel e cartolina, botão central "girar" com animação de desaceleração.
Escrever a regra na tela antes do primeiro giro, sem ambiguidade: a pessoa sorteada é quem bebe.
Fogos e confetes subindo após o resultado, usando canvas e limitando a quantidade de partículas para não travar celular antigo.
Botão para girar novamente, mantendo os nomes cadastrados.

Fase 3, testes no celular

Testar no Chrome e no Safari do celular, verificando se não aparece erro no console.
Testar toque rápido e repetido na fase das notas, para garantir que nenhum dos 30 toques se perde.
Testar a roleta com 2 nomes e com 20 nomes, conferindo que nunca sorteia nome vazio e não repete o mesmo resultado duas vezes seguidas com mais de 3 nomes.
Conferir legibilidade em tela de 5 polegadas e em TV espelhada.
Verificar que não tem scroll horizontal, elemento cortado ou texto quebrado.
Testar o fallback: se o JavaScript falhar em algum ponto, a página não pode ficar em branco.

Fase 4, publicação

Criar um repositório público no GitHub e subir todos os arquivos.
Ativar o GitHub Pages no repositório, que gera o link da página.
Abrir o link no celular, com 4G, e cronometrar a abertura, que precisa completar em menos de 10 segundos.
Fazer um teste final completo, do início ao fim, como se fosse na festa.
