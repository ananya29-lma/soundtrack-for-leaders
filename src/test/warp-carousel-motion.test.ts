import { describe, expect, it } from "vitest";
import { scrollRingProgress, warpPoseAt, wrapRingOffset } from "@/lib/warp-carousel-motion";

describe("scroll-driven warp carousel", () => {
  it("brings the four cards forward in order and returns the ring to its starting place", () => {
    for (let i = 0; i <= 4; i++) {
      const progress = scrollRingProgress(0.44 + 0.12 * i);
      expect(progress).toBeCloseTo(i, 8);
      expect(wrapRingOffset(i % 4, progress, 4)).toBeCloseTo(0, 8);
    }
    expect(warpPoseAt(wrapRingOffset(0, scrollRingProgress(1), 4))).toEqual([0, 0, 0]);
  });

  it("reverses the ring when scrolling backward without depending on elapsed time", () => {
    const forward = scrollRingProgress(0.7);
    const backward = scrollRingProgress(0.58);
    expect(backward).toBeLessThan(forward);
    expect(backward).toBeCloseTo(scrollRingProgress(0.58), 8);
    expect(scrollRingProgress(0)).toBe(0);
    expect(scrollRingProgress(1)).toBe(4);
  });
});