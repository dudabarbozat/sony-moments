# Moments — música a partir de uma foto

App que sugere músicas a partir de uma foto: lê o clima da imagem, busca 4 faixas no catálogo do iTunes com prévia de 30 s, gera um cartão compartilhável e abre uma sala para ouvir com amigos.

**Demo:** https://dudabarbozat.github.io/sony-moments/

Proposta do Time 20 para um hackathon da Sony, reconstruída em 2026 como protótipo navegável. Não é um produto oficial da Sony.

## Para quem

Jovens de 15 a 25 anos que ouvem música todo dia e associam momentos da vida a canções.

## Funcionalidades

- **Leitura da foto** no navegador (brilho, cor e contraste) em valência e energia, que definem o clima: euforia, calmaria, tensão ou melancolia.
- **4 sugestões** por gênero escolhido, com capa, prévia, motivo da escolha e link para a música completa.
- **Cartão compartilhável** com a foto e a música, pela Web Share API.
- **Sala com amigos:** fila de prévias, votação para pular, ranking de músicas e artistas e plano premium.

## Stack

Next.js 15 (exportação estática) · React 19 · TypeScript · Canvas

| API | Uso |
|-----|-----|
| [iTunes Search API](https://performance-partners.apple.com/search-api) | Músicas, capas e prévias |

Sem backend e sem chaves de API.

## Como rodar

```bash
npm ci
npm run dev
```

## Limitações do protótipo

Não há reconhecimento de imagem, só regras sobre a foto. Amigos, votos, salas com artistas e pagamentos são simulados. Os dados ficam no navegador.

## Equipe — Time 20

- Eduarda Barboza — marketing e design
- Letícia — UX e design
- Bianca Medeiros — mobile e front-end
- Rodrigo de Araújo — desenvolvimento e negócios

## Licença

Código sob [MIT](LICENSE). Créditos das fotos de exemplo em [CREDITOS.md](CREDITOS.md).
