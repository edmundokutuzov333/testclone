# Kufy

Kufy is an original music discovery and playback interface. It uses its own name, visual language, mock catalogue and CSS-generated artwork. It is inspired by familiar music-player conventions, but does not use Spotify source code, branding or artwork.

## Start locally

Requirements: Node.js 22 or newer and npm.

\`\`\`bash
npm install
npm run dev
\`\`\`

Create a production bundle with \`npm run build\`. Run domain tests with \`npm test\`.

## What works in this prototype

- Responsive home, search, library, artist, album and playlist views.
- Search by track, artist and album, with accent-insensitive matching.
- Demo audio playback, pause/resume, previous/next, seek, volume, shuffle and repeat.
- Track queue, recently played history and favourite tracks.
- Create playlists and add catalogue tracks to them.
- Follow artists, profile display, settings panel and keyboard shortcuts.
- Local persistence for favourites, playlists, follow state, recent history and display name.
- Independently authored red/dark UI and CSS-generated cover art.

## Demo versus production

This repository currently contains a frontend prototype, not a complete commercial streaming service. The catalogue metadata is fictional. The audio URLs point to public SoundHelix example streams and are only used to demonstrate the player; they are not Kufy's licensed music catalogue and availability depends on the remote host and network.

Login/profile is a local UI demonstration, not secure authentication. The Plus panel does not charge money. Offline downloads, licensed lyrics, real subscriptions, music rights, search indexing, cloud accounts, synchronisation between devices, recommendations backed by listening events, podcast ingestion, content moderation and production analytics are not implemented as backend services. Do not collect real passwords or payment details in this prototype.

## Architecture

- \`src/data.ts\`: typed demo catalogue and curated collections.
- \`src/domain/music.ts\`: pure music search, ordering, time-formatting and storage helpers.
- \`src/App.tsx\`: application composition and interactive UI state.
- \`src/styles.css\`: responsive Kufy design system.
- \`src/domain/music.test.ts\`: focused domain tests.

The implementation follows a few REA-inspired engineering principles: shared behavior at a clear boundary, typed contracts for catalogue entities, explicit handling of unavailable data, persistence isolated behind helpers, and tests for deterministic domain functions. REA is a reverse-engineering toolkit, not a turnkey music-service backend.

## Production roadmap

1. Add a real backend, schema migrations, secure authentication and server-side authorization.
2. Integrate a licensed catalogue/provider and a server-side playback entitlement layer.
3. Build user, playlist, follow, history and library APIs; validate ownership on every write.
4. Integrate a payment provider only after product, legal and subscription terms are defined.
5. Add accessible player states, errors, observability, abuse controls, privacy/consent flows and end-to-end tests.
6. Verify deployment and CI in the actual target environment before describing the service as production-ready.

## Rights and identity

Kufy is a separate project. Do not present it as Spotify, use Spotify's logo or copy its proprietary assets. Only publish audio, artwork, lyrics and artist data for which you have permission.
