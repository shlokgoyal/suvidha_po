import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import type { Product } from '@/types';

export async function getProductsByBrand(
  brandId: string
): Promise<Product[]> {
  const q = query(
    collection(db, 'products'),
    where('brand_id', '==', brandId),
    where('is_active', '==', true)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Product
  );
}
