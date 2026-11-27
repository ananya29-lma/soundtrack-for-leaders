const marquee = [
  "BUSINESS EXPANSION",
  "STRATEGIC OPERATIONS",
  "CORPORATE TRAINING",
  "BRANDING & MARKETING",
  "DIGITAL TRANSFORMATION",
  "TECHNOLOGY SOLUTIONS\n",
  "BUSINESS ANALYTICS\u00a0",
  "INNOVATION & GROWTH STRATEGY",
  "INVESTMENT STRATEGY",
  "MARKET & INDUSTRY RESEARCH\n",
  "GROWTH CAPITAL ADVISORY\n",
];

// Second row starts mid-list so the two rows never line up word-for-word
const offsetRow = [...marquee.slice(5), ...marquee.slice(0, 5)];

function Row({ items, reverse }: { items: string[]; reverse?: boolean }) {
  return (
    <div
      className={`marquee-track flex w-max gap-10 ${reverse ? "marquee-reverse" : ""}`}
      aria-hidden={reverse ? "true" : undefined}
    >
      {[...items, ...items, ...items, ...items].map((m, i) => (
        <span
          key={i}
          className={`strip-text flex items-center gap-10 whitespace-nowrap text-2xl font-bold uppercase tracking-tight md:text-3xl ${
            reverse ? "opacity-[0.35]" : ""
          }`}
        >
          {m.trim()}
          <span className={i % 2 ? "strip-spark-alt" : "strip-spark"}>✦</span>
        </span>
      ))}
    </div>
  );
}

export function Marquee() {
  return (
    <div
      id="services"
      className="marquee-mask strip-band flex flex-col gap-4 overflow-hidden py-8 md:py-10"
    >
      <Row items={marquee} />
      <Row items={offsetRow} reverse />
    </div>
  );
}
