import { describe, expect, it } from "vitest";
import { tracks } from "../data";
import { formatTime, getTracks, normalizeText, searchTracks, toggleId } from "./music";

describe("music domain", () => {
  it("normalizes accents and case for search", () => {
    expect(normalizeText("Eletrónica")).toBe("eletronica");
    expect(searchTracks(tracks, "MAPUTO")).toHaveLength(1);
    expect(searchTracks(tracks, "mila")).toHaveLength(3);
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