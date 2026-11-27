import { Children, forwardRef, useEffect, useImperativeHandle, useRef, type ReactNode } from "react";
import { warpPoseAt, wrapRingOffset } from "@/lib/warp-carousel-motion";

export type WarpCarouselHandle = {
  setProgress: (progress: number, opacity: number) => void;
};

// Uses the supplied carousel's fitted ring geometry with live HTML cards,
// keeping portfolio copy accessible instead of painting it into a canvas.
export const WarpCarousel = forwardRef<
  WarpCarouselHandle,
  { children: ReactNode; ariaLabel: string; onFrontChange?: (index: number | null) => void }
>(
  function WarpCarousel({ children, ariaLabel, onFrontChange }, ref) {
    const rootRef = useRef<HTMLDivElement>(null);
    const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
    const cards = Children.toArray(children);
    const progressRef = useRef({ progress: 0, opacity: 0 });
    const frontRef = useRef<number | null>(null);
    const onFrontChangeRef = useRef(onFrontChange);
    onFrontChangeRef.current = onFrontChange;

    const draw = (progress: number, opacity: number) => {
      progressRef.current = { progress, opacity };
      const root = rootRef.current;
      if (!root) return;
      root.style.opacity = String(opacity);
      let front: number | null = null;
      slotRefs.current.forEach((slot, i) => {
        if (!slot) return;
        const q = wrapRingOffset(i, progress, cards.length);
        const [x, depth, yaw] = warpPoseAt(q);
        const edge = Math.min(1, Math.max(0, (Math.abs(q) - 0.65) / 0.85));
        slot.style.transform = `translate3d(${x}px, 0px, ${-depth}px) rotateY(${yaw}rad) scaleY(${1 + edge * 0.18})`;
        slot.style.opacity = String(1 - edge * 0.55);
        slot.style.filter = `blur(${edge * 1.8}px)`;
        slot.style.pointerEvents = opacity > 0.9 && Math.abs(q) < 0.3 ? "auto" : "none";
        slot.dataset['front'] = String(Math.abs(q) < 0.3);
        if (opacity > 0.5 && Math.abs(q) < 0.3) front = i;
        // The reference paints both sides; keep back-facing text readable.
        const face = slot.firstElementChild;
        if (face instanceof HTMLElement) face.style.transform = Math.cos(yaw) < 0 ? "rotateY(180deg)" : "rotateY(0deg)";
      });
      // Tell the parent which card sits at the centre so it can light it up.
      if (front !== frontRef.current) {
        frontRef.current = front;
        onFrontChangeRef.current?.(front);
      }
    };

    useImperativeHandle(ref, () => ({ setProgress: draw }));

    useEffect(() => {
      const root = rootRef.current;
      if (!root) return;
      const resize = () => {
        const width = root.clientWidth;
        const height = root.clientHeight;
        const unit = Math.min(1.25, Math.max(0.875, width / 720), height / 420);
        root.style.setProperty("--warp-unit", String(unit));
        draw(progressRef.current.progress, progressRef.current.opacity);
      };
      const observer = new ResizeObserver(resize);
      observer.observe(root);
      resize();
      return () => observer.disconnect();
    }, [cards.length]);

    return (
      <div ref={rootRef} className="work-warp-carousel" role="region" aria-roledescription="carousel" aria-label={ariaLabel}>
        <div className="work-warp-scene">
          {cards.map((card, i) => (
            <div key={i} ref={(el) => { slotRefs.current[i] = el; }} className="work-warp-slot">
              <div className="work-warp-face">{card}</div>
            </div>
          ))}
        </div>
      </div>
    );
  },
);