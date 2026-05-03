import { type User, type InsertUser, type Slider, type InsertSlider, type UpdateSlider } from "@shared/schema";
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

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private sliders: Map<string, Slider>;

  constructor() {
    this.users = new Map();
    this.sliders = new Map();
    defaultSliders.forEach((s) => this.sliders.set(s.id, s));
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
}

export const storage = new MemStorage();
