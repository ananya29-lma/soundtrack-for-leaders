import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Briefcase,
  GraduationCap,
  Megaphone,
  School,
  TrendingUp,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { SectionTitle } from "./sections";

type Role = {
  role: string;
  company: string;
  date: string;
  icon: LucideIcon;
  points: string[];
};

// Oldest first: the first milestone sits on the yellow marker, later years wait above it.
const roles: Role[] = [
  {
    role: "Managing Partner",
    company: "Workspace",
    date: "2020 – Present",
    icon: Briefcase,
    points: [
      "Led business consulting and growth initiatives across marketing, sales, financial management, accounting, and auditing.",
      "Worked directly with businesses to identify growth opportunities and improve financial and commercial performance.",
      "Managed a team delivering integrated marketing, sales, and business-growth solutions to client organizations.",
    ],
  },
  {
    role: "CEO & Managing Director",
    company: "B Direction",
    date: "October 2022 – Present",
    icon: TrendingUp,
    points: [
      "Led the overall management and strategic direction of an asset management and investment holding company, with a focus on investment performance and returns.",
      "Directed business strategy, investment-related operations, organizational development, and management activities.",
      "Oversaw growth initiatives focused on asset management, investment opportunities, and return on investment.",
    ],
  },
  {
    role: "Director",
    company: "Sree Sankaracharya Institute of Advanced Skills",
    date: "2023 – Present",
    icon: School,
    points: [
      "Led institutional expansion and franchise development initiatives, including plans for expanding the institution across India.",
      "Worked on modernizing administration, institutional systems, and operational processes.",
      "Contributed to strategic institutional development with a focus on modern education and scalable operations.",
    ],
  },
  {
    role: "CEO & Director",
    company: "NextGen Innovators",
    date: "2023 – Present",
    icon: GraduationCap,
    points: [
      "Led a group focused on investing in and developing educational institutions to provide modern, industry-oriented education.",
      "Directed strategic planning, institutional development, business operations, and organizational expansion.",
      "Focused on creating modern education opportunities for youth and developing scalable education ventures.",
    ],
  },
  {
    role: "Founder & CEO",
    company: "Manager",
    date: "2024 – Present",
    icon: Bot,
    points: [
      "Founded and lead an AI-powered technology and automation company focused on modern business solutions.",
      "Oversee product strategy, business development, organizational growth, and development of AI-based automation solutions.",
      "Focus on helping businesses automate operations, improve efficiency, reduce operational costs, and manage business processes through technology.",
    ],
  },
  {
    role: "Chairman",
    company: "The Flash Marketing",
    date: "2025 – Present",
    icon: Megaphone,
    points: [
      "Provided strategic leadership and direction for marketing and business-development activities.",
      "Oversaw organizational growth, strategic decision-making, and development of marketing-focused business initiatives.",
      "Guided the team in building and expanding marketing, sales, branding, and client-growth opportunities.",
    ],
  },
  {
    role: "Founder & Chairman",
    company: "Sports & Cultural Organization",
    date: "2026 – Present",
    icon: Trophy,
    points: [
      "Founded and lead a pan-India sports and cultural organization focused on youth development and participation.",
      "Oversee the planning and execution of sports, cultural activities, competitions, and youth-focused events.",
      "Work toward creating opportunities for young people through sports, culture, community engagement, and nationwide programs.",
    ],
  },
];

const yearOf = (date: string) => date.match(/\d{4}/)?.[0] ?? date;
const pad = (n: number) => String(n).padStart(2, "0");

type Geo = { w: number; h: number; cx: number; cy: number; r: number; rp: number; step: number };

const TICKS = 120;

/** Map linear scroll to milestone progress with a short pause on each year. */
function dwell(raw: number) {
  const i = Math.floor(raw);
  const f = raw - i;
  const t = Math.min(1, Math.max(0, (f - 0.2) / 0.6));
  return i + t * t * (3 - 2 * t);
}

export function Experience() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const dialRef = useRef<HTMLDivElement | null>(null);
  const ticksRef = useRef<SVGGElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const geoRef = useRef<Geo | null>(null);
  const [geo, setGeo] = useState<Geo | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let raf = 0;
    const n = roles.length;

    const update = () => {
      raf = 0;
      const wrap = wrapRef.current;
      const g = geoRef.current;
      if (!wrap || !g) return;
      const total = wrap.offsetHeight - window.innerHeight;
      const raw = total > 0 ? -wrap.getBoundingClientRect().top / total : 0;
      const p = dwell(Math.min(1, Math.max(0, raw)) * (n - 1));

      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        const rel = i - p;
        const theta = (rel * g.step * Math.PI) / 180;
        const x = g.cx + g.rp * Math.cos(theta);
        const y = g.cy - g.rp * Math.sin(theta);
        const opacity = rel < 0 ? Math.max(0, 1 + rel * 1.6) : Math.max(0, 1 - rel * 0.26);
        const scale = 1 - Math.min(Math.abs(rel), 3) * 0.06;
        el.style.transform = `translate(${x}px, ${y}px) translate(-100%, -50%) scale(${scale})`;
        el.style.opacity = String(opacity);
        el.style.filter =
          Math.abs(rel) > 1.5 ? `blur(${Math.min(2, Math.abs(rel) - 1.5)}px)` : "none";
      });

      ticksRef.current?.setAttribute("transform", `rotate(${p * g.step} ${g.cx} ${g.cy})`);
      setActive(Math.min(n - 1, Math.max(0, Math.round(p))));
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    const measure = () => {
      const el = dialRef.current;
      if (!el) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      const r = Math.max(200, Math.min(h * 0.62, w * 0.95));
      const cx = w - 40 - r;
      const cy = h * 0.55;
      const rp = r - 90;
      const step = (Math.asin(Math.min(0.9, 92 / rp)) * 180) / Math.PI;
      const next = { w, h, cx, cy, r, rp, step };
      geoRef.current = next;
      setGeo(next);
      schedule();
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (dialRef.current) ro.observe(dialRef.current);
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const current = roles[active] ?? roles[0];
  if (!current) return null;
  const CurrentIcon = current.icon;

  // Fixed glow arc around the yellow marker
  const arcR = geo ? geo.r + 10 : 0;
  const pt = (deg: number, rad: number): [number, number] => {
    const t = (deg * Math.PI) / 180;
    return geo ? [geo.cx + rad * Math.cos(t), geo.cy - rad * Math.sin(t)] : [0, 0];
  };
  const [ax1, ay1] = pt(42, arcR);
  const [ax2, ay2] = pt(-55, arcR);

  return (
    <section id="experience" className="border-y border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 pt-28">
        <SectionTitle light="BUSINESS" bold="JOURNEY" eyebrow="" />
      </div>
      <div
        ref={wrapRef}
        className="relative"
        style={{ height: `${100 + (roles.length - 1) * 60}vh` }}
      >
        <div className="sticky top-0 h-screen overflow-hidden">
          <div className="mx-auto flex h-full max-w-6xl flex-col px-6">
            {/* Heading pinned at the top of the panel for the whole scroll */}
            <div className="shrink-0 pt-5 md:pt-8">
              <SectionTitle
                light="BUSINESS"
                bold="JOURNEY"
                eyebrow=""
                sizeClass="text-3xl md:text-5xl"
                wrapClass="mb-0"
              />
            </div>

            <div className="flex min-h-0 flex-1 flex-col-reverse md:grid md:grid-cols-2 md:items-center md:gap-8">
              {/* Details of the year on the marker */}
              <div className="flex-1 pb-8 md:flex-none md:pb-0">
                <div key={active} className="experience-zoom">
                  <div className="flex items-center gap-4">
                    <span className="grid size-12 place-items-center rounded-full bg-highlight text-highlight-foreground md:size-14">
                      <CurrentIcon className="size-6" />
                    </span>
                    <span className="text-3xl font-semibold tabular-nums text-highlight md:text-4xl">
                      {yearOf(current.date)}
                    </span>
                  </div>
                  <p className="mt-5 text-sm font-medium uppercase tracking-[0.25em] text-highlight md:text-base">
                    {current.company}
                  </p>
                  <h3 className="text-display mt-3 text-4xl md:text-6xl">{current.role}</h3>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {current.date}
                  </p>
                  <ul className="mt-5 space-y-2.5 md:mt-6 md:space-y-3">
                    {current.points.map((pt) => (
                      <li
                        key={pt}
                        className="flex gap-3 text-sm leading-relaxed text-muted-foreground md:text-base"
                      >
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-highlight" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="mt-6 text-sm tabular-nums text-muted-foreground md:mt-8">
                  {pad(active + 1)} / {pad(roles.length)}
                </p>
              </div>

              {/* Dial */}
              <div ref={dialRef} className="relative h-[38%] shrink-0 md:h-full">
                {geo ? (
                  <svg
                    className="pointer-events-none absolute inset-0 overflow-visible"
                    width={geo.w}
                    height={geo.h}
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient
                        id="xp-glow"
                        gradientUnits="userSpaceOnUse"
                        x1="0"
                        y1={ay1}
                        x2="0"
                        y2={ay2}
                      >
                        <stop
                          offset="0"
                          style={{ stopColor: "var(--highlight)", stopOpacity: 0 }}
                        />
                        <stop
                          offset={String((geo.cy - ay1) / (ay2 - ay1))}
                          style={{ stopColor: "var(--highlight)", stopOpacity: 1 }}
                        />
                        <stop
                          offset="1"
                          style={{ stopColor: "var(--highlight)", stopOpacity: 0 }}
                        />
                      </linearGradient>
                      <linearGradient
                        id="xp-tick-fade"
                        gradientUnits="userSpaceOnUse"
                        x1={geo.cx}
                        y1="0"
                        x2={geo.cx + geo.r}
                        y2="0"
                      >
                        <stop offset="0" style={{ stopColor: "white", stopOpacity: 0 }} />
                        <stop offset="0.55" style={{ stopColor: "white", stopOpacity: 0.35 }} />
                        <stop offset="1" style={{ stopColor: "white", stopOpacity: 1 }} />
                      </linearGradient>
                      <mask id="xp-tick-mask">
                        <rect
                          x={geo.cx - geo.r - 40}
                          y={geo.cy - geo.r - 40}
                          width={geo.r * 2 + 80}
                          height={geo.r * 2 + 80}
                          fill="url(#xp-tick-fade)"
                        />
                      </mask>
                    </defs>

                    <g mask="url(#xp-tick-mask)">
                      <g ref={ticksRef} className="text-muted-foreground">
                        {Array.from({ length: TICKS }, (_, i) => {
                          const t = (i / TICKS) * Math.PI * 2;
                          const major = i % 5 === 0;
                          const r1 = geo.r - (major ? 34 : 26);
                          const r2 = geo.r - 10;
                          return (
                            <line
                              key={i}
                              x1={geo.cx + r1 * Math.cos(t)}
                              y1={geo.cy - r1 * Math.sin(t)}
                              x2={geo.cx + r2 * Math.cos(t)}
                              y2={geo.cy - r2 * Math.sin(t)}
                              stroke="currentColor"
                              strokeOpacity={major ? 0.75 : 0.4}
                              strokeWidth={major ? 2.5 : 2}
                              strokeLinecap="round"
                            />
                          );
                        })}
                      </g>
                    </g>

                    <path
                      d={`M ${ax1} ${ay1} A ${arcR} ${arcR} 0 0 1 ${ax2} ${ay2}`}
                      fill="none"
                      stroke="url(#xp-glow)"
                      strokeWidth="2.5"
                      style={{ filter: "drop-shadow(0 0 6px var(--highlight))" }}
                    />
                    <line
                      x1={geo.cx + geo.rp}
                      y1={geo.cy}
                      x2={geo.cx + arcR}
                      y2={geo.cy}
                      stroke="var(--highlight)"
                      strokeWidth="2"
                      style={{ filter: "drop-shadow(0 0 4px var(--highlight))" }}
                    />
                    <circle
                      cx={geo.cx + geo.r - 20}
                      cy={geo.cy}
                      r="11"
                      fill="var(--background)"
                      stroke="var(--highlight)"
                      strokeWidth="3"
                      style={{ filter: "drop-shadow(0 0 8px var(--highlight))" }}
                    />
                    <circle cx={geo.cx + geo.r - 20} cy={geo.cy} r="4.5" fill="var(--foreground)" />
                  </svg>
                ) : null}

                {roles.map((r, i) => {
                  const Icon = r.icon;
                  const isActive = i === active;
                  return (
                    <div
                      key={r.company}
                      ref={(el) => {
                        itemRefs.current[i] = el;
                      }}
                      className="absolute top-0 left-0 will-change-transform"
                      style={{ transformOrigin: "100% 50%", opacity: 0 }}
                    >
                      <div
                        data-active={isActive}
                        className="flex items-center gap-3 rounded-full border border-border bg-card/70 py-2 pr-6 pl-2 backdrop-blur-sm transition-[border-color,box-shadow,background-color] duration-500 data-[active=true]:border-highlight data-[active=true]:bg-card data-[active=true]:shadow-[0_0_40px_-8px_var(--highlight)] md:gap-4 md:pr-8"
                      >
                        <span
                          className={`grid size-10 shrink-0 place-items-center rounded-full transition-colors duration-500 md:size-14 ${
                            isActive
                              ? "bg-highlight text-highlight-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon className="size-4 md:size-6" />
                        </span>
                        <span className="leading-tight">
                          <span
                            className={`block text-sm font-semibold tabular-nums transition-colors duration-500 md:text-lg ${
                              isActive ? "text-highlight" : "text-muted-foreground"
                            }`}
                          >
                            {yearOf(r.date)}
                          </span>
                          <span
                            className={`block max-w-[9rem] truncate text-xs transition-colors duration-500 md:max-w-[13rem] md:text-base ${
                              isActive ? "text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            {r.company}
                          </span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
