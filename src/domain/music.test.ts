import { describe, expect, it } from "vitest";
import { tracks } from "../data";
import { formatTime, getTracks, normalizeText, searchTracks, toggleId } from "./music";

describe("music domain", () => {
  it("normalizes accents and case for search", () => {
    expect(normalizeText("Eletrónica")).toBe("eletronica");
    expect(searchTracks(tracks, "MAQUINA")).toHaveLength(2);
    expect(searchTracks(tracks, "travis")).toHaveLength(3);
  });

  it("uses official Spotify URIs for the catalogue", () => {
    expect(tracks.every((track) => track.spotifyUri.startsWith("spotify:"))).toBe(true);
    expect(tracks.some((track) => track.artist.includes("Matuê"))).toBe(true);
    expect(tracks.some((track) => track.artist.includes("Laylizzy"))).toBe(true);
    expect(tracks.some((track) => track.artist.includes("Dygo Boy"))).toBe(true);
  });

  it("formats playback time safely", () => {
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(65)).toBe("1:05");
    expect(formatTime(Number.NaN)).toBe("0:00");
    expect(formatTime(-4)).toBe("0:00");
  });

  it("keeps playlist order and skips missing tracks", () => {
    expect(getTracks(["t03", "missing", "t01"], tracks).map((track) => track.id)).toEqual(["t03", "t01"]);
  });

  it("toggles a liked track without duplicate entries", () => {
    expect(toggleId(["t01", "t02"], "t01")).toEqual(["t02"]);
    expect(toggleId(["t02"], "t03")).toEqual(["t03", "t02"]);
  });
});

describe("resilient local state and queue operations", () => {
  it("drops unknown and duplicate IDs when restoring persisted lists", async () => {
    const { sanitizeIds } = await import("./music");
    expect(sanitizeIds(["t02", "missing", "t02", 5, "t03"], ["t01", "t02", "t03"])).toEqual(["t02", "t03"]);
  });

  it("restores custom playlists only when their shape and track IDs are valid", async () => {
    const { sanitizePlaylists } = await import("./music");
    const value = sanitizePlaylists([
      { id: "custom-1", title: "  Nocturna  ", cover: "art-01", coverImage: "https://example.com/a.jpg", trackIds: ["t01", "wrong", "t01"] },
      { id: "p01", title: "Playlist de sistema", cover: "art-01", coverImage: "x", trackIds: [] },
      { id: "custom-2", title: " ", cover: "art-01", coverImage: "x", trackIds: [] },
    ], ["t01", "t02"]);
    expect(value).toHaveLength(1);
    expect(value[0]).toMatchObject({ id: "custom-1", title: "Nocturna", trackIds: ["t01"], isCustom: true });
  });

  it("inserts a play-next item immediately after the current track without duplicates", async () => {
    const { insertAfterCurrent } = await import("./music");
    expect(insertAfterCurrent(["t01", "t02", "t03"], "t03", "t01")).toEqual(["t01", "t03", "t02"]);
    expect(insertAfterCurrent(["t01", "t02", "t03"], "t02", "t01")).toEqual(["t01", "t02", "t03"]);
    expect(insertAfterCurrent(["t01", "t02"], "t03", null)).toEqual(["t03", "t01", "t02"]);
  });

  it("reorders upcoming items without moving them ahead of the current track", async () => {
    const { moveId } = await import("./music");
    expect(moveId(["t01", "t02", "t03"], "t03", -1, 1)).toEqual(["t01", "t03", "t02"]);
    expect(moveId(["t01", "t02", "t03"], "t02", -1, 1)).toEqual(["t01", "t02", "t03"]);
  });

  it("converts only recognised Spotify URIs to canonical web links", async () => {
    const { spotifyUriToWebUrl } = await import("./music");
    expect(spotifyUriToWebUrl("spotify:track:abc123")).toBe("https://open.spotify.com/track/abc123");
    expect(spotifyUriToWebUrl("spotify:artist:abc123")).toBe("https://open.spotify.com/artist/abc123");
    expect(spotifyUriToWebUrl("not-a-uri")).toBe("https://open.spotify.com/");
  });
});
