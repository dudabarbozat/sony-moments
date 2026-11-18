# sony-moments

Protótipo web de um app que sugere músicas a partir de uma foto. A foto é lida no navegador por regras sobre brilho, cor e contraste; as 4 músicas vêm de buscas reais no catálogo público do iTunes, com capa e prévia de 30 s. A pessoa ouve, gera um cartão compartilhável com a foto e a música e abre uma sala com amigos, com fila, votação para pular e ranking.

Demo: https://dudabarbozat.github.io/sony-moments/

Portfólio pessoal. Projeto criado entre 2020 e 2023 e reimplementado em 2026 com Next.js e APIs públicas.

## Contexto

Sony Moments foi a proposta do Time 20 para um hackathon da Sony. Este protótipo não é um produto oficial da Sony. A interface usa o nome do projeto e o símbolo desenhado pela equipe (círculo com onda sonora), sem o logotipo da Sony.

Problema apresentado: o Brasil é o 10º mercado de música do mundo, mas poucas pessoas pagam por streaming, e o real desvalorizado pesa no preço da assinatura. A pergunta era como fazer músicas circularem e criar um vínculo emocional que leve a pessoa a pagar.

Proposta original:

- A pessoa envia uma foto. Um serviço de análise de imagem (IBM Watson) cruza o resultado com o gosto musical dela e com a valence (positividade) das faixas, obtida pela API do Spotify, e devolve 4 sugestões.
- A foto é compartilhada junto com a música; os amigos ouvem pelo app.
- Premium: sala musical com amigos tocando a playlist gerada, votação para pular faixa (pagando, dá para anular a votação), ranking de músicas e artistas e ingressos para salas com artistas.
- Stack prevista: React Native, Python, IBM Watson, API do Spotify.
- Modelo de receita: anúncios na versão gratuita, assinatura premium, porcentagem dos pagamentos de votação e porcentagem dos ingressos.

Equipe (Time 20):

- Eduarda Barboza (marketing e design)
- Letícia (UX e design)
- Bianca Medeiros (desenvolvimento mobile e front-end)
- Rodrigo de Araújo (desenvolvimento e negócios)

Números usados no pitch:

| Dado | Valor |
|------|-------|
| Pesquisa | 184 respostas |
| Faixa etária | cerca de 90% entre 15 e 25 anos |
| Frequência | 80% ouvem música todo dia |
| Pagamento de streaming | não pago 48.9% |
| Memória afetiva | 90% associam momentos da vida a músicas |
| Mercado | US$ 298,8 milhões |
| Crescimento | expansão de 15,4% |

## O protótipo

Telas (navegação inferior igual à do mockup do pitch: início, câmera ao centro, amigos):

- `/`: foto do aparelho ou uma das 6 cenas de exemplo (fotos reais do Wikimedia Commons), 2 ou 3 gêneros e "Analisar foto". Orientação curta na primeira visita.
- `/momento/`: clima da foto (euforia, calmaria, tensão, melancolia), valência e energia num quadro 2x2, as medidas da foto, as 4 músicas com capa, prévia de 30 s, motivo e link para a música completa. Ação principal: criar sala.
- `/cartao/`: reprodução da tela de compartilhamento do mockup. Cartão 1080 x 976 desenhado em canvas com a foto, o play, a capa e o nome da música e o convite. Compartilha o PNG pela Web Share API; onde o navegador não aceita arquivo, baixa o PNG e copia o convite.
- `/creditos/`: autor, licença e página de origem de cada foto de exemplo.
- `/sala/`: prévias tocando em sequência, votação para pular (6 pessoas, 4 votos pulam), opção paga de segurar a música, plano premium (sem anúncio e com ingressos), ranking de músicas e artistas da sala e salas com artistas.

Estados de carregando (esqueleto), vazio e erro em todas as telas. Estado salvo em `localStorage`; "Restaurar dados de exemplo" no rodapé limpa tudo.

Visual: segue o pitch. Cores medidas por conta-gotas nos slides e no mockup (`#331732`, `#4b2d49`, `#6d4a6b`, `#b492b5`, `#efdeef`, `#c7d3dd` do símbolo, magenta `#df23bc`, gradiente `#9a198e` a `#c723a6`, barra inferior `#261125`). Tipografia: Montserrat (títulos, como nos slides), Poppins (interface, como no mockup) e Aileron (rótulos). O símbolo foi redesenhado em SVG a partir do slide de capa; o nome aparece em texto. Ícones de redes sociais do mockup viraram opções genéricas e os tons de baixo contraste do mockup foram clareados para atingir AA.

## Stack

- Next.js 15.5.28 (App Router, `output: "export"`), React 19.1.10, TypeScript 5.8.3 em modo estrito.
- CSS Modules e `globals.css` com os tokens da identidade.
- Fontes: Montserrat e Poppins via `next/font/google`; Aileron via `@fontsource/aileron` 5.2.5.
- Cenas de exemplo: 6 fotos do [Wikimedia Commons](https://commons.wikimedia.org/) (CC BY e CC BY-SA), redimensionadas e convertidas para WebP em `public/img/cenas/` e servidas pelo próprio site, o que permite a leitura por canvas sem CORS. A foto é carregada ao tocar na cena, com estado de carregando e de erro. Créditos em [CREDITOS.md](CREDITOS.md) e na rota `/creditos/`.
- Sem backend. Site estático no GitHub Pages.

## API

| API | Endereço | Chave | Uso |
|-----|----------|-------|-----|
| [iTunes Search API](https://performance-partners.apple.com/search-api) | `https://itunes.apple.com/search` | não | músicas, capas, gênero primário, ano, duração e prévia de 30 s |

A API responde com CORS liberado; se o `fetch` falhar por rede, o app tenta JSONP (`callback`), que a própria API oferece. Cada busca tem limite de 8 s e fica em cache na sessão. Capas e prévias são exibidas a partir dos servidores da Apple, como resultado de busca, sem download ou redistribuição. O limite é de cerca de 20 buscas por minuto; ao estourar, ou sem conexão, o app avisa e usa um catálogo reserva fictício, sem áudio.

## Como a foto vira música

1. Leitura no navegador: médias de luminância, saturação, diferença vermelho-azul e desvio de luminância viram valência e energia por pesos fixos, e o par define o clima (euforia, calmaria, tensão, melancolia). Não há reconhecimento de imagem; a interface diz isso.
2. Busca: para cada gênero marcado, uma busca no iTunes com o nome do gênero e uma palavra do clima (por exemplo "samba alegria"). Entram só resultados com prévia, os do gênero primário escolhido primeiro, no máximo uma música por artista.
3. Motivo: cada música recebe uma frase montada por regras que combinam o traço mais marcante da foto (cores quentes ou frias, luz, saturação, contraste), o clima, o gênero primário devolvido pelo iTunes (e se ele está entre os marcados ou veio só da busca), o ano de lançamento e a duração. O modelo de frase e o traço da foto variam entre as 4 músicas.

## O que é simulado

- Amigos da sala, votos dos amigos (0 a 3 por música, em momentos fixos da prévia), salas com artistas e ingressos.
- Pagamentos (segurar música, premium, ingressos) não acontecem; só alteram o estado local.
- O ranking é local: música ouvida até o fim soma 2 pontos, pulada perde 1.
- O link de playlist do cartão segue o formato do mockup e não abre nada; o convite copiado usa o link real da música no catálogo.

## Como rodar

```
npm ci
npm run dev
```

Acessar http://localhost:3000/. Para gerar o site estático: `npm run build` (saída em `out/`). Checagem de tipos: `npm run typecheck`.

## Publicação

O workflow `.github/workflows/pages.yml` roda a cada push na `main`: instala com `npm ci`, gera o build com `NEXT_PUBLIC_BASE_PATH=/sony-moments` e publica a pasta `out` no GitHub Pages. No repositório, em Settings > Pages, a fonte deve ser "GitHub Actions".

## Estrutura

```
.
├── .github/workflows/pages.yml
├── CREDITOS.md              créditos das fotos de exemplo
├── next.config.ts
├── package.json
├── public/
│   ├── .nojekyll
│   └── img/
│       ├── simbolo.svg      símbolo do projeto
│       └── cenas/           fotos das cenas de exemplo (WebP)
└── src/
    ├── app/
    │   ├── layout.tsx       fontes, provedores e moldura do app
    │   ├── globals.css      tokens da identidade
    │   ├── icon.svg         favicon
    │   ├── page.tsx         foto
    │   ├── momento/         resultado
    │   ├── cartao/          cartão compartilhável
    │   ├── creditos/        créditos das fotos
    │   └── sala/            sala musical
    ├── components/          telas, Shell, linha de música, ícones
    └── lib/
        ├── analise.ts       leitura da foto
        ├── cenas.ts         cenas de exemplo: arquivo, autor, licença e página no Commons
        ├── cartao.ts        desenho e exportação do cartão
        ├── dados.ts         gêneros, palavras de clima, amigos, salas e catálogo reserva
        ├── estado.tsx       estado e localStorage
        ├── itunes.ts        busca com timeout, cache e JSONP
        ├── player.tsx       áudio das prévias
        └── recomendar.ts    leitura → buscas → 4 músicas e motivos
```

## Licença

MIT. Ver [LICENSE](LICENSE).
