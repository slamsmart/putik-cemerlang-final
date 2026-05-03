import { type User, type InsertUser, type Slider, type InsertSlider, type UpdateSlider, type Stat, type InsertStat, type UpdateStat } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getSliders(): Promise<Slider[]>;
  getSlider(id: string): Promise<Slider | undefined>;
  createSlider(slider: InsertSlider): Promise<Slider>;
  updateSlider(id: string, slider: UpdateSlider): Promise<Slider | undefined>;
  deleteSlider(id: string): Promise<boolean>;

  getStats(): Promise<Stat[]>;
  getStat(id: string): Promise<Stat | undefined>;
  createStat(stat: InsertStat): Promise<Stat>;
  updateStat(id: string, stat: UpdateStat): Promise<Stat | undefined>;
  deleteStat(id: string): Promise<boolean>;
}

const defaultSliders: Slider[] = [
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

const defaultStats: Stat[] = [
  { id: "stat-1", icon: "Anchor", value: "350+", label: "Nelayan Terdaftar", highlight: false, displayOrder: 0, isActive: true, linkUrl: "#" },
  { id: "stat-2", icon: "Fish", value: "3", label: "Pembudidaya Ikan", highlight: false, displayOrder: 1, isActive: true, linkUrl: "#" },
  { id: "stat-3", icon: "Ship", value: "928", label: "Unit Perikanan", highlight: false, displayOrder: 2, isActive: true, linkUrl: "#" },
  { id: "stat-4", icon: "Sailboat", value: "142", label: "Kapal Terverifikasi", highlight: false, displayOrder: 3, isActive: true, linkUrl: "#" },
  { id: "stat-5", icon: "ShieldCheck", value: "19", label: "Pokmaswas Aktif", highlight: false, displayOrder: 4, isActive: true, linkUrl: "#" },
  { id: "stat-6", icon: "TreePine", value: "5.7", label: "Luas Mangrove (Ha)", highlight: false, displayOrder: 5, isActive: true, linkUrl: "#" },
  { id: "stat-7", icon: "Waves", value: "2.3", label: "Terumbu Karang (Ha)", highlight: false, displayOrder: 6, isActive: true, linkUrl: "#" },
  { id: "stat-8", icon: "MapPin", value: "25", label: "Titik Penyu", highlight: false, displayOrder: 7, isActive: true, linkUrl: "#" },
  { id: "stat-9", icon: "Users", value: "785", label: "Masyarakat Terlayani", highlight: false, displayOrder: 8, isActive: true, linkUrl: "#" },
  { id: "stat-10", icon: "TrendingUp", value: "95.12%", label: "Survey Kepuasan", highlight: true, displayOrder: 9, isActive: true, linkUrl: "#" },
];

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private sliders: Map<string, Slider>;
  private stats: Map<string, Stat>;

  constructor() {
    this.users = new Map();
    this.sliders = new Map();
    this.stats = new Map();
    defaultSliders.forEach((s) => this.sliders.set(s.id, s));
    defaultStats.forEach((s) => this.stats.set(s.id, s));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u) => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getSliders(): Promise<Slider[]> {
    return Array.from(this.sliders.values()).sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async getSlider(id: string): Promise<Slider | undefined> {
    return this.sliders.get(id);
  }

  async createSlider(insertSlider: InsertSlider): Promise<Slider> {
    const id = randomUUID();
    const slider: Slider = {
      id,
      title: insertSlider.title,
      subtitle: insertSlider.subtitle ?? "",
      ctaText: insertSlider.ctaText ?? "",
      ctaLink: insertSlider.ctaLink ?? "/",
      imageUrl: insertSlider.imageUrl ?? "",
      displayOrder: insertSlider.displayOrder ?? this.sliders.size,
      isActive: insertSlider.isActive ?? true,
    };
    this.sliders.set(id, slider);
    return slider;
  }

  async updateSlider(id: string, update: UpdateSlider): Promise<Slider | undefined> {
    const existing = this.sliders.get(id);
    if (!existing) return undefined;
    const updated: Slider = { ...existing, ...update };
    this.sliders.set(id, updated);
    return updated;
  }

  async deleteSlider(id: string): Promise<boolean> {
    return this.sliders.delete(id);
  }

  async getStats(): Promise<Stat[]> {
    return Array.from(this.stats.values()).sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async getStat(id: string): Promise<Stat | undefined> {
    return this.stats.get(id);
  }

  async createStat(insertStat: InsertStat): Promise<Stat> {
    const id = randomUUID();
    const stat: Stat = {
      id,
      ...insertStat,
      displayOrder: insertStat.displayOrder ?? this.stats.size,
      isActive: insertStat.isActive ?? true,
      highlight: insertStat.highlight ?? false,
      linkUrl: insertStat.linkUrl ?? "#",
    };
    this.stats.set(id, stat);
    return stat;
  }

  async updateStat(id: string, update: UpdateStat): Promise<Stat | undefined> {
    const existing = this.stats.get(id);
    if (!existing) return undefined;
    const updated: Stat = { ...existing, ...update };
    this.stats.set(id, updated);
    return updated;
  }

  async deleteStat(id: string): Promise<boolean> {
    return this.stats.delete(id);
  }
}

export const storage = new MemStorage();
