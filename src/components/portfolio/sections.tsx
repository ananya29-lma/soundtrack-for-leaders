import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Mail } from "lucide-react";
import { ScrollRevealParagraph } from "./scroll-reveal-paragraph";
import { RisingWordsHeading } from "./rising-words-heading";
import { WakeGlyph } from "@/components/ui/background-ascii-wake";
import serviceFlash from "@/assets/service-flash.jpg";
import serviceCommunity from "@/assets/service-community.jpg";
import serviceSankaracharya from "@/assets/service-sankaracharya.jpg";
import serviceManager from "@/assets/service-manager.jpg";
import serviceBdirection from "@/assets/service-bdirection.jpg";
import serviceWorkspace from "@/assets/service-workspace.jpg";
export { Work } from "./work-carousel";

function useHeadingReveal() {
  const ref = useRef<HTMLHeadingElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const letters = Array.from(el.querySelectorAll<HTMLSpanElement>(".heading-letter"));
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const n = letters.length;
    const span = 4; // letters animating at once
    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const top = el.getBoundingClientRect().top;
      // 0 when heading enters at bottom, 1 when it reaches 45% of the screen
      const p = Math.max(0, Math.min(1, (vh - top) / (vh * 0.55)));
      letters.forEach((l, i) => {
        if (motion.matches) {
          l.style.opacity = "1";
          l.style.transform = "none";
          return;
        }
        const t = Math.max(0, Math.min(1, (p * (n + span) - i) / span));
        let scale: number;
        let y: number;
        if (t < 0.5) {
          const k = t / 0.5;
          scale = 0.6 + 0.8 * k;
          y = 0.3 - 0.42 * k;
        } else {
          const k = (t - 0.5) / 0.5;
          scale = 1.4 - 0.4 * k;
          y = -0.12 + 0.12 * k;
        }
        l.style.opacity = String(Math.min(1, t * 2));
        l.style.transform = `translateY(${y}em) scale(${scale})`;
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return { ref, cls: "" };
}

function splitLetters(text: string, offset: number) {
  return Array.from(text).map((ch, i) => (
    <span key={i} className="heading-letter" data-index={offset + i}>
      {ch === " " ? "\u00A0" : ch}
    </span>
  ));
}

export function SectionTitle({
  light,
  bold,
  eyebrow,
  lightClass = "text-muted-foreground/50",
  sizeClass = "text-5xl md:text-7xl",
  wrapClass = "mb-14",
}: {
  light: string;
  bold: string;
  eyebrow?: string;
  lightClass?: string;
  sizeClass?: string;
  wrapClass?: string;
}) {
  const { ref, cls } = useHeadingReveal();
  return (
    <div className={wrapClass}>
      <h2 ref={ref} className={`text-display ${sizeClass} ${cls}`}>
        <span className={lightClass}>{splitLetters(light, 0)}&nbsp;</span>
        <span className="text-foreground">{splitLetters(bold, light.length)}</span>
      </h2>
      {eyebrow ? (
        <p className="mt-4 text-xs tracking-[0.35em] uppercase text-muted-foreground">{eyebrow}</p>
      ) : null}
    </div>
  );
}

const awards = [
  {
    image: serviceFlash,
    title: "The Flash.in",
    desc: "A fast, modern digital platform delivering lightning-quick news, updates and content experiences.",
    tags: "Web • Content • Speed",
  },
  {
    image: serviceCommunity,
    title: "Sports & Cultural Community",
    desc: "A vibrant community platform bringing people together through sports events and cultural celebrations.",
    tags: "Community • Events • Culture",
  },
  {
    image: serviceSankaracharya,
    title: "Sree Sankaracharya Institute of Advanced Skills",
    desc: "Digital presence and solutions for the educational institution — campus, courses and community.",
    tags: "Education • Institution • Web",
  },
  {
    image: serviceManager,
    title: "The Manager LLP",
    desc: "A smart management dashboard for analytics, team coordination and data-driven decisions.",
    tags: "Dashboard • Analytics • SaaS",
  },
  {
    image: serviceBdirection,
    title: "B-Direction\u00a0group of company",
    desc: "Asset management and investment holding company — leading business strategy, investment operations and growth initiatives focused on performance and returns.",
    tags: "Investment • Asset Management • Growth",
  },
  {
    image: serviceWorkspace,
    title: "Workspace",
    desc: "A modern coworking space solution — booking, community and productivity under one roof.",
    tags: "Coworking • Booking • Space",
  },
];

// Deterministic layout (integer hash, no randomness — keeps SSR and browser in sync)
const hash = (i: number, salt: number) =>
  (((Math.imul(i + 1, 2654435761) ^ Math.imul(salt + 7, 40503)) >>> 0) % 1000) / 1000;

// Narrow shafts fanning out from the corner, like light through a gap
const ventureRays = [
  { w: "30vh", a: "-19deg", b: "20px", dur: "11s", delay: "-2s" },
  { w: "13vh", a: "-11deg", b: "10px", dur: "8s", delay: "-5s" },
  { w: "22vh", a: "-4deg", b: "14px", dur: "10s", delay: "0s" },
  { w: "9vh", a: "2deg", b: "8px", dur: "7s", delay: "-3s" },
  { w: "18vh", a: "8deg", b: "12px", dur: "12s", delay: "-7s" },
  { w: "8vh", a: "14deg", b: "8px", dur: "9s", delay: "-1s" },
  { w: "14vh", a: "20deg", b: "14px", dur: "13s", delay: "-4s" },
];

// Particles sit inside the rotated cone: `d` is distance down the beam, spread widens with it.
// Fine dust hugs the centre shaft; larger soft bokeh scatters wide and far.
const ventureSparks = Array.from({ length: 270 }, (_, i) => {
  const bokeh = i % 3 === 0;
  const d = bokeh ? 0.18 + 0.6 * Math.sqrt(hash(i, 1)) : 0.1 + 0.68 * hash(i, 1);
  const centred = (hash(i, 2) + hash(i, 9) + hash(i, 10)) / 3 - 0.5;
  const lateral = bokeh ? (hash(i, 2) - 0.5) * 150 * d : centred * 110 * d;
  return {
    bokeh,
    left: Math.round((50 + lateral) * 10) / 10,
    top: Math.round(d * 1000) / 10,
    size: bokeh ? 4 + Math.round(hash(i, 3) * 10) : 1.5 + Math.round(hash(i, 3) * 3) / 2,
    blur: bokeh && hash(i, 4) > 0.65 ? 2 : 0,
    o: Math.round((bokeh ? 0.5 + hash(i, 5) * 0.5 : 0.6 + hash(i, 5) * 0.4) * 100) / 100,
    sx: Math.round((hash(i, 6) - 0.5) * 30) / 10,
    delay: -Math.round(hash(i, 7) * 140) / 10,
    dur: 7 + Math.round(hash(i, 8) * 8),
  };
});

export function Awards() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const xRef = useRef(0);
  const [x, setX] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const wrap = wrapRef.current;
      const track = trackRef.current;
      if (!wrap || !track) return;
      const total = wrap.offsetHeight - window.innerHeight;
      const progress = total > 0 ? -wrap.getBoundingClientRect().top / total : 0;
      const clamped = Math.min(1, Math.max(0, progress));
      const vw = document.documentElement.clientWidth;
      const cards = cardRefs.current.filter((c): c is HTMLDivElement => !!c);
      const first = cards[0];
      const last = cards[cards.length - 1];
      if (!first || !last) return;
      // Untransformed left edge of the track (its parent has no transform)
      const baseLeft = track.parentElement?.getBoundingClientRect().left ?? 0;
      // Start with the first card centered, end with the last card centered
      const startX = vw / 2 - (baseLeft + first.offsetLeft + first.offsetWidth / 2);
      const endX = vw / 2 - (baseLeft + last.offsetLeft + last.offsetWidth / 2);
      const newX = startX + (endX - startX) * clamped;
      setX(newX);
      xRef.current = newX;

      // 3D coverflow: rotate each card based on its distance from viewport center
      const untransformedLeft = baseLeft;
      cardRefs.current.forEach((card) => {
        if (!card) return;
        const center = untransformedLeft + card.offsetLeft + newX + card.offsetWidth / 2;
        const offset = Math.max(-1, Math.min(1, (center - vw / 2) / (vw / 2)));
        const depth = Math.abs(offset);
        card.style.transform = `rotateY(${offset * 38}deg) translateZ(${-depth * 140}px) scale(${1 - depth * 0.12})`;
        card.style.zIndex = String(100 - Math.round(depth * 50));
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="awards" className="venture-gold-bg border-y border-border">
      <div ref={wrapRef} className="relative h-[240vh]">
        <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
          <div className="venture-light" aria-hidden="true">
            <div className="venture-light__glow" />
            <div className="venture-light__cone">
              {ventureRays.map((r, i) => (
                <div
                  key={i}
                  className="venture-light__ray"
                  style={
                    {
                      "--w": r.w,
                      "--a": r.a,
                      "--b": r.b,
                      "--dur": r.dur,
                      "--delay": r.delay,
                    } as CSSProperties
                  }
                />
              ))}
              {ventureSparks.map((sp, i) => (
                <span
                  key={i}
                  className={sp.bokeh ? "venture-spark" : "venture-spark venture-spark--dust"}
                  style={
                    {
                      left: `${sp.left}%`,
                      top: `${sp.top}%`,
                      width: sp.size,
                      height: sp.size,
                      filter: sp.blur ? `blur(${sp.blur}px)` : undefined,
                      "--o": sp.o,
                      "--sx": `${sp.sx}rem`,
                      animationDelay: `${sp.delay}s`,
                      animationDuration: `${sp.dur}s`,
                    } as CSSProperties
                  }
                />
              ))}
            </div>
          </div>
          <div className="relative z-10 mx-auto w-full max-w-6xl px-6">
            <SectionTitle light="MY " bold="VENTURES" eyebrow="" />
          </div>
          <div className="relative z-10 w-full">
            <div
              ref={trackRef}
              className="flex items-stretch gap-6 will-change-transform"
              style={{ transform: `translate3d(${x}px,0,0)`, perspective: "1400px" }}
            >
              {awards.map((a, i) => (
                <div
                  key={a.title}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  className="flex w-[78vw] shrink-0 will-change-transform sm:w-[52vw] md:w-[22rem]"
                >
                  <article
                    tabIndex={0}
                    className="group relative h-[24rem] w-full overflow-hidden rounded-3xl border border-border bg-card outline-none transition-all duration-500 hover:-translate-y-1 hover:border-highlight/70 hover:shadow-[0_0_32px_-8px_var(--highlight)] focus-visible:border-highlight/70"
                  >
                    <img
                      src={a.image}
                      alt={a.title}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 group-focus-visible:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background via-background/70 to-transparent" />
                    <div className="absolute inset-0 bg-background/80 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100" />
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      <h3 className="text-xl font-semibold leading-snug text-foreground">
                        {a.title}
                      </h3>
                      <div className="grid grid-rows-[0fr] opacity-0 transition-all duration-500 group-hover:grid-rows-[1fr] group-hover:opacity-100 group-focus-visible:grid-rows-[1fr] group-focus-visible:opacity-100">
                        <div className="overflow-hidden">
                          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                            {a.desc}
                          </p>
                          <p className="pt-5 text-xs uppercase tracking-[0.18em] text-highlight">
                            {a.tags}
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const aboutStats = [
  { target: 7, suffix: "+", label: "Years building" },
  { target: 40, suffix: "+", label: "Products shipped" },
  { target: 12, suffix: "", label: "Teams collaborated" },
] as const;

const curtainColors = ["var(--curtain-blue)", "var(--curtain-pink)", "var(--curtain-red)"];
const curtainBars = Array.from({ length: 28 }, (_, i) => ({
  c: curtainColors[Math.floor(hash(i, 11) * 3)] ?? "var(--curtain-blue)",
  d: `${(2.2 + hash(i, 12) * 2.8).toFixed(2)}s`,
  delay: `${(-hash(i, 13) * 5).toFixed(2)}s`,
}));

export function About() {
  const statsRef = useRef<HTMLDivElement | null>(null);
  const [counts, setCounts] = useState<number[]>(() => aboutStats.map((s) => s.target));

  useEffect(() => {
    const el = statsRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let animated = false;

    const startCountUp = () => {
      animated = true;
      if (raf) cancelAnimationFrame(raf);
      const duration = 1400;
      const start = performance.now();
      setCounts(aboutStats.map(() => 1));
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCounts(aboutStats.map((s) => Math.round(1 + (s.target - 1) * eased)));
        if (progress < 1) {
          raf = requestAnimationFrame(tick);
        } else {
          raf = 0;
        }
      };
      raf = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting && !animated) {
          startCountUp();
        } else if (!entry.isIntersecting && entry.boundingClientRect.top > window.innerHeight) {
          animated = false;
          if (raf) {
            cancelAnimationFrame(raf);
            raf = 0;
          }
          setCounts(aboutStats.map(() => 1));
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="about" className="relative overflow-hidden">
      <div className="about-wake pointer-events-none absolute inset-0" aria-hidden="true">
        <WakeGlyph className="absolute inset-0" />
      </div>
      <div className="about-curtain pointer-events-none" aria-hidden="true">
        {curtainBars.map((b, i) => (
          <span key={i} style={{ "--c": b.c, "--d": b.d, "--delay": b.delay } as CSSProperties} />
        ))}
      </div>
      <div className="relative mx-auto max-w-6xl px-6 py-28">
        <SectionTitle light="About" bold="Me" />
        <div className="max-w-3xl text-left">
          <ScrollRevealParagraph text="I have been working on building businesses and initiatives focused on skill development, technology, entrepreneurship, and creating opportunities for young people. I strongly believe that India’s greatest strength is its young population, and I want to contribute by helping young people develop practical skills, become employable, and pursue entrepreneurship. As a strategic-minded entrepreneur, my goal is to build organizations that create employment, encourage innovation, and contribute meaningfully to India’s economic and social development." />
        </div>
        <div ref={statsRef} className="mt-16 grid grid-cols-3 gap-4 sm:gap-10">
          {aboutStats.map((stat, i) => (
            <div key={stat.label}>
              <p className="text-editorial text-4xl tabular-nums text-accent sm:text-5xl md:text-6xl">
                {counts[i] ?? stat.target}
                {stat.suffix}
              </p>
              <p className="text-editorial mt-2 text-[11px] leading-snug text-muted-foreground sm:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <section id="contact" className="contact-overlap relative py-32">
      <div
        className="contact-glow pointer-events-none absolute inset-x-0 top-0 h-96 opacity-40"
        style={{ background: "var(--gradient-glow)" }}
      />
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <RisingWordsHeading
          className="text-display text-5xl md:text-7xl"
          words={[
            { text: "Let's", gold: true },
            { text: "Work", gold: true, nbsp: true },
            { text: "Together" },
          ]}
        />
        <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
          {"\n"}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href="mailto:hello@akshay.dev"
            className="contact-cta inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-xs font-semibold tracking-[0.2em] uppercase text-primary-foreground"
          >
            <Mail className="cta-icon size-4" />
            CONNECT WITH ME
          </a>
        </div>
      </div>
    </section>
  );
}
