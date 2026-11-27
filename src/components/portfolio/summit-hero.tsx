import { useEffect, useRef, useState } from "react";

/* Harborlux "Claim Your Summit" opening: a 7.4 s intro on one master clock, then a live rain sky. */

const DURATION = 7400;
const CDN = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/";
const IMAGES = {
  doors: "hf_20261117_063048_97fd9a70-adbe-46bd-bfce-ec1004f6c7d8",
  aerial: "hf_20261117_063055_ee1debcd-d200-484f-b94f-fad6dcffd4eb",
  back: "hf_20261117_063251_24fbd7cc-00df-49ec-8fbf-d8a0349b1e98",
  mid: "hf_20261117_063252_b9f2fecf-9be0-485f-842f-3aa6bbc251f2",
  front: "hf_20261117_063151_7804d758-a2eb-4499-9b56-8f493edbb206",
} as const;
const TILT_URL = `${CDN}hf_20261117_063355_a600befc-45d6-4a32-9db6-9d6565a89609.mp4`;
const RAIN_URL = `${CDN}hf_20261117_063703_04e54df7-2236-4dff-b95b-a9a34c1f78ec.mp4`;
const TILT_FALLBACK_DURATION = 5.04;
const RAIN_LOOP = 3.6;
const RAIN_LEAD = 0.75;
const LETTERS = ["B", "A", "V", "E", "S", "H"];
const EASE_TEXT = "cubic-bezier(.2,.65,.3,1)";

export const HERO_FONT_URL =
  "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2";

const imageUrl = (id: string, w: number) =>
  `https://images.higgs.ai/?default=1&output=webp&url=${encodeURIComponent(`${CDN}${id}.png`)}&w=${w}&q=85`;

export const HERO_SOCIAL_IMAGE_URL = imageUrl(IMAGES.front, 1920);

/** Resizer width: next hundred at 1x; 1.25x the stage on dense screens (2000 for a 1600 stage). */
function pickImageWidth() {
  const vw = window.innerWidth;
  const vh = Math.max(window.innerHeight, 520);
  const stageW = Math.max(vw, (vh * 16) / 9);
  const factor = window.devicePixelRatio > 1 ? 1.25 : 1;
  return Math.min(2688, Math.ceil((stageW * factor) / 100) * 100);
}

type Point = [seconds: number, props: Keyframe, easingToNext?: string];

function track(el: Element, points: Point[]) {
  const frames: Keyframe[] = [];
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last) throw new Error("track needs points");
  if (first[0] > 0) frames.push({ ...first[1], offset: 0 });
  for (const [t, props, easing] of points) {
    frames.push({ ...props, offset: (t * 1000) / DURATION, ...(easing ? { easing } : {}) });
  }
  if (last[0] * 1000 < DURATION) frames.push({ ...last[1], offset: 1 });
  const anim = el.animate(frames, { duration: DURATION, fill: "both" });
  anim.pause();
  return anim;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function loadImage(src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

export function SummitHero() {
  const scrollWrapRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const shadeRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLHeadingElement>(null);
  const wordInnerRef = useRef<HTMLSpanElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const midRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const openingRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLVideoElement>(null);
  const doorLRef = useRef<HTMLDivElement>(null);
  const doorRRef = useRef<HTMLDivElement>(null);
  const rainARef = useRef<HTMLVideoElement>(null);
  const rainBRef = useRef<HTMLVideoElement>(null);

  // Media renders client-side only, once the right image width and motion preference are known.
  const [media, setMedia] = useState<{ w: number; reduced: boolean } | null>(null);

  useEffect(() => {
    setMedia({
      w: pickImageWidth(),
      reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    });
  }, []);

  useEffect(() => {
    if (!media) return;
    const hero = heroRef.current;
    if (!hero) return;

    const layout = () => {
      const stage = stageRef.current;
      const headline = headlineRef.current;
      const word = wordRef.current;
      const inner = wordInnerRef.current;
      const probe = probeRef.current;
      if (!stage || !headline || !word || !inner || !probe) return;

      const hw = hero.clientWidth;
      const hh = hero.clientHeight;
      const u = window.innerWidth < 820 ? 1 : Math.min(hw / 1440, hh / 900);
      hero.style.setProperty("--u", `${u}px`);

      const sw = stage.offsetWidth;
      const sh = stage.offsetHeight;
      const stageTop = (hh - sh) / 2;
      headline.style.left = `${(sw - hw) / 2}px`;
      headline.style.width = `${hw}px`;

      const baseline = (hh > 1.2 * hw ? 0.362 : 0.43) * sh;

      word.style.fontSize = "100px";
      const perEm = inner.offsetWidth / 100 || 3.4;
      const gap = stageTop + baseline - 0.07 * hh;
      const size = Math.max(
        12,
        Math.min((0.625 * sw) / perEm, (0.92 * hw) / perEm, gap / 0.88),
      );
      word.style.fontSize = `${size}px`;
      word.style.top = `${baseline - probe.offsetTop}px`;
    };

    layout();
    window.addEventListener("resize", layout);
    const fontsReady = Promise.all([
      document.fonts.load('700 100px "Harbor Inter"'),
      document.fonts.load('300 30px "Harbor Inter"'),
    ])
      .then(() => layout())
      .catch(() => {});

    const finishNow = () => {
      hero.dataset["intro"] = "false";
      hero.dataset["done"] = "true";
    };

    if (media.reduced) {
      finishNow();
      return () => window.removeEventListener("resize", layout);
    }

    // Scroll-driven recession: headline and depth layers shrink, drift, blur and dissolve into the next section.
    let scrollRaf = 0;
    const updateScroll = () => {
      scrollRaf = 0;
      const wrap = scrollWrapRef.current;
      if (!wrap) return;
      const runway = wrap.offsetHeight - window.innerHeight;
      const raw = runway > 0 ? clamp(-wrap.getBoundingClientRect().top / runway, 0, 1) : 0;
      const eased = raw * raw * (3 - 2 * raw);
      const blur = Math.pow(raw, 1.35);
      const fadeRaw = clamp((raw - 0.12) / 0.78, 0, 1);
      const fade = fadeRaw * fadeRaw;
      const veilRaw = clamp((raw - 0.18) / 0.82, 0, 1);
      const veil = veilRaw * veilRaw * (3 - 2 * veilRaw);
      hero.style.setProperty("--hx-p", eased.toFixed(4));
      hero.style.setProperty("--hx-p-blur", blur.toFixed(4));
      hero.style.setProperty("--hx-p-fade", fade.toFixed(4));
      hero.style.setProperty("--hx-p-veil", veil.toFixed(4));
    };
    const onScroll = () => {
      if (!scrollRaf) scrollRaf = requestAnimationFrame(updateScroll);
    };
    updateScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    // Rain loop: two copies of the clip crossfade so the 3.6 s loop never visibly restarts.
    const rainVideos = [rainARef.current, rainBRef.current].filter(
      (v): v is HTMLVideoElement => v != null,
    );
    let activeRain = 0;
    const timeouts: number[] = [];
    const setOn = (v: HTMLVideoElement, on: boolean) => {
      v.dataset["on"] = String(on);
    };
    const startRain = () => {
      const v = rainVideos[0];
      if (!v) return;
      activeRain = 0;
      v.currentTime = 0;
      v.play().catch(() => {});
      setOn(v, true);
    };
    const onRainTime = (e: Event) => {
      const current = e.currentTarget as HTMLVideoElement;
      if (current !== rainVideos[activeRain]) return;
      if (current.currentTime < RAIN_LOOP - RAIN_LEAD) return;
      const nextIndex = 1 - activeRain;
      const next = rainVideos[nextIndex];
      if (!next) return;
      next.currentTime = 0;
      next.play().catch(() => {});
      setOn(next, true);
      setOn(current, false);
      activeRain = nextIndex;
      timeouts.push(window.setTimeout(() => current.pause(), 800));
    };
    rainVideos.forEach((v) => {
      v.muted = true;
      v.addEventListener("timeupdate", onRainTime);
    });

    const tilt = tiltRef.current;
    if (tilt) tilt.muted = true;

    let started = false;
    let raf = 0;
    let anims: Animation[] = [];

    const begin = () => {
      if (started) return;
      started = true;
      const els = {
        doorL: doorLRef.current,
        doorR: doorRRef.current,
        tilt: tiltRef.current,
        opening: openingRef.current,
        shade: shadeRef.current,
        back: backRef.current,
        mid: midRef.current,
        headline: headlineRef.current,
        front: frontRef.current,
      };
      if (Object.values(els).some((el) => el == null)) {
        finishNow();
        return;
      }
      const e = els as { [K in keyof typeof els]: NonNullable<(typeof els)[K]> };
      const tx = (v: string) => ({ transform: `translateX(${v})` });
      const ty = (v: string) => ({ transform: `translateY(${v})` });

      anims = [
        track(e.doorL, [[0.02, tx("0"), "cubic-bezier(.1,.2,.8,1)"], [1.13, tx("-101%")]]),
        track(e.doorR, [[0.02, tx("0"), "cubic-bezier(.4,.6,.9,1)"], [1.24, tx("101%")]]),
        track(e.tilt, [[1.19, { opacity: 0 }, "ease-in-out"], [1.47, { opacity: 1 }]]),
        track(e.opening, [[2.45, { opacity: 1 }, "cubic-bezier(.45,0,.55,1)"], [2.95, { opacity: 0 }]]),
        ...letterRefs.current.flatMap((el, i) => {
          if (!el) return [];
          const t0 = 2.45 + i * 0.054;
          return [
            track(el, [
              [t0, { opacity: 0, transform: "translateY(0.14em)" }, EASE_TEXT],
              [t0 + 0.7, { opacity: 1, transform: "translateY(0)" }],
            ]),
          ];
        }),
        track(e.shade, [[2.9, { opacity: 0 }, "ease-in-out"], [3.7, { opacity: 1 }]]),
        track(e.back, [[2.9, ty("0"), "cubic-bezier(.45,0,.35,1)"], [4.3, ty("-1.5%")]]),
        track(e.mid, [
          [2.9, ty("0"), "cubic-bezier(.45,0,.3,1)"],
          [4.3, ty("-4%")],
          [4.6, ty("-4%"), "cubic-bezier(.45,0,.55,1)"],
          [6.9, ty("0")],
        ]),
        track(e.headline, [[3.0, ty("6%"), "cubic-bezier(.3,0,.4,1)"], [4.8, ty("0")]]),
        track(e.front, [
          [3.35, ty("66%"), "cubic-bezier(.2,.5,.2,1)"],
          [6.0, ty("-2.5%"), "cubic-bezier(.45,0,.55,1)"],
          [7.3, ty("0")],
        ]),
      ];

      const video = e.tilt;
      let tiltPlaying = false;
      let tiltDone = false;
      let rainStarted = false;
      const start = performance.now();

      const tick = (now: number) => {
        const t = Math.min(now - start, DURATION);
        for (const a of anims) a.currentTime = t;
        const s = t / 1000;

        if (!tiltDone && s >= 1.25) {
          const clip = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : TILT_FALLBACK_DURATION;
          const baseRate = clip / 1.6;
          if (s >= 2.85) {
            video.pause();
            video.currentTime = Math.max(0, clip - 0.02);
            tiltDone = true;
          } else {
            if (!tiltPlaying) {
              tiltPlaying = true;
              video.playbackRate = baseRate;
              video.play().catch(() => {});
            }
            const target = ((s - 1.25) / 1.6) * clip;
            const drift = target - video.currentTime;
            video.playbackRate = baseRate * clamp(1 + drift * 2, 0.85, 1.2);
          }
        }

        if (!rainStarted && s >= 2.4) {
          rainStarted = true;
          startRain();
        }

        if (t < DURATION) {
          raf = requestAnimationFrame(tick);
        } else {
          finishNow();
          for (const a of anims) a.cancel();
          anims = [];
        }
      };
      raf = requestAnimationFrame(tick);
    };

    const tiltReady = new Promise<void>((resolve) => {
      if (!tilt || tilt.readyState >= 4) return resolve();
      tilt.addEventListener("canplaythrough", () => resolve(), { once: true });
      tilt.addEventListener("error", () => resolve(), { once: true });
    });
    let cancelled = false;
    Promise.all([
      loadImage(imageUrl(IMAGES.doors, media.w)),
      loadImage(imageUrl(IMAGES.aerial, media.w)),
      loadImage(imageUrl(IMAGES.back, media.w)),
      loadImage(imageUrl(IMAGES.mid, media.w)),
      loadImage(imageUrl(IMAGES.front, media.w)),
      tiltReady,
      fontsReady,
    ]).then(() => {
      if (!cancelled) timeouts.push(window.setTimeout(begin, 120));
    });
    timeouts.push(window.setTimeout(begin, 5000));

    return () => {
      cancelled = true;
      window.removeEventListener("resize", layout);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      timeouts.forEach((id) => window.clearTimeout(id));
      if (raf) cancelAnimationFrame(raf);
      anims.forEach((a) => a.cancel());
      rainVideos.forEach((v) => {
        v.removeEventListener("timeupdate", onRainTime);
        v.pause();
      });
      tilt?.pause();
    };
  }, [media]);

  const src = (id: string) => (media ? imageUrl(id, media.w) : undefined);

  return (
    <div ref={scrollWrapRef} className="hx-scroll-stage">
      <section ref={heroRef} className="hx-hero" data-intro="true" aria-label="Harborlux">
        <div ref={stageRef} className="hx-stage">
          <div ref={backRef} className="hx-layer hx-back">
            {media && <img src={src(IMAGES.back)} alt="" draggable={false} />}
            {media && !media.reduced && (
              <>
                <video ref={rainARef} className="hx-rain" src={RAIN_URL} muted playsInline preload="auto" aria-hidden="true" />
                <video ref={rainBRef} className="hx-rain" src={RAIN_URL} muted playsInline preload="auto" aria-hidden="true" />
              </>
            )}
            <div ref={shadeRef} className="hx-shade" />
          </div>

          <div ref={headlineRef} className="hx-headline">
            <h1 ref={wordRef} className="hx-word" aria-label="BAVESH">
              <span ref={wordInnerRef} className="hx-word-inner" aria-hidden="true">
                {LETTERS.map((l, i) => (
                  <span
                    key={i}
                    ref={(el) => {
                      letterRefs.current[i] = el;
                    }}
                    className="hx-letter"
                  >
                    {l}
                  </span>
                ))}
              </span>
              <span ref={probeRef} className="hx-probe" aria-hidden="true" />
            </h1>
          </div>

          <div ref={midRef} className="hx-layer hx-mid">
            {media && <img src={src(IMAGES.mid)} alt="" draggable={false} />}
          </div>

          <div ref={frontRef} className="hx-layer hx-front">
            <div className="hx-glass" />
            {media && (
              <img
                src={src(IMAGES.front)}
                alt="A man in a long dark coat at a glass balcony overlooking a rainy neon harbour"
                draggable={false}
              />
            )}
          </div>
        </div>

        <div className="hx-exit-veil" aria-hidden="true" />

        <div ref={openingRef} className="hx-opening" aria-hidden="true">
          {media && <img src={src(IMAGES.aerial)} alt="" draggable={false} />}
          {media && !media.reduced && <video ref={tiltRef} src={TILT_URL} muted playsInline preload="auto" />}
        </div>

        <div className="hx-doors" aria-hidden="true">
          <div
            ref={doorLRef}
            className="hx-door hx-door-l"
            style={media ? { backgroundImage: `url("${imageUrl(IMAGES.doors, media.w)}")` } : undefined}
          />
          <div
            ref={doorRRef}
            className="hx-door hx-door-r"
            style={media ? { backgroundImage: `url("${imageUrl(IMAGES.doors, media.w)}")` } : undefined}
          />
        </div>
      </section>
    </div>
  );
}