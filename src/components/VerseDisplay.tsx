"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchVerse, getRandomReference, type BibleVerse } from "@/lib/bible-api";

const INTERVAL_SECONDS = 30;

export default function VerseDisplay() {
  const [verse, setVerse] = useState<BibleVerse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [countdown, setCountdown] = useState(INTERVAL_SECONDS);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentRefRef = useRef<string | undefined>(undefined);

  const loadVerse = useCallback(async (animate = true) => {
    try {
      if (animate && verse) {
        setTransitioning(true);
        await new Promise((r) => setTimeout(r, 500));
      }
      setLoading(true);
      setError(null);
      const ref = getRandomReference(currentRefRef.current);
      const data = await fetchVerse(ref);
      currentRefRef.current = ref;
      setVerse(data);
      setCountdown(INTERVAL_SECONDS);
    } catch {
      setError("Could not fetch verse. Retrying…");
      setTimeout(() => loadVerse(false), 5000);
    } finally {
      setLoading(false);
      setTransitioning(false);
    }
  }, [verse]);

  // Initial load
  useEffect(() => {
    loadVerse(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-rotation timer
  useEffect(() => {
    if (paused) return;

    timerRef.current = setInterval(() => {
      loadVerse(true);
    }, INTERVAL_SECONDS * 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, loadVerse]);

  // Countdown
  useEffect(() => {
    if (paused) return;

    countdownRef.current = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : INTERVAL_SECONDS));
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [paused]);

  const handleNext = () => {
    setCountdown(INTERVAL_SECONDS);
    loadVerse(true);
  };

  const togglePause = () => {
    setPaused((p) => !p);
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12" style={{ zIndex: 10 }}>
      {/* Header */}
      <header className="mb-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          {/* Cross SVG */}
          <svg
            className="cross-glow w-8 h-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            style={{ color: "var(--gold)" }}
          >
            <path d="M12 2v20M5 7h14" strokeLinecap="round" />
          </svg>
          <h1
            className="text-3xl sm:text-4xl font-bold tracking-wide"
            style={{ color: "var(--gold-light)" }}
          >
            Daily Scripture
          </h1>
          <svg
            className="cross-glow w-8 h-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            style={{ color: "var(--gold)" }}
          >
            <path d="M12 2v20M5 7h14" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-sm tracking-widest uppercase" style={{ color: "var(--text-secondary)" }}>
          King James Version
        </p>
      </header>

      {/* Verse Card */}
      <div className="verse-card w-full max-w-2xl p-8 sm:p-12">
        {loading && !verse ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="pulse-glow text-lg" style={{ color: "var(--gold)" }}>
              Opening the Word…
            </div>
          </div>
        ) : error && !verse ? (
          <div className="text-center py-8 text-red-300">{error}</div>
        ) : verse ? (
          <div className={transitioning ? "fade-out" : ""}>
            <blockquote
              key={verse.reference}
              className="verse-text-enter text-xl sm:text-2xl leading-relaxed sm:leading-relaxed text-center"
              style={{
                color: "var(--text-primary)",
                fontStyle: "italic",
                lineHeight: 1.8,
              }}
            >
              &ldquo;{verse.text}&rdquo;
            </blockquote>
            <div
              key={`ref-${verse.reference}`}
              className="ref-enter mt-8 text-center"
            >
              <span
                className="text-lg font-semibold tracking-wide"
                style={{ color: "var(--gold)" }}
              >
                — {verse.reference}
              </span>
              <span
                className="block mt-1 text-xs tracking-widest uppercase"
                style={{ color: "var(--text-secondary)" }}
              >
                {verse.translation_name}
              </span>
            </div>
          </div>
        ) : null}

        {/* Countdown bar */}
        {!paused && verse && (
          <div className="mt-8 w-full rounded overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
            <div
              className="countdown-bar"
              style={{
                width: `${(countdown / INTERVAL_SECONDS) * 100}%`,
              }}
            />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <button className="btn-golden" onClick={handleNext} disabled={loading}>
          {loading ? "Loading…" : "Next Verse"}
        </button>
        <button className="btn-golden" onClick={togglePause}>
          {paused ? "▶ Resume" : "⏸ Pause"}
        </button>
      </div>

      {/* Timer info */}
      <div className="mt-4 text-xs" style={{ color: "var(--text-secondary)" }}>
        {paused ? "Auto-rotation paused" : `Next verse in ${countdown}s`}
      </div>

      {/* Footer */}
      <footer
        className="mt-auto pt-12 pb-6 text-center text-xs tracking-wide"
        style={{ color: "var(--text-secondary)" }}
      >
        Verses from{" "}
        <a
          href="https://bible-api.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:opacity-80"
          style={{ color: "var(--gold)" }}
        >
          bible-api.com
        </a>{" "}
        · KJV Translation
      </footer>
    </div>
  );
}
