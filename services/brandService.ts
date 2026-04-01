import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import type { Brand } from '@/types';

export async function getBrandsByDistributor(
  distributorId: string
): Promise<Brand[]> {
  const q = query(
    collection(db, 'brands'),
    where('distributor_id', '==', distributorId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Brand);
}
