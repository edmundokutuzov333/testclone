import {
  Keyboard,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Disc3,
  Heart,
  Headphones,
  Home,
  Library,
  ListMusic,
  LogIn,
  Menu,
  Mic2,
  MonitorSpeaker,
  MoreHorizontal,
  Music2,
  Pause,
  Play,
  Plus,
  Radio,
  Repeat2,
  Search,
  Settings2,
  Share2,
  Trash2,
  Shuffle,
  SkipBack,
  SkipForward,
  UserRound,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, FormEvent, ReactNode } from "react";
import { artists, genres, playlists, tracks } from "./data";
import SpotifyPlayer, { type SpotifyEmbedController, type SpotifyPlaybackState } from "./components/SpotifyPlayer";
import type { MusicPlaylist, Track } from "./data";
import {
  formatTime,
  getTracks,
  insertAfterCurrent,
  moveId,
  normalizeText,
  readStored,
  readStoredIds,
  readStoredPlaylists,
  searchTracks,
  spotifyUriToWebUrl,
  toggleId,
  validArtistIds,
  validTrackIds,
  writeStored,
} from "./domain/music";

type View = "home" | "search" | "library" | "liked" | "recent" | "playlist" | "artist" | "album";
type Modal = null | "create-playlist" | "add-to-playlist" | "track-menu" | "delete-playlist" | "account" | "premium" | "settings" | "queue" | "lyrics" | "devices" | "spotify-player";
type LibraryFilter = "Tudo" | "Playlists" | "Artistas" | "Álbuns";

function CoverArt({ cover, image, large = false, rounded = false }: { cover: string; image?: string; large?: boolean; rounded?: boolean }) {
  return (
    <div className={["cover-art", cover, large ? "cover-large" : "", rounded ? "cover-rounded" : "", image ? "cover-has-image" : ""].filter(Boolean).join(" ")}>
      {image ? <img className="cover-photo" src={image} alt="" loading="lazy" decoding="async" /> : <span className="cover-mark" aria-hidden="true">K</span>}
      <span className="cover-glow" aria-hidden="true" />
    </div>
  );
}

function SectionHeading({ title, subtitle, action, onAction }: { title: string; subtitle?: string; action?: string; onAction?: () => void }) {
  return (
    <div className="section-heading">
      <div>
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {action ? <button className="text-action" onClick={onAction}>{action}<ChevronRight size={15} /></button> : null}
    </div>
  );
}

function IconButton({ label, active = false, onClick, children, className = "" }: { label: string; active?: boolean; onClick: () => void; children: ReactNode; className?: string }) {
  return (
    <button type="button" className={["icon-button", active ? "is-active" : "", className].filter(Boolean).join(" ")} aria-label={label} title={label} onClick={onClick}>
      {children}
    </button>
  );
}

function EmptyState({ icon, title, description, action, onAction }: { icon: ReactNode; title: string; description: string; action?: string; onAction?: () => void }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && onAction ? <button className="button button-light" onClick={onAction}>{action}</button> : null}
    </div>
  );
}

export default function App() {
  const [activeView, setActiveView] = useState<View>("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [libraryFilter, setLibraryFilter] = useState<LibraryFilter>("Tudo");
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [likedIds, setLikedIds] = useState<string[]>(() => readStoredIds("kufy:likes", [], validTrackIds));
  const [recentIds, setRecentIds] = useState<string[]>(() => readStoredIds("kufy:recent", [], validTrackIds));
  const [customPlaylists, setCustomPlaylists] = useState<MusicPlaylist[]>(() => readStoredPlaylists("kufy:playlists", validTrackIds));
  const [followingIds, setFollowingIds] = useState<string[]>(() => readStoredIds("kufy:following", [], validArtistIds));
  const [queueIds, setQueueIds] = useState<string[]>(() => readStoredIds("kufy:queue", [], validTrackIds));
  const [selectedPlaylistId, setSelectedPlaylistId] = useState("p01");
  const [selectedArtistName, setSelectedArtistName] = useState("Travis Scott");
  const [selectedAlbumName, setSelectedAlbumName] = useState("Máquina do Tempo");
  const [modal, setModal] = useState<Modal>(null);
  const [playlistName, setPlaylistName] = useState("");
  const [pendingTrack, setPendingTrack] = useState<Track | null>(null);
  const [accountEmail, setAccountEmail] = useState("");
  const [displayName, setDisplayName] = useState<string | null>(() =>
    readStored("kufy:displayName", null, (value): value is string | null => value === null || typeof value === "string"),
  );
  const [isSignup, setIsSignup] = useState(false);
  const [searchType, setSearchType] = useState<"Tudo" | "Músicas" | "Artistas" | "Playlists">("Tudo");
  const [notice, setNotice] = useState("");
  const [explicitContent, setExplicitContent] = useState<boolean>(() =>
    readStored("kufy:explicitContent", true, (value): value is boolean => typeof value === "boolean"),
  );
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [librarySearch, setLibrarySearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const [spotifyController, setSpotifyController] = useState<SpotifyEmbedController | null>(null);

  const handleSpotifyController = useCallback((controller: SpotifyEmbedController | null) => {
    setSpotifyController(controller);
  }, []);
  const handleSpotifyPlaybackState = useCallback((state: SpotifyPlaybackState) => {
    setCurrentTime(state.position);
    setDuration(state.duration || currentTrack?.duration || 0);
    setIsPlaying(!state.isPaused);
  }, [currentTrack?.duration]);
  const handleSpotifyError = useCallback((message: string) => {
    setIsPlaying(false);
    setNotice(message);
  }, []);

  const allPlaylists = useMemo(() => [...playlists, ...customPlaylists], [customPlaylists]);
  const currentPlaylist = allPlaylists.find((playlist) => playlist.id === selectedPlaylistId);
  const availableTracks = useMemo(() => explicitContent ? tracks : tracks.filter((track) => !track.explicit), [explicitContent]);
  const likedTracks = useMemo(() => getTracks(likedIds, availableTracks), [likedIds, availableTracks]);
  const recentTracks = useMemo(() => getTracks(recentIds, availableTracks), [recentIds, availableTracks]);
  const searchedTracks = useMemo(() => searchTracks(availableTracks, searchQuery), [availableTracks, searchQuery]);
  const artistTracks = useMemo(() => availableTracks.filter((track) => track.artist === selectedArtistName), [availableTracks, selectedArtistName]);
  const albumTracks = useMemo(() => availableTracks.filter((track) => track.album === selectedAlbumName), [availableTracks, selectedAlbumName]);
  const queueTracks = useMemo(() => getTracks(queueIds, availableTracks), [queueIds, availableTracks]);
  const playlistTracks = useMemo(() => getTracks(currentPlaylist?.trackIds ?? [], availableTracks), [currentPlaylist, availableTracks]);
  const greeting = new Date().getHours() < 12 ? "Bom dia" : new Date().getHours() < 19 ? "Boa tarde" : "Boa noite";

  useEffect(() => writeStored("kufy:likes", likedIds), [likedIds]);
  useEffect(() => writeStored("kufy:recent", recentIds), [recentIds]);
  useEffect(() => writeStored("kufy:playlists", customPlaylists), [customPlaylists]);
  useEffect(() => writeStored("kufy:following", followingIds), [followingIds]);
  useEffect(() => writeStored("kufy:queue", queueIds), [queueIds]);
  useEffect(() => writeStored("kufy:explicitContent", explicitContent), [explicitContent]);
  useEffect(() => writeStored("kufy:displayName", displayName), [displayName]);


  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
        setActiveView("search");
      } else if (!typing && event.code === "Space") {
        event.preventDefault();
        if (!currentTrack) {
          playTrack(tracks[0], tracks);
        } else if (spotifyController) {
          if (isPlaying) spotifyController.pause();
          else spotifyController.play();
        } else {
          setModal("spotify-player");
        }
      } else if (!typing && event.code === "ArrowRight" && spotifyController) {
        spotifyController.seek(Math.floor(currentTime + 5));
      } else if (!typing && event.code === "ArrowLeft" && spotifyController) {
        spotifyController.seek(Math.max(0, Math.floor(currentTime - 5)));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentTrack, currentTime, isPlaying, spotifyController]);

  useEffect(() => {
    if (!explicitContent && currentTrack?.explicit) {
      setIsPlaying(false);
      setCurrentTrack(null);
      setModal(null);
      setNotice("A reprodução foi interrompida porque o conteúdo explícito está desactivado.");
    }
  }, [explicitContent, currentTrack]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 3600);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  function goTo(view: View) {
    setActiveView(view);
    setShowMobileNav(false);
    if (view !== "search") setSearchQuery("");
  }

  function closeModal() {
    if (modal === "spotify-player") {
      setSpotifyController(null);
      setIsPlaying(false);
      setCurrentTime(0);
    }
    setModal(null);
  }

  function playTrack(track: Track, source: Track[] = tracks) {
    const sourceIds = [...new Set((source.length ? source : [track]).map((item) => item.id))];
    const trackIndex = sourceIds.indexOf(track.id);
    const orderedIds = trackIndex < 0
      ? [track.id, ...sourceIds]
      : [...sourceIds.slice(trackIndex), ...sourceIds.slice(0, trackIndex)];
    setQueueIds(orderedIds);
    setCurrentTrack(track);
    setCurrentTime(0);
    setDuration(track.duration);
    setIsPlaying(false);
    setModal("spotify-player");
    setRecentIds((current) => toggleId(current, track.id).slice(0, 30));
  }

  function togglePlayback() {
    if (!currentTrack) {
      playTrack(tracks[0], tracks);
      return;
    }
    if (spotifyController) {
      if (isPlaying) spotifyController.pause();
      else spotifyController.play();
    } else {
      setModal("spotify-player");
    }
  }

  function playNext() {
    if (!currentTrack) {
      playTrack(tracks[0], tracks);
      return;
    }
    if (repeat && spotifyController) {
      spotifyController.seek(0);
      spotifyController.play();
      setCurrentTime(0);
      return;
    }
    const queue = queueTracks.length ? queueTracks : availableTracks;
    const index = queue.findIndex((track) => track.id === currentTrack.id);
    if (shuffle && queue.length > 1) {
      const candidates = queue.filter((track) => track.id !== currentTrack.id);
      const next = candidates[Math.floor(Math.random() * candidates.length)];
      if (next) playTrack(next, queue);
      return;
    }
    const nextIndex = index < 0 ? 0 : (index + 1) % queue.length;
    playTrack(queue[nextIndex], queue);
  }

  function playPrevious() {
    if (!currentTrack) return;
    if (spotifyController && currentTime > 3) {
      spotifyController.seek(0);
      setCurrentTime(0);
      return;
    }
    const queue = queueTracks.length ? queueTracks : availableTracks;
    const index = queue.findIndex((track) => track.id === currentTrack.id);
    const previousIndex = index < 0 ? queue.length - 1 : (index - 1 + queue.length) % queue.length;
    playTrack(queue[previousIndex], queue);
  }

  function toggleLike(track: Track) {
    const exists = likedIds.includes(track.id);
    setLikedIds((current) => toggleId(current, track.id));
    setNotice(exists ? "Removida das músicas favoritas" : "Adicionada às músicas favoritas");
  }

  function addTrackToQueue(track: Track) {
    if (queueIds.includes(track.id)) {
      setNotice("Esta faixa já está na fila");
      return;
    }
    setQueueIds((current) => current.includes(track.id) ? current : [...current, track.id]);
    setNotice("Adicionada à fila");
  }

  function queueTrackNext(track: Track) {
    setQueueIds((current) => insertAfterCurrent(current, track.id, currentTrack?.id ?? null));
    setModal(null);
    setNotice("A faixa será reproduzida a seguir");
  }

  function removeQueuedTrack(trackId: string) {
    if (trackId === currentTrack?.id) return;
    setQueueIds((current) => current.filter((id) => id !== trackId));
    setNotice("Faixa removida da fila");
  }

  function moveQueuedTrack(trackId: string, direction: -1 | 1) {
    setQueueIds((current) => {
      const currentIndex = currentTrack ? current.indexOf(currentTrack.id) : -1;
      const minimumIndex = currentIndex >= 0 ? currentIndex + 1 : 0;
      return moveId(current, trackId, direction, minimumIndex);
    });
  }

  function removeTrackFromPlaylist(playlistId: string, track: Track) {
    setCustomPlaylists((current) => current.map((playlist) =>
      playlist.id === playlistId
        ? { ...playlist, trackIds: playlist.trackIds.filter((id) => id !== track.id) }
        : playlist,
    ));
    setNotice("Faixa removida da playlist");
  }

  function deleteSelectedPlaylist() {
    const playlist = customPlaylists.find((item) => item.id === selectedPlaylistId);
    if (!playlist) {
      setModal(null);
      return;
    }
    setCustomPlaylists((current) => current.filter((item) => item.id !== playlist.id));
    setSelectedPlaylistId("p01");
    setActiveView("library");
    setModal(null);
    setNotice("Playlist eliminada deste dispositivo");
  }

  function createPlaylist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanedName = playlistName.trim();
    if (!cleanedName) return;
    const playlist: MusicPlaylist = {
      id: "custom-" + Date.now().toString(36),
      title: cleanedName,
      description: "A tua playlist, feita à tua maneira.",
      cover: pendingTrack?.cover ?? "art-01",
      coverImage: pendingTrack?.coverImage ?? tracks[0].coverImage,
      trackIds: pendingTrack ? [pendingTrack.id] : [],
      owner: displayName || "A tua biblioteca",
      isCustom: true,
    };
    setCustomPlaylists((current) => [playlist, ...current]);
    setSelectedPlaylistId(playlist.id);
    setPlaylistName("");
    setPendingTrack(null);
    setModal(null);
    setActiveView("playlist");
    setNotice("Playlist criada neste dispositivo");
  }

  function addTrackToPlaylist(playlistId: string) {
    if (!pendingTrack) return;
    const targetPlaylist = customPlaylists.find((playlist) => playlist.id === playlistId);
    if (!targetPlaylist) return;
    if (targetPlaylist.trackIds.includes(pendingTrack.id)) {
      setModal(null);
      setPendingTrack(null);
      setNotice("Esta faixa já está na playlist");
      return;
    }
    setCustomPlaylists((current) => current.map((playlist) =>
      playlist.id === playlistId
        ? { ...playlist, trackIds: [...playlist.trackIds, pendingTrack.id] }
        : playlist,
    ));
    setModal(null);
    setNotice("Faixa adicionada à playlist");
    setPendingTrack(null);
  }

  function openCreatePlaylist(track?: Track) {
    setPendingTrack(track ?? null);
    setPlaylistName("");
    setModal("create-playlist");
  }

  function openArtist(artistName: string) {
    const primaryArtist = artistName.split(",")[0].trim();
    setSelectedArtistName(artists.some((artist) => artist.name === artistName) ? artistName : primaryArtist);
    setActiveView("artist");
  }

  function openAlbum(albumName: string) {
    setSelectedAlbumName(albumName);
    setActiveView("album");
  }

  function shareTrack(track: Track) {
    const target = spotifyUriToWebUrl(track.spotifyUri);
    const text = track.title + " · " + track.artist + " | Kufy · " + target;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(
        () => setNotice("Ligação da faixa copiada"),
        () => setNotice(text),
      );
    } else {
      setNotice(text);
    }
  }

  function shareCurrentTrack() {
    if (!currentTrack) {
      setNotice("Selecciona uma faixa para partilhar");
      return;
    }
    shareTrack(currentTrack);
  }

  function submitAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = accountEmail.trim();
    if (!email) return;
    const name = email.split("@")[0].replace(/[._-]+/g, " ").trim();
    setDisplayName(name ? name.replace(/\b\w/g, (letter) => letter.toUpperCase()) : "Ouvinte Kufy");
    setModal(null);
    setAccountEmail("");
    setNotice("Sessão de demonstração iniciada neste dispositivo");
  }

  function renderTrackRows(rows: Track[], queueSource: Track[] = rows, editablePlaylistId?: string) {
    if (!rows.length) {
      return <div className="track-empty">Ainda não existem faixas nesta secção.</div>;
    }
    return (
      <div className="track-table">
        <div className="track-table-head">
          <span className="track-number">#</span>
          <span>Título</span>
          <span>Álbum</span>
          <span><Clock3 size={15} /></span>
        </div>
        {rows.map((track, index) => {
          const isCurrent = currentTrack?.id === track.id;
          return (
            <div className={["track-row", isCurrent ? "track-row-current" : ""].filter(Boolean).join(" ")} key={track.id}>
              <button className="track-number track-play-number" aria-label={"Tocar " + track.title} onClick={() => isCurrent ? togglePlayback() : playTrack(track, queueSource)}>
                {isCurrent && isPlaying ? <span className="equalizer"><i /><i /><i /></span> : isCurrent ? <Play size={15} fill="currentColor" /> : <span>{index + 1}</span>}
              </button>
              <div className="track-main">
                <button className="track-cover-button" onClick={() => isCurrent ? togglePlayback() : playTrack(track, queueSource)} aria-label={"Tocar " + track.title}>
                  <CoverArt cover={track.cover} image={track.coverImage} />
                </button>
                <div className="track-copy">
                  <button className="track-title" onClick={() => playTrack(track, queueSource)}>{track.title}</button>
                  <button className="track-subtitle" onClick={() => openArtist(track.artist)}>{track.artist}</button>
                </div>
              </div>
              <button className="track-album" onClick={() => openAlbum(track.album)}>{track.album}</button>
              <div className="track-actions">
                {editablePlaylistId
                  ? <IconButton label="Remover da playlist" onClick={() => removeTrackFromPlaylist(editablePlaylistId, track)}><X size={16} /></IconButton>
                  : <IconButton label="Adicionar à fila" onClick={() => addTrackToQueue(track)}><Plus size={16} /></IconButton>}
                <IconButton label={likedIds.includes(track.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"} active={likedIds.includes(track.id)} onClick={() => toggleLike(track)}><Heart size={16} fill={likedIds.includes(track.id) ? "currentColor" : "none"} /></IconButton>
                <span className="track-duration">{formatTime(track.duration)}</span>
                <IconButton label="Mais opções" onClick={() => { setPendingTrack(track); setModal("track-menu"); }}><MoreHorizontal size={17} /></IconButton>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function renderPlaylistCards(items: MusicPlaylist[]) {
    return (
      <div className="media-grid playlist-grid">
        {items.map((playlist) => (
          <button key={playlist.id} className="media-card" onClick={() => { setSelectedPlaylistId(playlist.id); setActiveView("playlist"); }}>
            <div className="media-card-cover"><CoverArt cover={playlist.cover} image={playlist.coverImage} /><span className="card-play"><Play size={19} fill="currentColor" /></span></div>
            <span className="media-card-title">{playlist.title}</span>
            <span className="media-card-description">{playlist.description}</span>
          </button>
        ))}
      </div>
    );
  }

  function renderArtistCards() {
    return (
      <div className="media-grid artist-grid">
        {artists.slice(0, 6).map((artist) => (
          <button className="artist-card" key={artist.id} onClick={() => openArtist(artist.name)}>
            <CoverArt cover={artist.cover} image={artist.coverImage} rounded />
            <span className="media-card-title">{artist.name}</span>
            <span className="media-card-description">Artista</span>
          </button>
        ))}
      </div>
    );
  }

  function renderHome() {
    const quickPicks = playlists.slice(0, 6);
    return (
      <>
        <section className="hero-banner">
          <div className="hero-copy">
            <span className="eyebrow"><Disc3 size={14} /> A TUA PRÓXIMA FREQUÊNCIA</span>
            <h1>Música que<br /><em>fica contigo.</em></h1>
            <p>Novas descobertas, vozes próximas e sons que combinam com o teu momento.</p>
            <div className="hero-actions">
              <button className="button button-primary" onClick={() => playTrack(tracks[0], tracks)}><Play size={17} fill="currentColor" /> Começar a ouvir</button>
              <button className="button button-glass" onClick={() => goTo("search")}><Search size={16} /> Explorar sons</button>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="hero-cover-card hero-cover-back"><CoverArt cover={tracks[2].cover} image={tracks[2].coverImage} /></div>
            <div className="hero-cover-card hero-cover-mid"><CoverArt cover={tracks[4].cover} image={tracks[4].coverImage} /></div>
            <div className="hero-cover-card hero-cover-front"><CoverArt cover={tracks[0].cover} image={tracks[0].coverImage} /></div>
            <div className="hero-art-caption"><span>SELECÇÃO 001</span><span>MAPUTO · GLOBAL</span></div>
            <div className="hero-meter"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
          </div>
          <div className="hero-bottom"><span><span className="live-dot" /> Seleção Kufy</span><span>01 / 06</span></div>
        </section>

        <section className="content-section">
          <SectionHeading title={greeting + (displayName ? ", " + displayName.split(" ")[0] : "")} subtitle="Volta ao que te faz sentir." />
          <div className="quick-grid">
            {quickPicks.slice(0, 6).map((playlist) => (
              <button key={playlist.id} className="quick-pick" onClick={() => { setSelectedPlaylistId(playlist.id); setActiveView("playlist"); }}>
                <CoverArt cover={playlist.cover} image={playlist.coverImage} />
                <span>{playlist.title}</span>
                <span className="quick-play"><Play size={17} fill="currentColor" /></span>
              </button>
            ))}
          </div>
        </section>

        <section className="content-section">
          <SectionHeading title="Feito para o teu momento" subtitle="Selecções para dar o tom ao teu dia." action="Ver tudo" onAction={() => goTo("library")} />
          {renderPlaylistCards(playlists.slice(0, 5))}
        </section>

        <section className="content-section">
          <SectionHeading title="Continua a ouvir" subtitle="As tuas últimas viagens sonoras." action="Histórico" onAction={() => goTo("recent")} />
          {recentTracks.length
            ? renderTrackRows(recentTracks.slice(0, 5), recentTracks)
            : <EmptyState icon={<Clock3 size={26} />} title="A tua próxima faixa começa aqui" description="As músicas que reproduzires vão aparecer neste espaço." action="Explorar música" onAction={() => goTo("search")} />}
        </section>

        <section className="content-section">
          <SectionHeading title="Artistas no radar" subtitle="Descobre novas vozes." action="Explorar" onAction={() => { goTo("search"); setSearchType("Artistas"); }} />
          {renderArtistCards()}
        </section>

        <section className="content-section last-section">
          <div className="editorial-banner">
            <div className="editorial-icon"><Radio size={22} /></div>
            <div><span className="eyebrow">KUFY SELECTS</span><h3>O som muda. A tua identidade não.</h3><p>Uma selecção de sons para descobrir algo novo sem perderes o teu estilo.</p></div>
            <button className="button button-light" onClick={() => { setSelectedPlaylistId("p06"); setActiveView("playlist"); }}>Ouvir selecção <ChevronRight size={16} /></button>
          </div>
        </section>
      </>
    );
  }

  function renderSearch() {
    const normalizedQuery = searchQuery.trim();
    const normalizedNeedle = normalizeText(normalizedQuery);
    const matchedPlaylists = allPlaylists.filter((playlist) => normalizeText(playlist.title + " " + playlist.description).includes(normalizedNeedle));
    const matchedArtists = artists.filter((artist) => normalizeText(artist.name).includes(normalizedNeedle));
    return (
      <div className="page-content">
        <SectionHeading title="Explorar" subtitle="Procura uma música, um artista ou um estado de espírito." />
        <div className="search-page-control">
          <Search size={21} />
          <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="O que queres ouvir?" aria-label="Pesquisar no Kufy" autoFocus />
          {searchQuery ? <IconButton label="Limpar pesquisa" onClick={() => setSearchQuery("")}><X size={17} /></IconButton> : <span className="search-hint">Ctrl K</span>}
        </div>
        <div className="filter-pills">
          {(["Tudo", "Músicas", "Artistas", "Playlists"] as const).map((item) => <button className={searchType === item ? "filter-pill selected" : "filter-pill"} key={item} onClick={() => setSearchType(item)}>{item}</button>)}
        </div>
        {!normalizedQuery ? (
          <>
            <SectionHeading title="Explora por universo" subtitle="Escolhe uma frequência para começar." />
            <div className="genre-grid">
              {genres.map((genre) => <button key={genre.title} className={"genre-card " + genre.tone} onClick={() => { setSearchQuery(genre.title.split(" ")[0]); setSearchType("Tudo"); }}><span>{genre.title}</span><CoverArt cover={genre.cover} image={genre.coverImage} /></button>)}
            </div>
            <section className="content-section inset-section"><SectionHeading title="Em destaque" /><>{renderPlaylistCards(playlists.slice(0, 3))}</></section>
          </>
        ) : (
          <div className="search-results">
            {(searchType === "Tudo" || searchType === "Músicas") && <section className="content-section"><SectionHeading title="Músicas" subtitle={searchedTracks.length + " resultados"} />{renderTrackRows(searchedTracks, searchedTracks)}</section>}
            {(searchType === "Tudo" || searchType === "Artistas") && matchedArtists.length > 0 && <section className="content-section"><SectionHeading title="Artistas" />{renderArtistCardsFor(matchedArtists)}</section>}
            {(searchType === "Tudo" || searchType === "Playlists") && matchedPlaylists.length > 0 && <section className="content-section"><SectionHeading title="Playlists" />{renderPlaylistCards(matchedPlaylists)}</section>}
            {searchedTracks.length === 0 && matchedArtists.length === 0 && matchedPlaylists.length === 0 && <EmptyState icon={<Search size={28} />} title="Não encontrámos esse som" description="Experimenta outro título, artista ou palavra." action="Limpar pesquisa" onAction={() => setSearchQuery("")} />}
          </div>
        )}
      </div>
    );
  }

  function renderArtistCardsFor(items: typeof artists) {
    return <div className="media-grid artist-grid">{items.map((artist) => <button className="artist-card" key={artist.id} onClick={() => openArtist(artist.name)}><CoverArt cover={artist.cover} image={artist.coverImage} rounded /><span className="media-card-title">{artist.name}</span><span className="media-card-description">Artista</span></button>)}</div>;
  }

  function renderLibrary() {
    const normalizedLibraryQuery = normalizeText(librarySearch);
    const playlistItems = allPlaylists.filter((item) => normalizeText(item.title).includes(normalizedLibraryQuery));
    const artistItems = artists.filter((artist) => normalizeText(artist.name).includes(normalizedLibraryQuery));
    const albumItems = Array.from(new Map(tracks.filter((track) => normalizeText(track.album).includes(normalizedLibraryQuery)).map((track) => [track.album, track])).values());
    return (
      <div className="page-content">
        <div className="page-heading-row"><div><span className="eyebrow">O TEU ESPAÇO</span><h1>A tua biblioteca</h1><p>Tudo o que guardaste, organizado à tua maneira.</p></div><button className="button button-primary" onClick={() => openCreatePlaylist()}><Plus size={17} /> Criar playlist</button></div>
        <div className="library-toolbar">
          <div className="filter-pills">{(["Tudo", "Playlists", "Artistas", "Álbuns"] as const).map((item) => <button key={item} className={libraryFilter === item ? "filter-pill selected" : "filter-pill"} onClick={() => setLibraryFilter(item)}>{item}</button>)}</div>
          <div className="library-search"><Search size={15} /><input value={librarySearch} onChange={(event) => setLibrarySearch(event.target.value)} placeholder="Filtrar biblioteca" /></div>
        </div>
        {(libraryFilter === "Tudo" || libraryFilter === "Playlists") && <section className="content-section"><SectionHeading title="Playlists" action="Criar nova" onAction={() => openCreatePlaylist()} />{renderPlaylistCards(playlistItems)}</section>}
        {(libraryFilter === "Tudo" || libraryFilter === "Artistas") && <section className="content-section"><SectionHeading title="Artistas seguidos" subtitle={followingIds.length + " seguidos"} />{renderArtistCardsFor(artistItems.filter((artist) => libraryFilter === "Tudo" || followingIds.includes(artist.id)))}</section>}
        {(libraryFilter === "Tudo" || libraryFilter === "Álbuns") && <section className="content-section"><SectionHeading title="Álbuns" />{renderAlbumCardsFor(albumItems)}</section>}
        <section className="content-section"><SectionHeading title="Guardado para ti" /><div className="saved-shortcuts">
          <button onClick={() => goTo("liked")}><span className="saved-icon liked-gradient"><Heart size={20} fill="currentColor" /></span><span><strong>Músicas favoritas</strong><small>{likedIds.length} músicas</small></span><ChevronRight size={17} /></button>
          <button onClick={() => goTo("recent")}><span className="saved-icon"><Clock3 size={20} /></span><span><strong>Ouvido recentemente</strong><small>{recentIds.length} faixas</small></span><ChevronRight size={17} /></button>
        </div></section>
      </div>
    );
  }

  function renderAlbumCardsFor(items: Track[]) {
    return <div className="media-grid playlist-grid">{items.map((track) => <button className="media-card" key={track.album} onClick={() => openAlbum(track.album)}><div className="media-card-cover"><CoverArt cover={track.cover} image={track.coverImage} /><span className="card-play"><Play size={19} fill="currentColor" /></span></div><span className="media-card-title">{track.album}</span><span className="media-card-description">{track.artist} · Álbum</span></button>)}</div>;
  }

  function renderDetailHeader(title: string, description: string, cover: string, label: string, onPlay: () => void, extra?: ReactNode, coverImage?: string) {
    return (
      <div className="detail-hero">
        <CoverArt cover={cover} image={coverImage} large />
        <div className="detail-copy"><span className="eyebrow">{label}</span><h1>{title}</h1><p>{description}</p><div className="detail-meta"><span>Kufy</span><span>·</span><span>Selecção Kufy</span></div><div className="detail-actions"><button className="button button-primary" onClick={onPlay}><Play size={17} fill="currentColor" /> Reproduzir</button>{extra}</div></div>
      </div>
    );
  }

  function renderPlaylistDetail() {
    if (!currentPlaylist) return <EmptyState icon={<ListMusic size={28} />} title="Playlist não encontrada" description="Esta lista pode ter sido removida deste dispositivo." action="Voltar à biblioteca" onAction={() => goTo("library")} />;
    const playlistExtra = currentPlaylist.isCustom
      ? <button className="button button-outline" onClick={() => setModal("delete-playlist")}><Trash2 size={16} /> Eliminar playlist</button>
      : <button className="button button-glass" onClick={shareCurrentTrack}><Share2 size={16} /> Partilhar faixa actual</button>;
    return <div className="page-content detail-page">{renderDetailHeader(currentPlaylist.title, currentPlaylist.description, currentPlaylist.cover, currentPlaylist.isCustom ? "PLAYLIST PESSOAL" : "PLAYLIST KUFY", () => playlistTracks.length && playTrack(playlistTracks[0], playlistTracks), playlistExtra, currentPlaylist.coverImage)}<div className="list-toolbar"><div className="list-toolbar-actions"><IconButton label={shuffle ? "Desactivar aleatório" : "Reprodução aleatória"} active={shuffle} onClick={() => setShuffle((value) => !value)}><Shuffle size={19} /></IconButton>{currentPlaylist.isCustom ? <IconButton label="Adicionar música" onClick={() => { setPendingTrack(null); setModal("add-to-playlist"); }}><Plus size={19} /></IconButton> : null}</div><span>{playlistTracks.length} músicas</span></div>{renderTrackRows(playlistTracks, playlistTracks, currentPlaylist.isCustom ? currentPlaylist.id : undefined)}</div>;
  }

  function renderLiked() {
    return <div className="page-content detail-page">{renderDetailHeader("Músicas favoritas", "As músicas que guardaste para ouvires sempre que quiseres.", "art-liked", "A TUA COLECÇÃO", () => likedTracks.length && playTrack(likedTracks[0], likedTracks))}<div className="list-toolbar"><span>{likedTracks.length} músicas guardadas</span><button className="text-action" onClick={() => { setLikedIds([]); setNotice("Favoritos removidos deste dispositivo"); }}>Limpar favoritos</button></div>{likedTracks.length ? renderTrackRows(likedTracks, likedTracks) : <EmptyState icon={<Heart size={28} />} title="Ainda não guardaste músicas" description="Toca no coração junto a uma faixa para a encontrares aqui." action="Descobrir música" onAction={() => goTo("search")} />}</div>;
  }

  function renderRecent() {
    return <div className="page-content detail-page">{renderDetailHeader("Ouvido recentemente", "Continua de onde a tua última sessão ficou.", "art-12", "O TEU HISTÓRICO", () => recentTracks.length && playTrack(recentTracks[0], recentTracks))}<div className="list-toolbar"><span>{recentTracks.length} faixas no histórico</span><button className="text-action" onClick={() => { setRecentIds([]); setNotice("Histórico limpo neste dispositivo"); }}>Limpar histórico</button></div>{recentTracks.length ? renderTrackRows(recentTracks, recentTracks) : <EmptyState icon={<Clock3 size={28} />} title="O teu histórico está vazio" description="As faixas que ouvires vão aparecer aqui." action="Começar a ouvir" onAction={() => goTo("home")} />}</div>;
  }

  function renderArtist() {
    const artist = artists.find((item) => item.name === selectedArtistName);
    const followed = followingIds.includes(artist?.id ?? "");
    return <div className="page-content detail-page"><div className="artist-detail-hero"><CoverArt cover={artist?.cover ?? "art-04"} image={artist?.coverImage} large rounded /><div className="detail-copy"><span className="eyebrow">ARTISTA</span><h1>{selectedArtistName}</h1><p>{artist?.description ?? "Descobre mais deste artista"}.</p><div className="detail-actions"><button className="button button-primary" onClick={() => artistTracks.length && playTrack(artistTracks[0], artistTracks)}><Play size={17} fill="currentColor" /> Reproduzir</button><button className={followed ? "button button-glass" : "button button-outline"} onClick={() => artist && setFollowingIds((current) => toggleId(current, artist.id))}>{followed ? <Check size={16} /> : <Plus size={16} />}{followed ? "A seguir" : "Seguir"}</button></div></div></div><section className="content-section"><SectionHeading title="Populares" subtitle="Faixas disponíveis através do catálogo oficial." />{renderTrackRows(artistTracks, artistTracks)}</section><section className="content-section"><SectionHeading title="Também podes gostar" />{renderArtistCardsFor(artists.filter((item) => item.name !== selectedArtistName).slice(0, 4))}</section></div>;
  }

  function renderAlbum() {
    return <div className="page-content detail-page">{renderDetailHeader(selectedAlbumName, "Uma colecção de faixas para ouvir do princípio ao fim.", albumTracks[0]?.cover ?? "art-03", "ÁLBUM", () => albumTracks.length && playTrack(albumTracks[0], albumTracks), <button className="button button-glass" onClick={() => { albumTracks.forEach((track) => setLikedIds((current) => current.includes(track.id) ? current : [track.id, ...current])); setNotice("Álbum guardado nos favoritos"); }}><Heart size={16} /> Guardar</button>, albumTracks[0]?.coverImage)}<section className="content-section">{renderTrackRows(albumTracks, albumTracks)}</section></div>;
  }

  function renderMainContent() {
    switch (activeView) {
      case "home": return renderHome();
      case "search": return renderSearch();
      case "library": return renderLibrary();
      case "liked": return renderLiked();
      case "recent": return renderRecent();
      case "playlist": return renderPlaylistDetail();
      case "artist": return renderArtist();
      case "album": return renderAlbum();
      default: return renderHome();
    }
  }

  return (
    <div className="app-shell">
      <aside className={["sidebar", showMobileNav ? "sidebar-open" : ""].join(" ")}>
        <div className="brand-row"><button className="brand-lockup" onClick={() => goTo("home")} aria-label="Kufy, início"><span className="brand-symbol">K</span><span className="brand-word">kufy<span>.</span></span></button><IconButton label="Fechar navegação" className="mobile-close" onClick={() => setShowMobileNav(false)}><X size={19} /></IconButton></div>
        <nav className="primary-nav" aria-label="Navegação principal">
          <button className={activeView === "home" ? "nav-link nav-active" : "nav-link"} onClick={() => goTo("home")}><Home size={19} />Início</button>
          <button className={activeView === "search" ? "nav-link nav-active" : "nav-link"} onClick={() => goTo("search")}><Search size={19} />Pesquisar<span className="nav-shortcut">⌘ K</span></button>
          <button className={activeView === "library" ? "nav-link nav-active" : "nav-link"} onClick={() => goTo("library")}><Library size={19} />A tua biblioteca</button>
        </nav>
        <div className="sidebar-divider" />
        <div className="sidebar-section-head"><span>A TUA COLECÇÃO</span><IconButton label="Criar playlist" onClick={() => openCreatePlaylist()}><Plus size={19} /></IconButton></div>
        <nav className="collection-nav" aria-label="A tua colecção">
          <button className={activeView === "liked" ? "collection-link collection-active" : "collection-link"} onClick={() => goTo("liked")}><span className="collection-icon liked-gradient"><Heart size={16} fill="currentColor" /></span><span><strong>Músicas favoritas</strong><small>Playlist · {likedIds.length} músicas</small></span></button>
          {customPlaylists.map((playlist) => <button key={playlist.id} className={activeView === "playlist" && selectedPlaylistId === playlist.id ? "collection-link collection-active" : "collection-link"} onClick={() => { setSelectedPlaylistId(playlist.id); setActiveView("playlist"); }}><span className="collection-icon"><ListMusic size={16} /></span><span><strong>{playlist.title}</strong><small>Playlist pessoal</small></span></button>)}
          <button className={activeView === "recent" ? "collection-link collection-active" : "collection-link"} onClick={() => goTo("recent")}><span className="collection-icon recent-icon"><Clock3 size={16} /></span><span><strong>Ouvido recentemente</strong><small>O teu histórico</small></span></button>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-live-card"><div className="live-card-top"><span className="live-dot" /> KUFY RADIO</div><p>Há sempre um som à tua espera.</p><button onClick={() => playTrack(tracks[3], tracks)}>Ouvir agora <Play size={13} fill="currentColor" /></button><div className="radio-decoration"><i /><i /><i /><i /><i /><i /><i /></div></div>
          <div className="sidebar-legal"><button onClick={() => setModal("settings")}>Definições</button><span>·</span><button onClick={() => setModal("premium")}>Kufy Plus</button></div>
        </div>
      </aside>

      <main className="main-column">
        <header className="topbar">
          <div className="topbar-left"><IconButton label="Abrir navegação" className="mobile-menu" onClick={() => setShowMobileNav(true)}><Menu size={20} /></IconButton><div className="history-buttons"><IconButton label="Voltar" onClick={() => goTo("home")}><ArrowLeft size={18} /></IconButton><IconButton label="Avançar" onClick={() => goTo("search")}><ArrowRight size={18} /></IconButton></div><div className="global-search"><Search size={18} /><input ref={searchRef} aria-label="Pesquisar música, artista ou playlist" value={searchQuery} onFocus={() => setActiveView("search")} onChange={(event) => { setSearchQuery(event.target.value); setActiveView("search"); }} placeholder="O que queres ouvir?" /><span>Ctrl K</span>{searchQuery ? <IconButton label="Limpar pesquisa" onClick={() => setSearchQuery("")}><X size={15} /></IconButton> : null}</div></div>
          <div className="topbar-actions"><button className="plus-pill" onClick={() => setModal("premium")}><Headphones size={15} /> Kufy Plus</button>{displayName ? <button className="user-chip" onClick={() => setModal("account")}><span className="avatar">{displayName.slice(0, 1).toUpperCase()}</span><span>{displayName.split(" ")[0]}</span><ChevronDown size={14} /></button> : <button className="login-button" onClick={() => { setIsSignup(false); setModal("account"); }}><LogIn size={16} /> Iniciar sessão</button>}</div>
        </header>
        <div className="view-scroller" key={activeView}>{renderMainContent()}<footer className="app-footer"><span>© 2026 Kufy. Música para sentir.</span><span>Uma experiência de demonstração independente.</span><button onClick={() => setModal("settings")}>Privacidade e definições</button></footer></div>
      </main>

      <footer className="player-bar">
        <div className="now-playing">
          {currentTrack ? <><button className="now-cover" onClick={() => setModal("spotify-player")}><CoverArt cover={currentTrack.cover} image={currentTrack.coverImage} /></button><div className="now-copy"><button className="now-title" onClick={() => setModal("spotify-player")}>{currentTrack.title}</button><button className="now-artist" onClick={() => openArtist(currentTrack.artist)}>{currentTrack.artist}</button></div><IconButton label={likedIds.includes(currentTrack.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"} active={likedIds.includes(currentTrack.id)} onClick={() => toggleLike(currentTrack)}><Heart size={17} fill={likedIds.includes(currentTrack.id) ? "currentColor" : "none"} /></IconButton></> : <><div className="now-cover now-placeholder"><Music2 size={22} /></div><div className="now-copy"><strong>Nenhuma faixa seleccionada</strong><span>Escolhe uma música para começar.</span></div></>}
        </div>
        <div className="player-controls">
          <div className="control-buttons"><IconButton label={shuffle ? "Desactivar aleatório" : "Activar aleatório"} active={shuffle} onClick={() => setShuffle((value) => !value)}><Shuffle size={17} /></IconButton><IconButton label="Faixa anterior" onClick={playPrevious}><SkipBack size={19} fill="currentColor" /></IconButton><button className="main-play-button" aria-label={isPlaying ? "Pausar no Spotify" : "Abrir leitor Spotify"} onClick={togglePlayback}>{isPlaying ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" />}</button><IconButton label="Faixa seguinte" onClick={playNext}><SkipForward size={19} fill="currentColor" /></IconButton><IconButton label={repeat ? "Desactivar repetição" : "Repetir faixa"} active={repeat} onClick={() => setRepeat((value) => !value)}><Repeat2 size={17} /></IconButton></div>
          <div className="timeline"><span>{formatTime(currentTime)}</span><input aria-label="Posição da música" type="range" min="0" max={Math.max(duration, 1)} value={Math.min(currentTime, Math.max(duration, 1))} disabled={!spotifyController} onChange={(event) => { const value = Number(event.target.value); setCurrentTime(value); if (spotifyController) spotifyController.seek(value); }} style={{ "--range-progress": (duration ? (currentTime / duration) * 100 : 0) + "%" } as CSSProperties} /><span>{formatTime(duration || currentTrack?.duration || 0)}</span></div>
        </div>
        <div className="player-extras"><IconButton label="Leitor oficial" onClick={() => setModal("spotify-player")}><Headphones size={17} /></IconButton><IconButton label="Fila de reprodução" onClick={() => setModal("queue")}><ListMusic size={18} /></IconButton><IconButton label="Dispositivo de reprodução" onClick={() => setModal("devices")}><MonitorSpeaker size={17} /></IconButton><IconButton label="Definições" onClick={() => setModal("settings")}><Settings2 size={17} /></IconButton></div>
      </footer>

      {showMobileNav ? <button className="mobile-backdrop" aria-label="Fechar navegação" onClick={() => setShowMobileNav(false)} /> : null}
      {notice ? <div className="toast"><Check size={16} />{notice}</div> : null}

      {modal ? <div className={["modal-backdrop", modal === "spotify-player" ? "spotify-modal-backdrop" : ""].filter(Boolean).join(" ")} onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}><section className={["modal-panel", modal === "spotify-player" ? "spotify-modal-panel" : ""].filter(Boolean).join(" ")} role="dialog" aria-modal="true" aria-label="Painel Kufy">
        <div className="modal-head"><div className="modal-brand"><span className="brand-symbol">K</span><span>{modal === "spotify-player" ? "Leitor oficial" : modal === "premium" ? "Kufy Plus" : modal === "account" ? "A tua conta" : modal === "settings" ? "Definições" : modal === "queue" ? "Fila de reprodução" : modal === "lyrics" ? "Letra da música" : modal === "devices" ? "Dispositivos" : modal === "add-to-playlist" ? "Adicionar à playlist" : modal === "track-menu" ? "Opções da faixa" : modal === "delete-playlist" ? "Eliminar playlist" : "Nova playlist"}</span></div><IconButton label="Fechar" onClick={closeModal}><X size={19} /></IconButton></div>
        {modal === "spotify-player" && currentTrack ? <div className="modal-body spotify-dock-body"><div className="spotify-track-heading"><CoverArt cover={currentTrack.cover} image={currentTrack.coverImage} /><div><span className="eyebrow">{currentTrack.opensCollection ? "CATÁLOGO DO SPOTIFY" : "A TOCAR NO KUFY"}</span><h2>{currentTrack.title}</h2><p>{currentTrack.artist}</p></div></div><SpotifyPlayer key={currentTrack.id} track={currentTrack} onController={handleSpotifyController} onPlaybackState={handleSpotifyPlaybackState} onError={handleSpotifyError} /><div className="spotify-modal-actions"><button className="button button-outline" onClick={() => setModal("queue")}><ListMusic size={16} /> Fila</button><button className="button button-primary" onClick={() => spotifyController ? (isPlaying ? spotifyController.pause() : spotifyController.play()) : setNotice("O leitor está a iniciar. Usa os controlos do Spotify quando aparecerem.")}>{isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}{isPlaying ? "Pausar" : "Reproduzir"}</button></div></div> : null}
        {modal === "create-playlist" ? <form className="modal-body" onSubmit={createPlaylist}><div className="modal-illustration"><ListMusic size={28} /></div><h2>Cria a tua playlist</h2><p>Dá um nome à tua próxima selecção. Fica guardada neste dispositivo.</p><label className="field-label" htmlFor="playlist-name">Nome da playlist</label><input id="playlist-name" className="text-field" value={playlistName} onChange={(event) => setPlaylistName(event.target.value)} placeholder="Ex.: Sons da madrugada" maxLength={48} autoFocus required /><div className="modal-actions"><button type="button" className="button button-glass" onClick={() => setModal(null)}>Cancelar</button><button type="submit" className="button button-primary">Criar playlist</button></div>{pendingTrack ? <small className="modal-note">A faixa “{pendingTrack.title}” será adicionada à nova playlist.</small> : null}</form> : null}
        {modal === "track-menu" && pendingTrack ? <div className="modal-body track-menu-body"><div className="track-menu-heading"><CoverArt cover={pendingTrack.cover} image={pendingTrack.coverImage} /><div><span className="eyebrow">OPÇÕES DA FAIXA</span><h2>{pendingTrack.title}</h2><p>{pendingTrack.artist}</p></div></div><div className="track-menu-actions"><button className="button button-glass" onClick={() => queueTrackNext(pendingTrack)}><SkipForward size={17} /> Reproduzir a seguir</button><button className="button button-glass" onClick={() => { addTrackToQueue(pendingTrack); setModal(null); }}><Plus size={17} /> Adicionar à fila</button><button className="button button-glass" onClick={() => setModal("add-to-playlist")}><ListMusic size={17} /> Adicionar à playlist</button><button className="button button-glass" onClick={() => { const artistName = pendingTrack.artist.split(",")[0].trim(); openArtist(artistName); setModal(null); }}><UserRound size={17} /> Ver artista</button><button className="button button-glass" onClick={() => { openAlbum(pendingTrack.album); setModal(null); }}><Disc3 size={17} /> Ver álbum</button><button className="button button-glass" onClick={() => { shareTrack(pendingTrack); setModal(null); }}><Share2 size={17} /> Copiar ligação oficial</button></div></div> : null}
        {modal === "delete-playlist" && currentPlaylist?.isCustom ? <div className="modal-body"><div className="modal-illustration"><Trash2 size={27} /></div><h2>Eliminar playlist?</h2><p>A playlist “{currentPlaylist.title}” será removida deste dispositivo. Esta acção não pode ser anulada.</p><div className="modal-actions"><button className="button button-glass" onClick={() => setModal(null)}>Cancelar</button><button className="button button-primary" onClick={deleteSelectedPlaylist}>Eliminar playlist</button></div></div> : null}
        {modal === "add-to-playlist" ? <div className="modal-body"><h2>Guardar música</h2><p>{pendingTrack ? "Escolhe onde queres guardar “" + pendingTrack.title + "”." : "Escolhe uma playlist para adicionar músicas ou cria uma nova."}</p><div className="modal-list">{customPlaylists.map((playlist) => <button key={playlist.id} className="modal-list-item" onClick={() => pendingTrack ? addTrackToPlaylist(playlist.id) : (setSelectedPlaylistId(playlist.id), setModal(null), setActiveView("playlist"))}><CoverArt cover={playlist.cover} image={playlist.coverImage} /><span><strong>{playlist.title}</strong><small>{playlist.trackIds.length} músicas</small></span><Plus size={17} /></button>)}</div><button className="button button-outline button-full" onClick={() => openCreatePlaylist(pendingTrack ?? undefined)}><Plus size={17} /> Criar nova playlist</button>{customPlaylists.length === 0 ? <p className="modal-note">Ainda não criaste playlists pessoais.</p> : null}</div> : null}
        {modal === "account" ? <form className="modal-body" onSubmit={submitAccount}><div className="modal-illustration"><UserRound size={28} /></div><h2>{displayName ? "Estás a ouvir como " + displayName : isSignup ? "Cria o teu espaço" : "Entra no teu universo"}</h2><p>Este protótipo guarda apenas um nome local. Ainda não existe autenticação real ou conta online.</p>{displayName ? <><div className="account-status"><span className="avatar">{displayName.slice(0, 1).toUpperCase()}</span><div><strong>{displayName}</strong><small>Perfil local de demonstração</small></div></div><button type="button" className="button button-outline button-full" onClick={() => { setDisplayName(null); setModal(null); setNotice("Sessão local terminada"); }}>Terminar sessão</button></> : <><label className="field-label" htmlFor="account-email">E-mail</label><input id="account-email" className="text-field" type="email" value={accountEmail} onChange={(event) => setAccountEmail(event.target.value)} placeholder="nome@exemplo.com" required /><button className="button button-primary button-full" type="submit">{isSignup ? "Criar perfil de demonstração" : "Continuar"}</button><button type="button" className="text-action centered-action" onClick={() => setIsSignup((value) => !value)}>{isSignup ? "Já tens perfil? Entrar" : "Ainda não tens conta? Criar perfil"}</button></>}</form> : null}
        {modal === "premium" ? <div className="modal-body premium-body"><div className="premium-orb"><Headphones size={31} /></div><span className="eyebrow">KUFY PLUS</span><h2>Ouve sem limites.</h2><p>Kufy Plus é uma proposta visual de subscrição. Não existe cobrança nem subscrição activa nesta versão.</p><div className="premium-features"><span><Check size={16} /> Biblioteca e playlists personalizadas</span><span><Check size={16} /> Capas e páginas de artista oficiais</span><span><Check size={16} /> Reprodução através do leitor oficial</span><span className="muted-feature"><X size={16} /> Downloads offline reais, ainda não disponíveis</span></div><button className="button button-primary button-full" onClick={() => { setModal(null); setNotice("O fluxo comercial será ligado numa fase futura"); }}>Percebi</button><small className="modal-note">Sem cobrança. Nenhuma subscrição foi criada.</small></div> : null}
        {modal === "settings" ? <div className="modal-body"><h2>Personaliza a tua experiência</h2><p>Preferências guardadas neste dispositivo.</p><div className="settings-row"><span><strong>Permitir conteúdo explícito</strong><small>Incluir as faixas sinalizadas no catálogo oficial</small></span><button className={explicitContent ? "toggle-switch toggle-on" : "toggle-switch"} onClick={() => setExplicitContent((value) => !value)} aria-label="Alternar conteúdo explícito"><span /></button></div><div className="settings-row"><span><strong>Atalhos de teclado</strong><small>Espaço reproduz/pausa, Ctrl K pesquisa, setas saltam 5 segundos.</small></span><Keyboard size={20} /></div><button className="button button-outline button-full" onClick={() => setModal(null)}>Fechar definições</button></div> : null}
        {modal === "queue" ? <div className="modal-body"><h2>A seguir</h2><p>{queueTracks.filter((track) => track.id !== currentTrack?.id).length} faixas por reproduzir.</p>{currentTrack ? <div className="queue-now"><CoverArt cover={currentTrack.cover} image={currentTrack.coverImage} /><div><small>A TOCAR AGORA</small><strong>{currentTrack.title}</strong><span>{currentTrack.artist}</span></div></div> : null}<div className="modal-list queue-list">{queueTracks.filter((track) => track.id !== currentTrack?.id).map((track) => <div key={track.id} className="queue-item"><button className="modal-list-item queue-track-button" onClick={() => playTrack(track, queueTracks)}><CoverArt cover={track.cover} image={track.coverImage} /><span><strong>{track.title}</strong><small>{track.artist}</small></span><span className="track-duration">{formatTime(track.duration)}</span></button><div className="queue-item-actions"><IconButton label="Mover para cima" onClick={() => moveQueuedTrack(track.id, -1)}><ArrowUp size={14} /></IconButton><IconButton label="Mover para baixo" onClick={() => moveQueuedTrack(track.id, 1)}><ArrowDown size={14} /></IconButton><IconButton label="Remover da fila" onClick={() => removeQueuedTrack(track.id)}><X size={14} /></IconButton></div></div>)}</div>{queueTracks.filter((track) => track.id !== currentTrack?.id).length === 0 ? <EmptyState icon={<ListMusic size={25} />} title="Não há próximas faixas" description="Adiciona música à fila ou carrega o catálogo completo." /> : null}<div className="queue-footer-actions"><button className="button button-outline button-full" onClick={() => { const ids = tracks.map((track) => track.id); setQueueIds(currentTrack ? [currentTrack.id, ...ids.filter((id) => id !== currentTrack.id)] : ids); setNotice("Catálogo completo adicionado à fila"); }}>Adicionar catálogo completo</button><button className="button button-glass button-full" onClick={() => { setQueueIds(currentTrack ? [currentTrack.id] : []); setNotice("Fila futura limpa"); }}>Limpar fila futura</button></div></div> : null}
        {modal === "lyrics" ? <div className="modal-body lyrics-body">{currentTrack ? <><CoverArt cover={currentTrack.cover} large /><span className="eyebrow">LETRA</span><h2>{currentTrack.title}</h2><p>{currentTrack.artist}</p><div className="lyrics-unavailable"><Mic2 size={25} /><strong>Letra não disponível</strong><span>As letras dependem da disponibilidade e das permissões do detentor dos direitos.</span></div></> : <EmptyState icon={<Mic2 size={27} />} title="Escolhe uma faixa" description="A letra aparece aqui quando estiver disponível." />}</div> : null}
        {modal === "devices" ? <div className="modal-body"><h2>Onde estás a ouvir?</h2><p>A reprodução é fornecida pelo leitor oficial do Spotify no navegador actual.</p><div className="device-current"><span><MonitorSpeaker size={22} /></span><div><strong>Este dispositivo</strong><small>Reprodução neste navegador</small></div><Check size={17} /></div><div className="device-info"><Headphones size={18} /><span>Colunas inteligentes, aplicações móveis e ligação entre dispositivos ainda precisam de serviços adicionais.</span></div></div> : null}
      </section></div> : null}
    </div>
  );
}