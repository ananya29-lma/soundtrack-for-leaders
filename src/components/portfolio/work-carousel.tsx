import { useEffect, useRef, useState } from "react";
import { WarpCarousel, type WarpCarouselHandle } from "@/components/ui/warp-carousel";
import { scrollRingProgress } from "@/lib/warp-carousel-motion";
import {
  ArrowUpRight,
  Asterisk,
  GraduationCap,
  Megaphone,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

type WorkItem = {
  name: string;
  line: string;
  year: string;
  icon: LucideIcon;
};

const projects: WorkItem[] = [
  {
    name: "STRATEGIC OPERATIONS",
    line: "Your memories, beautifully preserved.",
    year: "2025",
    icon: Asterisk,
  },
  {
    name: "BUSINESS EXPANSION",
    line: "Scaling ventures, market entry, and commercial growth across India and the UAE.",
    year: "2025",
    icon: TrendingUp,
  },
  {
    name: "BRANDING & MARKETING",
    line: "High-impact brand positioning, audience strategy, and growth campaigns.",
    year: "2024",
    icon: Megaphone,
  },
  {
    name: "CORPORATE TRAINING",
    line: "Industry-ready skill programs empowering teams and emerging leaders.",
    year: "2024",
    icon: GraduationCap,
  },
];

const HEADING_LETTERS = Array.from("SPECIALIZATION");
const LETTER_TILTS = [-8, 6, -5, 7, -6, 5, -7, 6, -5, 8, -6, 5, -7, 6];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export function Work() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wordRef = useRef<HTMLHeadingElement | null>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const carouselRef = useRef<WarpCarouselHandle>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [front, setFront] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReducedMotion(mq.matches);
    syncMotion();
    mq.addEventListener("change", syncMotion);
    return () => mq.removeEventListener("change", syncMotion);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    let raf = 0;
    const letterCount = HEADING_LETTERS.length;

    const update = () => {
      raf = 0;
      const wrap = wrapRef.current;
      if (!wrap) return;
      const total = wrap.offsetHeight - window.innerHeight;
      const raw = total > 0 ? -wrap.getBoundingClientRect().top / total : 0;
      const p = clamp01(raw);

      // Phase 1 (0.00 -> 0.34): staggered letter-by-letter rise of SPECIALIZATION
      letterRefs.current.forEach((el, i) => {
        if (!el) return;
        const start = -0.045 + (i / (letterCount - 1)) * 0.245;
        const u = clamp01((p - start) / 0.14);
        const e = easeOutCubic(u);
        const tilt = LETTER_TILTS[i] ?? 0;
        const y = (1 - e) * 76;
        const z = -(1 - e) * 240;
        const scale = 0.36 + 0.64 * e;
        const rotZ = (1 - e) * tilt;
        el.style.transform = `translate3d(0px, ${y}px, ${z}px) scale(${scale}) rotateZ(${rotZ}deg)`;
        el.style.opacity = String(e);
      });

      // Phase 2 (0.42 -> 0.60): hold sharp, then recede and blur into backdrop watermark
      const word = wordRef.current;
      if (word) {
        const recede = smoothstep(0.42, 0.6, p);
        const exitDrift = smoothstep(0.78, 1.0, p);
        const scale = 1 + recede * 0.08;
        const rotX = Math.sin(recede * Math.PI) * 14;
        const blurPx = recede * 11;
        const opacity = 1 - recede * 0.66;
        const shiftY = -exitDrift * 120;
        word.style.transform = `translate3d(0px, ${shiftY}px, 0px) rotateX(${rotX}deg) scale(${scale})`;
        word.style.filter = blurPx > 0.05 ? `blur(${blurPx.toFixed(2)}px)` : "none";
        word.style.opacity = String(opacity);
      }

      carouselRef.current?.setProgress(scrollRingProgress(p), smoothstep(0.34, 0.44, p));

      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${p})`;
      }
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return (
      <section id="work" className="border-y border-border bg-background py-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="work-rise-word text-display mb-12 text-center text-highlight">
            SPECIALIZATION
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {projects.map((project, index) => (
              <WorkGlassCard
                key={project.name}
                project={project}
                isHighlighted={hovered === index || front === index}
                onHoverChange={(on) =>
                  setHovered((prev) => (on ? index : prev === index ? null : prev))
                }
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="work" className="border-y border-border bg-background">
      <div ref={wrapRef} className="relative h-[400vh]">
        <div className="work-stage sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
          <div className="work-rise-stage pointer-events-none absolute inset-0 flex items-center justify-center px-3 sm:px-6">
            <h2
              ref={wordRef}
              aria-label="SPECIALIZATION"
              className="work-rise-word text-display select-none whitespace-nowrap text-highlight"
            >
              {HEADING_LETTERS.map((char, i) => (
                <span
                  key={`${char}-${i}`}
                  ref={(el) => {
                    letterRefs.current[i] = el;
                  }}
                  aria-hidden="true"
                  className="work-rise-letter"
                >
                  {char}
                </span>
              ))}
            </h2>
          </div>

          <div className="relative z-10 h-full w-full">
            <WarpCarousel ref={carouselRef} ariaLabel="Specializations" onFrontChange={setFront}>
              {projects.map((project, index) => (
                  <WorkGlassCard
                    key={project.name}
                    project={project}
                    isHighlighted={hovered === index || front === index}
                    onHoverChange={(on) =>
                      setHovered((prev) => (on ? index : prev === index ? null : prev))
                    }
                  />
              ))}
            </WarpCarousel>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-7 flex justify-center">
            <div className="h-[2px] w-36 overflow-hidden rounded-full bg-border/80">
              <div
                ref={barRef}
                className="h-full w-full origin-left bg-highlight"
                style={{ transform: "scaleX(0)" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkGlassCard({
  project,
  isHighlighted,
  onHoverChange,
}: {
  project: WorkItem;
  isHighlighted: boolean;
  onHoverChange: (hovered: boolean) => void;
}) {
  const cardRef = useRef<HTMLElement | null>(null);
  const target = useRef({ rx: 0, ry: 0, mx: 78, my: 24 });
  const cur = useRef({ rx: 0, ry: 0, mx: 78, my: 24 });
  const raf = useRef(0);
  const Icon = project.icon;

  const tick = () => {
    const el = cardRef.current;
    if (!el) return;
    const c = cur.current;
    const t = target.current;
    c.rx += (t.rx - c.rx) * 0.14;
    c.ry += (t.ry - c.ry) * 0.14;
    c.mx += (t.mx - c.mx) * 0.2;
    c.my += (t.my - c.my) * 0.2;
    el.style.transform = `perspective(1000px) rotateX(${c.rx}deg) rotateY(${c.ry}deg)`;
    el.style.setProperty("--mx", `${c.mx}%`);
    el.style.setProperty("--my", `${c.my}%`);
    const moving =
      Math.abs(t.rx - c.rx) > 0.01 ||
      Math.abs(t.ry - c.ry) > 0.01 ||
      Math.abs(t.mx - c.mx) > 0.05 ||
      Math.abs(t.my - c.my) > 0.05;
    raf.current = moving ? requestAnimationFrame(tick) : 0;
  };

  const kick = () => {
    if (!raf.current) raf.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const onPointerMove = (e: React.PointerEvent) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    const px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    target.current = {
      rx: (0.5 - py) * 12,
      ry: (px - 0.5) * 14,
      mx: px * 100,
      my: py * 100,
    };
    kick();
  };

  const onPointerEnter = (e: React.PointerEvent) => {
    onHoverChange(true);
    onPointerMove(e);
  };

  const onPointerLeave = () => {
    onHoverChange(false);
    target.current = { rx: 0, ry: 0, mx: 78, my: 24 };
    kick();
  };

  return (
    <article
      ref={cardRef}
      data-highlighted={isHighlighted}
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="work-glass-card group flex min-h-[210px] cursor-pointer flex-col p-4 sm:min-h-[260px] sm:p-6 lg:h-[340px] lg:p-7"
      style={{ transformStyle: "preserve-3d", willChange: "transform" }}
    >
      <div className="work-glass-spotlight" aria-hidden="true" />
      <div className="work-glass-underglow" aria-hidden="true" />

      <div className="relative z-10 flex items-start justify-between">
        <span className="work-icon-badge grid size-10 place-items-center rounded-xl sm:size-12 sm:rounded-2xl">
          <Icon className="size-5 stroke-[2.2] sm:size-6" />
        </span>
        <ArrowUpRight className="size-4 text-muted-foreground transition-all duration-300 group-data-[highlighted=true]:rotate-45 group-data-[highlighted=true]:text-highlight sm:size-5" />
      </div>

      <div className="relative z-10 mt-auto pt-4">
        <h3 className="text-display text-lg text-foreground sm:text-2xl lg:text-[1.75rem]">
          {project.name}
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:mt-3 sm:text-sm">
          {project.line}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground sm:mt-5 sm:pt-4 sm:text-xs">
          <span className="tabular-nums">{project.year}</span>
          <span className="tracking-[0.16em] uppercase transition-colors duration-300 group-data-[highlighted=true]:text-highlight sm:tracking-[0.2em]">
            View case
          </span>
        </div>
      </div>
    </article>
  );
}