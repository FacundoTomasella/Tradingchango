import { CartItem } from '../types';

/**
 * Sanitiza precios para evitar NaN.
 */
const sanitizePrice = (price: any): number => {
  if (price === null || price === undefined) return 0;
  let num: number;
  if (typeof price === 'number') {
    num = price;
  } else if (typeof price === 'string') {
    const cleanedString = price.replace(/[^0-9.,-]/g, '').replace(',', '.');
    num = parseFloat(cleanedString);
  } else {
    return 0;
  }
  return Number.isFinite(num) ? num : 0;
};

/**
 * Extrae cuántas unidades se necesitan para activar la promo.
 * Ej: "3x2" -> 3 | "2do al 70%" -> 2 | "4x3" -> 4
 */
const getOfferThreshold = (offerString: string): number => {
  if (!offerString) return Infinity;
  const lower = offerString.toLowerCase().trim();

  // Caso: "3x2", "4x3", "2x1"
  const xForY = lower.match(/^(\d+)x(\d+)$/);
  if (xForY) return parseInt(xForY[1], 10);

  // Caso: "2da al 50%", "2do al 70%", "3ra al 50%"
  const nthUnit = lower.match(/^(\d+)(?:do|da|ra|ro) al/);
  if (nthUnit) return parseInt(nthUnit[1], 10);

  return Infinity;
};

/**
 * Lógica principal de cálculo
 */
export const calculateStoreTotal = (cartItems: CartItem[], storeKey: string): { subtotal: number; total: number; discount: number } => {
  let globalSubtotal = 0;
  let globalTotal = 0;

  if (!cartItems || cartItems.length === 0) {
    return { subtotal: 0, total: 0, discount: 0 };
  }

  cartItems.forEach((item) => {
    const pRegular = sanitizePrice(item[`pr_${storeKey}` as keyof CartItem]);
    const pPromo = sanitizePrice(item[`p_${storeKey}` as keyof CartItem]);
    const quantity = Math.max(0, Number(item.quantity) || 0);

    // Si no hay precio regular, ignoramos el item
    if (pRegular <= 0 || quantity <= 0) return;

    // 1. SUBTOTAL: Siempre Precio Regular x Cantidad
    const itemSubtotal = pRegular * quantity;
    globalSubtotal += itemSubtotal;

    // 2. TOTAL ESTIMADO: Aplicando lógica de grupos
    const ofertaGondola = item.oferta_gondola?.[storeKey as keyof typeof item.oferta_gondola] || "";
    const threshold = getOfferThreshold(String(ofertaGondola));

    let itemTotalEstimado = 0;

    // Si hay promo y el usuario cargó suficientes unidades para al menos un grupo
    if (threshold !== Infinity && quantity >= threshold && pPromo > 0) {
      const numGroups = Math.floor(quantity / threshold); // Grupos que entran en la promo
      const remainingUnits = quantity % threshold;      // Unidades sueltas que sobran

      // Unidades en promo se cobran a pPromo (que ya tiene la rebaja incorporada)
      // Unidades sueltas se cobran a pRegular
      itemTotalEstimado = (numGroups * threshold * pPromo) + (remainingUnits * pRegular);
    } else {
      // Si no llega al mínimo de la promo o no hay promo, todo a precio regular
      itemTotalEstimado = pRegular * quantity;
    }

    globalTotal += itemTotalEstimado;
  });

  const finalSubtotal = Number(globalSubtotal.toFixed(2));
  const finalTotal = Number(globalTotal.toFixed(2));

  return {
    subtotal: finalSubtotal,
    total: finalTotal,
    discount: Number(Math.max(0, finalSubtotal - finalTotal).toFixed(2)),
  };
};