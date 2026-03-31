"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// High-quality nature images (Unsplash — free to use)
// Church presentation style: sunsets, mountains, skies, water, fields
const NATURE_IMAGES = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&q=80", // Yosemite valley sunrise
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80", // Foggy forest sunbeams
  "https://images.unsplash.com/photo-1500534314263-e97e3dbb3e85?w=1920&q=80", // Golden sunset sky
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80", // Tropical beach sunset
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80", // Mountain peaks light
  "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1920&q=80", // Pine trees sunlight
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920&q=80", // Lake reflections sunset
  "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=1920&q=80", // Mountain lake sunrise
];

const SLIDE_DURATION = 12000; // ms per image

interface Bokeh {
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

function generateBokeh(count: number): Bokeh[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 80 + 20,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 10,
    opacity: Math.random() * 0.12 + 0.03,
  }));
}

export default function AnimatedBackground() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [transitioning, setTransitioning] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<Set<number>>(new Set());
  const bokehRef = useRef<Bokeh[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (bokehRef.current.length === 0) {
    bokehRef.current = generateBokeh(15);
  }
  const bokeh = bokehRef.current;

  // Preload images
  useEffect(() => {
    NATURE_IMAGES.forEach((src, i) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setImagesLoaded((prev) => new Set(prev).add(i));
      };
    });
  }, []);

  // Cycle images
  const advanceSlide = useCallback(() => {
    const next = (currentIndex + 1) % NATURE_IMAGES.length;
    setNextIndex(next);
    setTransitioning(true);

    // After crossfade completes, swap layers
    setTimeout(() => {
      setCurrentIndex(next);
      setTransitioning(false);
    }, 2000); // match CSS transition duration
  }, [currentIndex]);

  useEffect(() => {
    timerRef.current = setTimeout(advanceSlide, SLIDE_DURATION);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [advanceSlide]);

  // Ken Burns direction alternates per slide
  const kenBurnsClass = (idx: number) =>
    idx % 2 === 0 ? "ken-burns-a" : "ken-burns-b";

  return (
    <>
      {/* Base color while images load */}
      <div
        className="fixed inset-0 z-0"
        aria-hidden="true"
        style={{ background: "#0a0e1a" }}
      />

      {/* Current (bottom) image layer */}
      <div
        className={`nature-slide ${kenBurnsClass(currentIndex)}`}
        aria-hidden="true"
        style={{
          backgroundImage: `url(${NATURE_IMAGES[currentIndex]})`,
          zIndex: 1,
        }}
      />

      {/* Next (top) image layer — fades in during transition */}
      <div
        className={`nature-slide ${kenBurnsClass(nextIndex)} ${
          transitioning ? "nature-slide-visible" : "nature-slide-hidden"
        }`}
        aria-hidden="true"
        style={{
          backgroundImage: `url(${NATURE_IMAGES[nextIndex]})`,
          zIndex: 2,
        }}
      />

      {/* Dark gradient overlay for text readability */}
      <div className="nature-overlay" aria-hidden="true" />

      {/* Soft vignette */}
      <div className="nature-vignette" aria-hidden="true" />

      {/* Bokeh / lens flare orbs */}
      {bokeh.map((b, i) => (
        <div
          key={`bokeh-${i}`}
          className="bokeh-orb"
          aria-hidden="true"
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            opacity: b.opacity,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}

      {/* Soft light rays from top */}
      {[20, 45, 70].map((left, i) => (
        <div
          key={`ray-${i}`}
          className="light-ray-nature"
          aria-hidden="true"
          style={{
            left: `${left}%`,
            animationDelay: `${i * 2.5}s`,
            transform: `rotate(${(i - 1) * 5}deg)`,
          }}
        />
      ))}
    </>
  );
}
