import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { PageAudio } from "@/components/portfolio/hero-audio";
import { Marquee } from "@/components/portfolio/marquee";
import { Experience } from "@/components/portfolio/experience-dial";
import { HERO_FONT_URL, HERO_SOCIAL_IMAGE_URL, SummitHero } from "@/components/portfolio/summit-hero";
import { About, Awards, Contact, Work } from "@/components/portfolio/sections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bavesh — CEO & Managing Director" },
      {
        name: "description",
        content:
          "Portfolio of Bavesh, a strategic entrepreneur building businesses in skill development, technology, education and media across India and the UAE.",
      },
      { property: "og:title", content: "Bavesh — CEO & Managing Director" },
      {
        property: "og:description",
        content:
          "Strategic works, ventures and experience of an entrepreneur focused on skills, innovation and youth empowerment.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: HERO_SOCIAL_IMAGE_URL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: HERO_SOCIAL_IMAGE_URL },
    ],
    links: [
      { rel: "preload", href: HERO_FONT_URL, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://images.higgs.ai" },
      { rel: "preconnect", href: "https://d8j0ntlcm91z4.cloudfront.net" },
    ],
  }),
  component: Index,
});

function Index() {
  const nextSectionRef = useRef<HTMLDivElement>(null);
  return (
    <main className="bg-background">
      <PageAudio nextSectionRef={nextSectionRef} />
      <SummitHero />
      <div ref={nextSectionRef} className="hx-overlap">
        <About />
        <Awards />
        <Marquee />
        <Work />
        <Experience />
        <Contact />
        <footer className="border-t border-border px-6 py-8 text-center text-xs text-muted-foreground">
          © 2026 Bavesh. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
