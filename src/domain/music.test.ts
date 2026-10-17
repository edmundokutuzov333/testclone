import { describe, expect, it } from "vitest";
import { tracks } from "../data";
import { formatTime, getTracks, normalizeText, searchTracks, toggleId } from "./music";

describe("music domain", () => {
  it("normalizes accents and case for search", () => {
    expect(normalizeText("Eletrónica")).toBe("eletronica");
    expect(searchTracks(tracks, "MAQUINA")).toHaveLength(1);
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