import { CartItem } from '../types';

const getThreshold = (oferta: string): number => {
  if (!oferta) return 1;
  if (oferta.startsWith('2x')) return 2;
  if (oferta.startsWith('3x')) return 3;
  if (oferta.startsWith('4x')) return 4;
  if (oferta.startsWith('6x')) return 6;
  if (oferta.includes('2do al')) return 2;
  return 1;
};

export const calculateStoreTotal = (cartItems: CartItem[], storeKey: string): number => {
  return cartItems.reduce((total, item) => {
    const price = item[`p_${storeKey}` as keyof CartItem] as number;
    const regularPrice = item[`pr_${storeKey}` as keyof CartItem] as number;
    const oferta = item.oferta_gondola[storeKey as keyof typeof item.oferta_gondola];
    
    if (price === null || price === undefined) {
      return total;
    }

    const threshold = getThreshold(oferta);
    const quantity = item.quantity;

    if (threshold > 1) {
      const unitsInPromo = Math.floor(quantity / threshold);
      const promoSubtotal = unitsInPromo * price * (threshold -1);
      const remainingUnits = quantity % threshold;
      const remainingSubtotal = remainingUnits * regularPrice;
      return total + promoSubtotal + remainingSubtotal;
    } else {
      return total + quantity * regularPrice;
    }
  }, 0);
};