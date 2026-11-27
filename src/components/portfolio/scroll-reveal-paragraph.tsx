import { useEffect, useRef } from "react";

export function ScrollRevealParagraph({ text }: { text: string }) {
  const paragraphRef = useRef<HTMLParagraphElement | null>(null);
  const words = text.trim().split(/\s+/);

  useEffect(() => {
    const paragraph = paragraphRef.current;
    if (!paragraph) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const spans = Array.from(paragraph.querySelectorAll<HTMLSpanElement>("[data-reveal-word]"));
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = paragraph.getBoundingClientRect();
      const viewport = window.innerHeight;
      const distance = Math.max(viewport * 0.3, rect.height - viewport * 0.35);
      const progress = Math.max(0, Math.min(1, (viewport * 0.8 - rect.top) / distance));
      spans.forEach((span, index) => {
        const reveal = motion.matches ? 1 : Math.max(0, Math.min(1, progress * spans.length - index));
        span.style.opacity = String(0.25 + reveal * 0.75);
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    motion.addEventListener("change", schedule);
    void document.fonts.ready.then(schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      motion.removeEventListener("change", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [text]);

  return (
    <p ref={paragraphRef} className="about-reveal-paragraph text-foreground">
      {words.map((word, index) => (
        <span key={`${index}-${word}`}>
          <span data-reveal-word>{word}</span>{index < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}