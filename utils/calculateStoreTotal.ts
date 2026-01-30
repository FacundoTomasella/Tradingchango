import { CartItem } from '../types';

const getThreshold = (oferta: string): number => {
  if (!oferta) return 1;
  const lowerOferta = oferta.toLowerCase();
  
  // Extrae el número de "3x2", "4x3", "2x1", etc.
  const multiBuyMatch = lowerOferta.match(/^(\d+)x/);
  if (multiBuyMatch) return parseInt(multiBuyMatch[1], 10);

  // Para "2do al 80%", el threshold es 2
  if (lowerOferta.includes('2do al')) return 2;
  
  return 1;
};

export const calculateStoreTotal = (cartItems: CartItem[], storeKey: string): number => {
  return cartItems.reduce((total, item) => {
    const pPromo = item[`p_${storeKey}` as keyof CartItem] as number; // Precio con descuento aplicado
    const pRegular = item[`pr_${storeKey}` as keyof CartItem] as number; // Precio de lista (tachado)
    const oferta = item.oferta_gondola[storeKey as keyof typeof item.oferta_gondola] || "";
    
    if (!pPromo) return total;

    const threshold = getThreshold(oferta);
    const quantity = item.quantity;

    // CASO 1: No hay oferta (threshold 1)
    // Se cobra siempre el precio con descuento (p_) sin importar la cantidad.
    if (threshold <= 1) {
      return total + (quantity * pPromo);
    }

    // CASO 2: Hay oferta (2x1, 3x2, 2do al 80%, etc.)
    if (quantity >= threshold) {
      // Si cumple la cantidad de la promo:
      const unitsInPromo = Math.floor(quantity / threshold) * threshold;
      const remainingUnits = quantity % threshold;
      
      // Los combos van a precio p_, el resto al precio "caro" pr_
      return total + (unitsInPromo * pPromo) + (remainingUnits * pRegular);
    } else {
      // Si NO cumple la cantidad mínima de la promo (ej: lleva 1 en un 3x2)
      // Se cobra el precio regular (pr_)
      return total + (quantity * pRegular);
    }
  }, 0);
};
