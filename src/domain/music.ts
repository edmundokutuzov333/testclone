import { artists, tracks, type MusicPlaylist, type Track } from "../data";

export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .trim();
}

export function searchTracks(catalog: Track[], query: string): Track[] {
  const needle = normalizeText(query);
  if (!needle) return [];
  return catalog.filter((track) =>
    normalizeText([track.title, track.artist, track.album].join(" ")).includes(needle),
  );
}

export function getTracks(ids: string[], catalog: Track[]): Track[] {
  const indexed = new Map(catalog.map((track) => [track.id, track] as const));
  return ids.flatMap((id) => {
    const track = indexed.get(id);
    return track ? [track] : [];
  });
}

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const safeSeconds = Math.floor(seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = String(safeSeconds % 60).padStart(2, "0");
  return String(minutes) + ":" + remainder;
}

export function toggleId(ids: string[], targetId: string): string[] {
  return ids.includes(targetId)
    ? ids.filter((id) => id !== targetId)
    : [targetId, ...ids];
}

export function sanitizeIds(value: unknown, allowedIds: readonly string[], fallback: string[] = []): string[] {
  const allowed = new Set(allowedIds);
  const source = Array.isArray(value) ? value : fallback;
  const seen = new Set<string>();
  return source.filter((candidate): candidate is string => {
    if (typeof candidate !== "string" || !allowed.has(candidate) || seen.has(candidate)) return false;
    seen.add(candidate);
    return true;
  });
}

export function readStored<T>(
  key: string,
  fallback: T,
  validate?: (value: unknown) => value is T,
): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (validate && !validate(parsed)) return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}

export function readStoredIds(key: string, fallback: string[], allowedIds: readonly string[]): string[] {
  return sanitizeIds(readStored<unknown>(key, fallback), allowedIds, fallback);
}

export function sanitizePlaylists(value: unknown, allowedTrackIds: readonly string[]): MusicPlaylist[] {
  if (!Array.isArray(value)) return [];
  const validTrackIds = new Set(allowedTrackIds);
  const seenPlaylistIds = new Set<string>();
  const result: MusicPlaylist[] = [];

  for (const candidate of value) {
    if (!candidate || typeof candidate !== "object") continue;
    const item = candidate as Record<string, unknown>;
    if (
      typeof item.id !== "string" ||
      !item.id.startsWith("custom-") ||
      seenPlaylistIds.has(item.id) ||
      typeof item.title !== "string" ||
      !item.title.trim() ||
      typeof item.cover !== "string" ||
      typeof item.coverImage !== "string"
    ) continue;

    const trackIds = sanitizeIds(item.trackIds, Array.from(validTrackIds), []);
    result.push({
      id: item.id,
      title: item.title.trim().slice(0, 48),
      description: typeof item.description === "string"
        ? item.description.slice(0, 180)
        : "A tua playlist, feita à tua maneira.",
      cover: item.cover,
      coverImage: item.coverImage,
      trackIds,
      owner: typeof item.owner === "string" ? item.owner.slice(0, 80) : "A tua biblioteca",
      isCustom: true,
    });
    seenPlaylistIds.add(item.id);
  }
  return result;
}

export function readStoredPlaylists(key: string, allowedTrackIds: readonly string[]): MusicPlaylist[] {
  return sanitizePlaylists(readStored<unknown>(key, []), allowedTrackIds);
}

export function spotifyUriToWebUrl(uri: string): string {
  const match = /^spotify:(track|album|artist|playlist|episode|show):([a-zA-Z0-9]+)$/.exec(uri);
  return match ? `https://open.spotify.com/${match[1]}/${match[2]}` : "https://open.spotify.com/";
}

export function insertAfterCurrent(ids: string[], targetId: string, currentId: string | null): string[] {
  const withoutTarget = ids.filter((id) => id !== targetId);
  if (!currentId) return [targetId, ...withoutTarget];
  const currentIndex = withoutTarget.indexOf(currentId);
  if (currentIndex < 0) return [targetId, ...withoutTarget];
  return [
    ...withoutTarget.slice(0, currentIndex + 1),
    targetId,
    ...withoutTarget.slice(currentIndex + 1),
  ];
}

export function moveId(ids: string[], targetId: string, direction: -1 | 1, minimumIndex = 0): string[] {
  const from = ids.indexOf(targetId);
  const to = from + direction;
  if (from < minimumIndex || to < minimumIndex || from < 0 || to >= ids.length) return ids;
  const next = [...ids];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

export function writeStored<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private browsing or quota restrictions must not break listening.
  }
}

export const validTrackIds = tracks.map((track) => track.id);
export const validArtistIds = artists.map((artist) => artist.id);
