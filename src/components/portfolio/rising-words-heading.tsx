import { Fragment, useEffect, useRef, useState, type CSSProperties } from "react";

type RisingWord = {
  text: string;
  /** Paint the word in the muted tone instead of the foreground tone. */
  muted?: boolean;
  /** Paint the word in the warm gold accent tone. */
  gold?: boolean;
  /** Keep this word glued to the next one so they never split across lines. */
  nbsp?: boolean;
};

/**
 * Heading whose words rise and fade in one after another when it scrolls into view.
 * The reveal replays each time it scrolls back into view, in either direction; reduced-motion visitors get the finished heading straight away.
 */
export function RisingWordsHeading({
  words,
  className,
}: {
  words: RisingWord[];
  className?: string;
}) {
  const ref = useRef<HTMLHeadingElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setRevealed(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.intersectionRatio >= 0.35) setRevealed(true);
        else if (entry.intersectionRatio === 0) setRevealed(false);
      },
      { threshold: [0, 0.35] },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <h2
      ref={ref}
      className={`words-rise${revealed ? " words-revealed" : ""}${className ? ` ${className}` : ""}`}
    >
      {words.map((word, index) => (
        <Fragment key={`${index}-${word.text}`}>
          <span
            className={word.gold ? "word text-gold" : word.muted ? "word text-muted-foreground/50" : "word"}
            style={{ "--i": index } as CSSProperties}
          >
            {word.text}
          </span>
          {index < words.length - 1 ? (word.nbsp ? "\u00A0" : " ") : ""}
        </Fragment>
      ))}
    </h2>
  );
}
