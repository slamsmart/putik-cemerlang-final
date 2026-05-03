# Putik Cemerlang — Marine Information System Admin Portal
**Kabupaten Malang**

## Stack
- **Frontend**: React + Vite, Tailwind CSS, shadcn/ui, framer-motion, TanStack Query v5, wouter routing
- **Backend**: Express.js (TypeScript), Drizzle ORM, PostgreSQL
- **Storage**: In-memory (MemStorage) — Convex/PostgreSQL migration pending
- **Media**: Cloudinary (credentials pending — see environment variables)

## Project Structure
```
client/src/
  pages/
    LandingPage.tsx        # Public landing page with animated HeroSlider
    DashboardPage.tsx      # Admin dashboard overview
    BukuTamuPage.tsx       # Guest book management
    ArsipSuratPage.tsx     # Letter archive
    KontenSliderPage.tsx   # Hero slider + metadata management
    PengaturanPage.tsx     # Settings
  components/
    AdminLayout.tsx        # Shared admin layout + sidebar navigation
    HeroSlider.tsx         # Animated framer-motion slider (fetches from /api/sliders)
  App.tsx                  # All route definitions

server/
  index.ts                 # Entry point
  routes.ts                # REST API: /api/sliders, /api/upload
  storage.ts               # IStorage interface + MemStorage (3 seeded sliders)
  cloudinary.ts            # Cloudinary upload helper
  vite.ts                  # Vite dev server integration

shared/
  schema.ts                # Drizzle schema: users, sliders tables + Zod types
```

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/sliders | Fetch all sliders (sorted by displayOrder) |
| POST | /api/sliders | Create slider |
| PUT | /api/sliders/:id | Update slider |
| DELETE | /api/sliders/:id | Delete slider |
| POST | /api/upload | Upload image to Cloudinary (falls back to placeholder if not configured) |

## Environment Variables Required
- `DATABASE_URL` — PostgreSQL connection string (Replit managed)
- `CLOUDINARY_CLOUD_NAME` — Cloudinary cloud name
- `CLOUDINARY_API_KEY` — Cloudinary API key
- `CLOUDINARY_API_SECRET` — Cloudinary API secret

## Animation Approach (framer-motion)
- GPU-accelerated: only `transform` + `opacity` animated
- `will-change-transform` + `backfaceVisibility: hidden` for hardware acceleration
- `AnimatePresence mode="popLayout"` for exit animations
- `whileInView` with `once: true` for scroll-triggered animations
- Autoplay slider interval: 5000ms

## Admin Routes
- `/admin` → Dashboard
- `/admin/buku-tamu` → Buku Tamu
- `/admin/arsip-surat` → Arsip Surat
- `/admin/konten-slider` → Konten & Slider (slider management + image upload)
- `/admin/pengaturan` → Pengaturan

## Pending Integrations
- **Cloudinary**: Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` env vars
- **Convex**: User has not provided deployment URL — currently using MemStorage (data resets on restart)
