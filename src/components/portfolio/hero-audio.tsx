import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import soundtrack from "@/assets/hero-soundtrack.mp3.asset.json";
import continuousSoundtrack from "@/assets/continuous-soundtrack.mp3.asset.json";
import { CONTINUOUS_TRACK_VOLUME, HERO_TRACK_VOLUME, soundtrackState } from "@/lib/hero-audio";

export function PageAudio({ nextSectionRef }: { nextSectionRef: RefObject<HTMLDivElement | null> }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const continuousRef = useRef<HTMLAudioElement>(null);
  const enabledRef = useRef(true);
  const [playing, setPlaying] = useState(false);

  const sync = useCallback(() => {
    const audio = audioRef.current;
    const continuous = continuousRef.current;
    const nextSection = nextSectionRef.current;
    if (!audio || !continuous || !nextSection) return;
    const state = soundtrackState(
      nextSection.getBoundingClientRect().top,
      window.innerHeight,
      enabledRef.current,
      !document.hidden,
    );
    for (const [track, muted] of [[audio, state.heroMuted], [continuous, state.continuousMuted]] as const) {
      track.muted = muted;
      if (muted) {
        track.pause();
      } else if (track.paused) {
        void track.play().catch(() => {
          if (track === continuous) setPlaying(false);
        });
      }
    }
  }, [nextSectionRef]);

  useEffect(() => {
    const audio = audioRef.current;
    const continuous = continuousRef.current;
    if (audio) audio.volume = HERO_TRACK_VOLUME;
    if (continuous) continuous.volume = CONTINUOUS_TRACK_VOLUME;
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      document.removeEventListener("visibilitychange", sync);
      audio?.pause();
      continuous?.pause();
    };
  }, [sync]);

  const toggle = () => {
    enabledRef.current = !playing;
    sync();
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={soundtrack.url}
        loop
        preload="auto"
      />
      <audio
        ref={continuousRef}
        src={continuousSoundtrack.url}
        loop
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="fixed right-6 top-6 z-50 bg-background/70 text-foreground backdrop-blur-sm"
        onClick={toggle}
        aria-label={playing ? "Mute music" : "Play music"}
        title={playing ? "Mute music" : "Play music"}
        aria-pressed={playing}
      >
        {playing ? <Volume2 /> : <VolumeX />}
      </Button>
    </>
  );
}