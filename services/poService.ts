import {
  collection,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  writeBatch,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { CartItem, PurchaseOrder, POItem, Distributor } from '@/types';

export async function createPO(
  cartItems: CartItem[],
  distributor: Distributor,
  martId: string
): Promise<PurchaseOrder> {
  const batch = writeBatch(db);

  const poRef = doc(collection(db, 'purchase_orders'));
  const now = new Date().toISOString();

  batch.set(poRef, {
    distributor_id: distributor.id,
    mart_id: martId,
    status: 'ordered',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });

  const poItems: POItem[] = [];
  for (const cartItem of cartItems) {
    const itemRef = doc(collection(db, 'po_items'));
    batch.set(itemRef, {
      po_id: poRef.id,
      product_id: cartItem.product.id,
      brand_id: cartItem.brand.id,
      quantity: cartItem.quantity,
      unit_price: cartItem.product.price,
    });
    poItems.push({
      id: itemRef.id,
      po_id: poRef.id,
      product: cartItem.product,
      brand: cartItem.brand,
      quantity: cartItem.quantity,
      unit_price: cartItem.product.price,
    });
  }

  await batch.commit();

  return {
    id: poRef.id,
    distributor,
    status: 'ordered',
    created_at: now,
    items: poItems,
  };
}

export async function getAllPOs(martId: string): Promise<PurchaseOrder[]> {
  const q = query(
    collection(db, 'purchase_orders'),
    where('mart_id', '==', martId),
    orderBy('created_at', 'desc')
  );
  const snapshot = await getDocs(q);

  const orders: PurchaseOrder[] = [];
  for (const poDoc of snapshot.docs) {
    const poData = poDoc.data();

    const distDoc = await getDoc(doc(db, 'distributors', poData.distributor_id));
    const distributor = { id: distDoc.id, ...distDoc.data() } as Distributor;

    const itemsQuery = query(
      collection(db, 'po_items'),
      where('po_id', '==', poDoc.id)
    );
    const itemsSnap = await getDocs(itemsQuery);
    const items: POItem[] = await Promise.all(
      itemsSnap.docs.map(async (itemDoc) => {
        const itemData = itemDoc.data();
        const productDoc = await getDoc(doc(db, 'products', itemData.product_id));
        const brandDoc = await getDoc(doc(db, 'brands', itemData.brand_id));
        return {
          id: itemDoc.id,
          po_id: itemData.po_id,
          product: { id: productDoc.id, ...productDoc.data() },
          brand: { id: brandDoc.id, ...brandDoc.data() },
          quantity: itemData.quantity,
          unit_price: itemData.unit_price,
        } as POItem;
      })
    );

    orders.push({
      id: poDoc.id,
      distributor,
      status: poData.status,
      created_at: poData.created_at?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
      items,
    });
  }

  return orders;
}

export async function getPOById(poId: string): Promise<PurchaseOrder> {
  const poDoc = await getDoc(doc(db, 'purchase_orders', poId));
  if (!poDoc.exists()) throw new Error('Order not found');

  const poData = poDoc.data();
  const distDoc = await getDoc(doc(db, 'distributors', poData.distributor_id));
  const distributor = { id: distDoc.id, ...distDoc.data() } as Distributor;

  const itemsQuery = query(
    collection(db, 'po_items'),
    where('po_id', '==', poId)
  );
  const itemsSnap = await getDocs(itemsQuery);
  const items: POItem[] = await Promise.all(
    itemsSnap.docs.map(async (itemDoc) => {
      const itemData = itemDoc.data();
      const productDoc = await getDoc(doc(db, 'products', itemData.product_id));
      const brandDoc = await getDoc(doc(db, 'brands', itemData.brand_id));
      return {
        id: itemDoc.id,
        po_id: itemData.po_id,
        product: { id: productDoc.id, ...productDoc.data() },
        brand: { id: brandDoc.id, ...brandDoc.data() },
        quantity: itemData.quantity,
        unit_price: itemData.unit_price,
      } as POItem;
    })
  );

  return {
    id: poDoc.id,
    distributor,
    status: poData.status,
    created_at: poData.created_at?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
    items,
  };
}
