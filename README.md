# Kufy

Kufy é uma experiência independente de descoberta musical construída com React, TypeScript e Vite. O visual usa uma identidade editorial própria, tons escuros, vermelho-carmim, capas oficiais do catálogo e animações discretas.

## Executar localmente

Requisitos: Node.js 22 ou superior e npm.

~~~bash
npm install
npm run dev
~~~

Build de produção: **npm run build**. Testes: **npm test**.

## Funcionalidades desta versão

- Página inicial, pesquisa, biblioteca, artistas, álbuns e playlists.
- Catálogo com temas de Travis Scott, Matuê, Laylizzy e Dygo Boy.
- Leitor oficial do Spotify através da iFrame Embed API.
- Pesquisa por música, artista e álbum, incluindo pesquisa sem acentos.
- Favoritos, histórico, criação de playlists e seguimento de artistas.
- Leitor flutuante, fila, atalhos de teclado e definições.
- Identidade visual própria, capas de catálogo, layouts adaptáveis e animações com suporte a preferência por movimento reduzido.
- Pipeline GitHub Actions com testes de domínio e build de produção.

## Catálogo musical e direitos

O Kufy não aloja, descarrega nem serve ficheiros de áudio protegidos por direitos de autor. A reprodução é fornecida pelo leitor oficial do Spotify. A disponibilidade depende do Spotify, da conta do ouvinte e da região.

Algumas entradas apontam para a página oficial de artista ou de álbum quando não foi possível verificar uma URL de faixa individual durante a preparação do catálogo. Essas entradas estão identificadas no leitor como catálogo do Spotify, para o utilizador seleccionar a faixa pretendida.

As imagens apontam para o CDN de capas do Spotify. O Kufy não reivindica os direitos sobre as gravações, nomes artísticos ou imagens. Antes de uma publicação comercial, confirma os termos actuais do Spotify e obtém as permissões necessárias.

## Arquitectura

- src/data.ts: catálogo tipado, capas oficiais e playlists seleccionadas.
- src/domain/music.ts: pesquisa, ordenação, formatação de tempo e persistência local.
- src/components/SpotifyPlayer.tsx: integração isolada com a iFrame Embed API do Spotify.
- src/App.tsx: composição das páginas, estado e navegação.
- src/styles.css: design tokens, componentes, layouts responsivos e animações.
- src/domain/music.test.ts: testes de domínio e contrato do catálogo.
- .github/workflows/ci.yml: instalação, testes e build.

As colecções e preferências do utilizador continuam locais neste protótipo. Autenticação real, sincronização na nuvem, letras licenciadas, pagamentos, subscrições, downloads offline e recomendações de produção ainda exigem serviços de backend.
