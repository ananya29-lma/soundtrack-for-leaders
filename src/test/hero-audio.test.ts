import { describe, expect, it } from "vitest";
import {
  CONTINUOUS_TRACK_VOLUME,
  HERO_TRACK_VOLUME,
  shouldMuteHeroAudio,
  soundtrackState,
} from "@/lib/hero-audio";

describe("hero soundtrack boundary", () => {
  it("mutes as soon as the next section enters the viewport", () => {
    expect(shouldMuteHeroAudio(778, 779)).toBe(true);
    expect(shouldMuteHeroAudio(0, 779)).toBe(true);
  });

  it("allows sound while only the hero is visible, including on return", () => {
    expect(shouldMuteHeroAudio(935, 779)).toBe(false);
    expect(shouldMuteHeroAudio(779, 779)).toBe(false);
  });

  it("plays both songs together in the hero", () => {
    expect(soundtrackState(935, 779, true, true)).toEqual({ heroMuted: false, continuousMuted: false });
  });

  it("continues only the second song through the next section and the end", () => {
    expect(soundtrackState(778, 779, true, true)).toEqual({ heroMuted: true, continuousMuted: false });
    expect(soundtrackState(-6000, 779, true, true)).toEqual({ heroMuted: true, continuousMuted: false });
  });

  it("mutes both songs when sound is turned off", () => {
    expect(soundtrackState(935, 779, false, true)).toEqual({ heroMuted: true, continuousMuted: true });
  });

  it("keeps the first song quieter than the second", () => {
    expect(HERO_TRACK_VOLUME).toBe(0.18);
    expect(HERO_TRACK_VOLUME).toBeLessThan(CONTINUOUS_TRACK_VOLUME);
  });
});