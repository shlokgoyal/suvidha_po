import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import type { Distributor } from '@/types';

export async function getDistributorByNumber(
  distNumber: string
): Promise<Distributor | null> {
  const q = query(
    collection(db, 'distributors'),
    where('dist_number', '==', distNumber)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Distributor;
}
