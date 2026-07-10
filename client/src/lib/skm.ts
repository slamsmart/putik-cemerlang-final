export type PublicSkmEntry = {
  _id?: string;
  _creationTime?: number;
  title: string;
  slug: string;
  year: number;
  quarter: string;
  imageUrl?: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
};

export function skmPath(slug: string) {
  return `/skm/${slug}`;
}

export function groupSkmEntriesByYear<T extends { year: number }>(entries: T[]) {
  const groups = new Map<number, T[]>();

  for (const entry of entries) {
    const group = groups.get(entry.year) ?? [];
    group.push(entry);
    groups.set(entry.year, group);
  }

  return Array.from(groups.entries())
    .sort(([yearA], [yearB]) => yearB - yearA)
    .map(([year, items]) => ({ year, items }));
}
