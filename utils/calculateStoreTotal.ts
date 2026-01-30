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
    // p_ es el precio con descuento aplicado (el que debería figurar en góndola)
    const pPromo = item[`p_${storeKey}` as keyof CartItem] as number; 
    // pr_ es el precio base sin ninguna promoción
    const pRegular = item[`pr_${storeKey}` as keyof CartItem] as number; 
    const oferta = item.oferta_gondola[storeKey as keyof typeof item.oferta_gondola] || "";
    
    // Si no hay precio cargado, no sumamos nada
    if (pPromo === null || pPromo === undefined || pPromo === 0) return total;

    const threshold = getThreshold(oferta);
    const quantity = item.quantity;

    // --- LÓGICA DE CÁLCULO ---

    // CASO A: El producto NO tiene una oferta de "lleve X unidades" (ej: Coto)
    if (threshold <= 1) {
      // Se cobra la cantidad total al precio p_ (que ya es el más bajo)
      return total + (quantity * pPromo);
    }

    // CASO B: El producto SI tiene una oferta (2x1, 3x2, 2do al 70%, etc.)
    if (quantity >= threshold) {
      // Calculamos cuántas unidades completan los combos de la promo
      // Ejemplo: 2x1 y lleva 3 unidades -> unitsInPromo = 2
      const unitsInPromo = Math.floor(quantity / threshold) * threshold;
      
      // Calculamos el sobrante que no entra en la promo
      // Ejemplo: 2x1 y lleva 3 unidades -> remainingUnits = 1
      const remainingUnits = quantity % threshold;

      // El subtotal es: (las que entran en promo * p_) + (las que sobran * pr_)
      const subtotal = (unitsInPromo * pPromo) + (remainingUnits * pRegular);
      return total + subtotal;
    } else {
      // CASO C: Tiene promo pero no llega a la cantidad mínima (ej: lleva 1 y la promo es 2x1)
      // Se cobra el precio regular pr_
      return total + (quantity * pRegular);
    }
  }, 0);
};
