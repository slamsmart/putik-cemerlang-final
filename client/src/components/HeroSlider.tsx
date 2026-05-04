import { useState, useEffect, useCallback } from "react";
import { useQuery as useConvexQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";

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

type ConvexSlider = {
  _id: Id<"sliders">;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  displayOrder: number;
  isActive: boolean;
};

// Static fallback shown while Convex loads or if DB is empty
const fallbackSliders: ConvexSlider[] = [
  {
    _id: "slider-1" as Id<"sliders">,
    title: "Pelayanan Informasi Maritim Terpadu",
    subtitle: "Akses data kelautan dan perikanan Kabupaten Malang secara transparan dan akuntabel.",
    ctaText: "Pelajari Selengkapnya",
    ctaLink: "/layanan",
    imageUrl: "/figmaAssets/background.svg",
    displayOrder: 0,
    isActive: true,
  },
  {
    _id: "slider-2" as Id<"sliders">,
    title: "Modernisasi Sektor Perikanan",
    subtitle: "Mendukung nelayan lokal dengan teknologi dan informasi data laut terkini.",
    ctaText: "Lihat Program",
    ctaLink: "/program",
    imageUrl: "/figmaAssets/background-2.svg",
    displayOrder: 1,
    isActive: true,
  },
];

export function HeroSlider() {
  // ✅ ALL hooks must be at the top — no hooks after conditional returns!
  const convexSliders = useConvexQuery(api.sliders.list);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [[current, direction], setPage] = useState([0, 0]);

  // Derive slider list — safe to compute before hooks since no hooks below
  const sliders = (
    convexSliders && convexSliders.length > 0
      ? (convexSliders as ConvexSlider[])
      : fallbackSliders
  ).filter((s) => s.isActive);

  const paginate = useCallback(
    (dir: number) => {
      setPage(([cur]) => [(cur + dir + sliders.length) % sliders.length, dir]);
    },
    [sliders.length]
  );

  // Preload first image to avoid flash
  useEffect(() => {
    if (convexSliders === undefined) return;
    const active =
      convexSliders.length > 0
        ? (convexSliders as ConvexSlider[]).filter((s) => s.isActive)
        : fallbackSliders.filter((s) => s.isActive);

    if (active.length > 0 && active[0].imageUrl) {
      const img = new Image();
      img.src = active[0].imageUrl;
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageLoaded(true);
    } else {
      setImageLoaded(true);
    }
  }, [convexSliders]);

  // Autoplay
  useEffect(() => {
    if (sliders.length <= 1) return;
    const id = setInterval(() => paginate(1), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paginate, sliders.length]);

  // ✅ Conditional returns AFTER all hooks
  if (convexSliders === undefined || !imageLoaded) {
    return <section className="relative h-[420px] sm:h-[500px] md:h-[580px] bg-[#001e40] animate-pulse" />;
  }

  if (!sliders.length) return null;

  const slide = sliders[current % sliders.length];

  return (
    <section className="relative h-[420px] sm:h-[500px] md:h-[580px] overflow-hidden bg-[#001e40]">
      {/* Slides */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={slide._id}
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
          <div className="relative flex h-full flex-col justify-center px-6 sm:px-12 md:px-16 pb-16 sm:pb-20">
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="mb-3 sm:mb-4 inline-block w-fit rounded-full bg-[#c6e7ff]/20 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-[#c6e7ff]"
            >
              Kabupaten Malang
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.55 }}
              className="mb-3 sm:mb-5 max-w-2xl text-2xl sm:text-3xl md:text-5xl font-bold leading-tight text-white"
            >
              {slide.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.55 }}
              className="mb-6 sm:mb-8 max-w-xl text-sm sm:text-base leading-relaxed text-slate-300"
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
                  className="rounded-lg bg-white px-6 sm:px-8 py-2.5 sm:py-3 text-sm font-semibold text-[#001e40] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
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
            className="hidden sm:flex absolute left-4 sm:left-5 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/15 p-2.5 text-white backdrop-blur-sm transition-colors hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <button
            aria-label="Slide berikutnya"
            onClick={() => paginate(1)}
            className="hidden sm:flex absolute right-4 sm:right-5 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/15 p-2.5 text-white backdrop-blur-sm transition-colors hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </>
      )}

      {/* Dot indicators */}
      {sliders.length > 1 && (
        <div className="absolute bottom-5 sm:bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
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
