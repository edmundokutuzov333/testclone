export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  cover: string;
  audioUrl: string;
  explicit?: boolean;
}

export interface MusicPlaylist {
  id: string;
  title: string;
  description: string;
  cover: string;
  trackIds: string[];
  owner?: string;
  isCustom?: boolean;
}

const demoAudio = [
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
];

export const tracks: Track[] = [
  { id: "t01", title: "Cidade em Chamas", artist: "Mila Vento", album: "Depois da Meia-Noite", duration: 218, cover: "art-01", audioUrl: demoAudio[0] },
  { id: "t02", title: "Sem Pressa", artist: "Nuno Sol", album: "Frequência Baixa", duration: 194, cover: "art-02", audioUrl: demoAudio[1] },
  { id: "t03", title: "Vermelho Neon", artist: "Luma", album: "Vermelho Neon", duration: 207, cover: "art-03", audioUrl: demoAudio[2] },
  { id: "t04", title: "Maputo às 2", artist: "Dário K", album: "Linha da Frente", duration: 231, cover: "art-04", audioUrl: demoAudio[3], explicit: true },
  { id: "t05", title: "Outra Margem", artist: "Maya C", album: "Entre Nós", duration: 202, cover: "art-05", audioUrl: demoAudio[4] },
  { id: "t06", title: "Fica Mais", artist: "Léo Mar", album: "Frequência Baixa", duration: 185, cover: "art-06", audioUrl: demoAudio[5] },
  { id: "t07", title: "Sem Sinal", artist: "Nia Luz", album: "Sem Sinal", duration: 221, cover: "art-07", audioUrl: demoAudio[6] },
  { id: "t08", title: "Poeira de Ouro", artist: "Dário K", album: "Linha da Frente", duration: 199, cover: "art-08", audioUrl: demoAudio[7] },
  { id: "t09", title: "Até Amanhã", artist: "Mila Vento", album: "Depois da Meia-Noite", duration: 214, cover: "art-09", audioUrl: demoAudio[2] },
  { id: "t10", title: "Maré Cheia", artist: "Léo Mar", album: "Maré Cheia", duration: 243, cover: "art-10", audioUrl: demoAudio[4] },
  { id: "t11", title: "Ponto de Fuga", artist: "Nia Luz", album: "Sem Sinal", duration: 188, cover: "art-11", audioUrl: demoAudio[5] },
  { id: "t12", title: "Luzes da Baixa", artist: "Nuno Sol", album: "Frequência Baixa", duration: 226, cover: "art-12", audioUrl: demoAudio[6] },
  { id: "t13", title: "Só Mais Uma", artist: "Luma", album: "Vermelho Neon", duration: 201, cover: "art-13", audioUrl: demoAudio[1] },
  { id: "t14", title: "Perto do Mar", artist: "Maya C", album: "Entre Nós", duration: 216, cover: "art-14", audioUrl: demoAudio[7] },
  { id: "t15", title: "No Meu Tempo", artist: "Mila Vento", album: "Depois da Meia-Noite", duration: 196, cover: "art-15", audioUrl: demoAudio[0] },
  { id: "t16", title: "Pulso", artist: "Dário K", album: "Linha da Frente", duration: 209, cover: "art-16", audioUrl: demoAudio[3], explicit: true },
];

export const playlists: MusicPlaylist[] = [
  { id: "p01", title: "Pôr do Sol", description: "Canções para abrandar e deixar o dia terminar.", cover: "art-05", trackIds: ["t05", "t10", "t14", "t02", "t06"] },
  { id: "p02", title: "Pulso Urbano", description: "Batidas novas, energia e ruas acesas.", cover: "art-04", trackIds: ["t04", "t08", "t16", "t03", "t13"] },
  { id: "p03", title: "Noite Vermelha", description: "Para quando a cidade ainda não dormiu.", cover: "art-03", trackIds: ["t03", "t01", "t09", "t07", "t11"] },
  { id: "p04", title: "Modo Foco", description: "Ritmo constante para manter a concentração.", cover: "art-12", trackIds: ["t12", "t02", "t06", "t15", "t05"] },
  { id: "p05", title: "Novas Vozes", description: "Descobre artistas que merecem o teu ouvido.", cover: "art-07", trackIds: ["t07", "t11", "t05", "t13", "t10"] },
  { id: "p06", title: "Essencial Kufy", description: "Uma primeira viagem pelo universo Kufy.", cover: "art-08", trackIds: ["t01", "t02", "t03", "t04", "t05", "t06", "t07"] },
];

export const artists = [
  { id: "a01", name: "Mila Vento", description: "Pop alternativo", cover: "art-09", monthlyListeners: "24,8 mil ouvintes mensais" },
  { id: "a02", name: "Nuno Sol", description: "Neo-soul", cover: "art-12", monthlyListeners: "18,2 mil ouvintes mensais" },
  { id: "a03", name: "Luma", description: "Electropop", cover: "art-13", monthlyListeners: "31,4 mil ouvintes mensais" },
  { id: "a04", name: "Dário K", description: "Hip-hop alternativo", cover: "art-04", monthlyListeners: "42,1 mil ouvintes mensais" },
  { id: "a05", name: "Maya C", description: "R&B", cover: "art-14", monthlyListeners: "13,7 mil ouvintes mensais" },
  { id: "a06", name: "Léo Mar", description: "Indie e electrónica", cover: "art-10", monthlyListeners: "16,9 mil ouvintes mensais" },
  { id: "a07", name: "Nia Luz", description: "Afro-fusion", cover: "art-11", monthlyListeners: "28,6 mil ouvintes mensais" },
];

export const genres = [
  { title: "Pop alternativo", cover: "art-13", tone: "genre-coral" },
  { title: "Hip-hop", cover: "art-04", tone: "genre-red" },
  { title: "R&B e soul", cover: "art-05", tone: "genre-violet" },
  { title: "Eletrónica", cover: "art-03", tone: "genre-orange" },
  { title: "Afro-fusion", cover: "art-11", tone: "genre-green" },
  { title: "Indie", cover: "art-10", tone: "genre-blue" },
];