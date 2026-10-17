export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  cover: string;
  coverImage: string;
  spotifyUri: string;
  explicit?: boolean;
  opensCollection?: boolean;
}

export interface MusicPlaylist {
  id: string;
  title: string;
  description: string;
  cover: string;
  coverImage: string;
  trackIds: string[];
  owner?: string;
  isCustom?: boolean;
}

const art = {
  travisBirds: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e028752a7355996e64709247c53",
  travisAstroworld: "https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02daec894c14c0ca42d76eeb32",
  travisUtopia: "https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e0204481c826dd292e5e4983b3f",
  matue: "https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02a602766a53a1827a4b5ed315",
  laylizzy: "https://image-cdn-ak.spotifycdn.com/image/ab6761610000f17873756c4fe202826dee316e7e",
  dygo: "https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e020ee913cd0dc5a932310940a3",
};

export const tracks: Track[] = [
  { id: "t01", title: "goosebumps", artist: "Travis Scott", album: "Birds in the Trap Sing McKnight", duration: 243, cover: "art-01", coverImage: art.travisBirds, spotifyUri: "spotify:track:6gBFPUFcJLzWGx4lenP6h2", explicit: true },
  { id: "t02", title: "FE!N", artist: "Travis Scott, Playboi Carti", album: "UTOPIA", duration: 191, cover: "art-03", coverImage: art.travisUtopia, spotifyUri: "spotify:track:42VsgItocQwOQC3XWZ8JNA", explicit: true },
  { id: "t03", title: "SICKO MODE", artist: "Travis Scott", album: "ASTROWORLD", duration: 312, cover: "art-04", coverImage: art.travisAstroworld, spotifyUri: "spotify:track:2xLMifQCjDGFmkHkpNLD9h", explicit: true },
  { id: "t04", title: "Máquina do Tempo", artist: "Matuê", album: "Máquina do Tempo", duration: 230, cover: "art-05", coverImage: art.matue, spotifyUri: "spotify:track:5oI9blwsXC8AkTWw6wASY8", explicit: true },
  { id: "t05", title: "A Morte do Autotune", artist: "Matuê", album: "A Morte do Autotune", duration: 216, cover: "art-05", coverImage: art.matue, spotifyUri: "spotify:track:1qyiBNYS01TjMkmoeTLJXN", explicit: true },
  { id: "t06", title: "Antes", artist: "Matuê", album: "Máquina do Tempo", duration: 169, cover: "art-05", coverImage: art.matue, spotifyUri: "spotify:track:2XymTaHTrQWDEuSyhfZvqF", explicit: true },
  { id: "t07", title: "Vampiro", artist: "Matuê, WIU, Teto", album: "Vampiro", duration: 250, cover: "art-05", coverImage: art.matue, spotifyUri: "spotify:track:6bTdZ7xfKp3NqqADJ8HLyj", explicit: true },
  { id: "t08", title: "AURA", artist: "Laylizzy", album: "AURA", duration: 178, cover: "art-13", coverImage: art.laylizzy, spotifyUri: "spotify:track:3W3WIePnlxbxfZBVZJnItM", explicit: true },
  { id: "t09", title: "Benção", artist: "Laylizzy, Nicko Journey", album: "No Fears Mixtape", duration: 162, cover: "art-13", coverImage: art.laylizzy, spotifyUri: "spotify:track:7943cCPiPzFExDwzk0vyJ2", explicit: true },
  { id: "t10", title: "PRETO DIFERENTE", artist: "Laylizzy", album: "Flor De Lis", duration: 223, cover: "art-13", coverImage: art.laylizzy, spotifyUri: "spotify:artist:7b2v2a92dpEbW4PJUSQCml", opensCollection: true },
  { id: "t11", title: "Teus Passos", artist: "Dygo Boy, Mark Exodus", album: "Frescolândia (Vol. 01)", duration: 235, cover: "art-08", coverImage: art.dygo, spotifyUri: "spotify:track:1Dn6sMtoJIpBgQIgPmMGUQ" },
  { id: "t12", title: "Busy", artist: "Dygo Boy, Laylizzy", album: "Frescolândia (Vol. 01)", duration: 181, cover: "art-08", coverImage: art.dygo, spotifyUri: "spotify:album:2LUHWbiMbIUFhhiuUtrV10", opensCollection: true },
];

export const playlists: MusicPlaylist[] = [
  { id: "p01", title: "R&B depois da meia-noite", description: "Melodias lentas, luz baixa e espaço para respirar.", cover: "art-13", coverImage: art.laylizzy, trackIds: ["t08", "t09", "t01"] },
  { id: "p02", title: "Trap sem travões", description: "Graves pesados e energia de palco.", cover: "art-03", coverImage: art.travisUtopia, trackIds: ["t02", "t03", "t01", "t04", "t05"] },
  { id: "p03", title: "Daqui para o mundo", description: "As vozes de Maputo ao lado dos nomes globais.", cover: "art-08", coverImage: art.dygo, trackIds: ["t11", "t12", "t08", "t04", "t02"] },
  { id: "p04", title: "Matuê: essencial", description: "Os sons que definem a viagem do Tuê.", cover: "art-05", coverImage: art.matue, trackIds: ["t04", "t05", "t06", "t07"] },
  { id: "p05", title: "Travis Scott: essencial", description: "Do ASTROWORLD à UTOPIA.", cover: "art-04", coverImage: art.travisAstroworld, trackIds: ["t01", "t03", "t02"] },
  { id: "p06", title: "Kufy Selects: Lusofonia", description: "Rap e trap em português, com identidade própria.", cover: "art-13", coverImage: art.laylizzy, trackIds: ["t08", "t09", "t10", "t11", "t12", "t04"] },
];

export const artists = [
  { id: "a01", name: "Travis Scott", description: "Trap · Houston, EUA", cover: "art-01", coverImage: art.travisBirds, monthlyListeners: "Trap · Houston, EUA", spotifyUri: "spotify:artist:0Y5tJX1MQlPlqiwlOH1tJY" },
  { id: "a02", name: "Matuê", description: "Trap brasileiro · Fortaleza", cover: "art-05", coverImage: art.matue, monthlyListeners: "Trap brasileiro · Fortaleza", spotifyUri: "spotify:artist:5nP8x4uEFjAAmDzwOEc9b8" },
  { id: "a03", name: "Laylizzy", description: "Hip-hop · Maputo", cover: "art-13", coverImage: art.laylizzy, monthlyListeners: "Hip-hop · Maputo", spotifyUri: "spotify:artist:7b2v2a92dpEbW4PJUSQCml" },
  { id: "a04", name: "Dygo Boy", description: "Hip-hop · Moçambique", cover: "art-08", coverImage: art.dygo, monthlyListeners: "Hip-hop · Moçambique", spotifyUri: "spotify:album:2LUHWbiMbIUFhhiuUtrV10" },
];

export const genres = [
  { title: "Trap global", cover: "art-03", tone: "genre-red", coverImage: art.travisUtopia },
  { title: "Trap brasileiro", cover: "art-05", tone: "genre-coral", coverImage: art.matue },
  { title: "Hip-hop moçambicano", cover: "art-08", tone: "genre-orange", coverImage: art.dygo },
  { title: "Rap lusófono", cover: "art-13", tone: "genre-violet", coverImage: art.laylizzy },
];