import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import type { Slider } from "@shared/schema";

const AUTOPLAY_MS = 5000;

const variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? "-100%" : "100%",
    opacity: 0,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const fallbackSliders: Slider[] = [
  {
    id: "slider-1",
    title: "Pelayanan Informasi Maritim Terpadu",
    subtitle: "Akses data kelautan dan perikanan Kabupaten Malang secara transparan dan akuntabel.",
    ctaText: "Pelajari Selengkapnya",
    ctaLink: "/layanan",
    imageUrl: "/figmaAssets/background.svg",
    displayOrder: 0,
    isActive: true,
  },
  {
    id: "slider-2",
    title: "Modernisasi Sektor Perikanan",
    subtitle: "Mendukung nelayan lokal dengan teknologi dan informasi data laut terkini.",
    ctaText: "Lihat Program",
    ctaLink: "/program",
    imageUrl: "/figmaAssets/background-2.svg",
    displayOrder: 1,
    isActive: true,
  },
  {
    id: "slider-3",
    title: "Konservasi Ekosistem Laut",
    subtitle: "Bersama menjaga kelestarian laut Malang untuk generasi yang akan datang.",
    ctaText: "Gabung Relawan",
    ctaLink: "/konservasi",
    imageUrl: "/figmaAssets/background-1.svg",
    displayOrder: 2,
    isActive: true,
  },
];

export function HeroSlider() {
  const { data: apiSliders } = useQuery<Slider[]>({ queryKey: ["/api/sliders"] });

  const sliders = (apiSliders ?? fallbackSliders).filter((s) => s.isActive);
  const [[current, direction], setPage] = useState([0, 0]);

  const paginate = useCallback(
    (dir: number) => {
      setPage(([cur]) => [(cur + dir + sliders.length) % sliders.length, dir]);
    },
    [sliders.length]
  );

  useEffect(() => {
    if (sliders.length <= 1) return;
    const id = setInterval(() => paginate(1), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paginate, sliders.length]);

  if (!sliders.length) return null;
  const slide = sliders[current % sliders.length];

  return (
    <section className="relative h-[580px] overflow-hidden bg-[#001e40]">
      {/* Slides */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={slide.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 will-change-transform"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.imageUrl})` }}
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#001e40]/90 via-[#001e40]/60 to-transparent" />

          {/* Content */}
          <div className="relative flex h-full flex-col justify-center px-16 pb-20">
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="mb-4 inline-block w-fit rounded-full bg-[#c6e7ff]/20 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-[#c6e7ff]"
            >
              Kabupaten Malang
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.55 }}
              className="mb-5 max-w-2xl text-4xl font-bold leading-tight text-white md:text-5xl"
            >
              {slide.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.55 }}
              className="mb-8 max-w-xl text-base leading-relaxed text-slate-300"
            >
              {slide.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="flex gap-4"
            >
              {slide.ctaText && (
                <a
                  href={slide.ctaLink || "#"}
                  className="rounded-lg bg-white px-8 py-3 text-sm font-semibold text-[#001e40] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {slide.ctaText}
                </a>
              )}
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Prev / Next arrows */}
      {sliders.length > 1 && (
        <>
          <button
            aria-label="Slide sebelumnya"
            onClick={() => paginate(-1)}
            className="absolute left-5 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/15 p-2.5 text-white backdrop-blur-sm transition-colors hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button
            aria-label="Slide berikutnya"
            onClick={() => paginate(1)}
            className="absolute right-5 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/15 p-2.5 text-white backdrop-blur-sm transition-colors hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </>
      )}

      {/* Dot indicators */}
      {sliders.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {sliders.map((_, i) => (
            <button
              key={i}
              aria-label={`Ke slide ${i + 1}`}
              onClick={() => setPage([i, i > current ? 1 : -1])}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current % sliders.length ? "w-7 bg-white" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg viewBox="0 0 1440 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 56L60 49C120 42 240 28 360 25.7C480 23.3 600 32.7 720 35C840 37.3 960 32.7 1080 30.3C1200 28 1320 28 1380 28L1440 28V56H0Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
}
