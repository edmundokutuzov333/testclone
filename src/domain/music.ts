import type { Track } from "../data";

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
  const indexed = new Map(catalog.map((track) => [track.id, track]));
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

export function readStored<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStored<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private browsing or quota restrictions must not break listening.
  }
}