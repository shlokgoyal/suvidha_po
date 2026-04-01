import type { Brand, BrandSection, CartItem, POItem } from '@/types';

export function groupByBrand(items: (CartItem | POItem)[]): BrandSection[] {
  const map = new Map<string, { brand: Brand; data: (CartItem | POItem)[] }>();

  for (const item of items) {
    const brandId = item.brand.id;
    const existing = map.get(brandId);
    if (existing) {
      existing.data.push(item);
    } else {
      map.set(brandId, { brand: item.brand, data: [item] });
    }
  }

  return Array.from(map.values());
}
