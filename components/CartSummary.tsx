
import React, { useMemo } from 'react';
import { Product, Benefit, UserMembership } from '../types';

interface CartSummaryProps {
  items: any[];
  favorites: Record<number, number>;
  benefits: Benefit[];
  userMemberships?: UserMembership[];
}

const CartSummary: React.FC<CartSummaryProps> = ({ items, favorites, benefits, userMemberships = [] }) => {
  const format = (n: number) => new Intl.NumberFormat('es-AR').format(n);

  const STORES = [
    { name: "COTO", key: "p_coto", index: 0 },
    { name: "CARREFOUR", key: "p_carrefour", index: 1 },
    { name: "DIA", key: "p_dia", index: 2 },
    { name: "JUMBO", key: "p_jumbo", index: 3 },
    { name: "MASONLINE", key: "p_masonline", index: 4 }
  ];

  const results = useMemo(() => {
    return STORES.map((store) => {
      let subtotal = 0;
      let totalGondolaDiscount = 0;

      items.forEach(item => {
        const price = item.prices[store.index];
        const qty = favorites[item.id] || 1;
        if (price <= 0) {
          subtotal += 999999;
          return;
        }

        const itemSubtotal = price * qty;
        subtotal += itemSubtotal;

        // Cálculo de descuentos de góndola (2x1, 70% 2da, etc)
        const ofRaw = item.oferta_gondola;
        if (ofRaw) {
          try {
            const ofObj = typeof ofRaw === 'string' ? JSON.parse(ofRaw) : ofRaw;
            const storeKey = store.name.toLowerCase().replace(' ', '');
            const promo = ofObj[storeKey] || ofObj[store.name.toLowerCase()];
            
            if (promo && promo.etiqueta) {
              const label = promo.etiqueta.toUpperCase();
              if (label.includes('2X1')) {
                const freeUnits = Math.floor(qty / 2);
                totalGondolaDiscount += freeUnits * price;
              } else if (label.includes('70%') && label.includes('2DA')) {
                const discountedUnits = Math.floor(qty / 2);
                totalGondolaDiscount += discountedUnits * (price * 0.7);
              } else if (label.includes('80%') && label.includes('2DA')) {
                const discountedUnits = Math.floor(qty / 2);
                totalGondolaDiscount += discountedUnits * (price * 0.8);
              } else if (label.includes('50%') && label.includes('2DA')) {
                const discountedUnits = Math.floor(qty / 2);
                totalGondolaDiscount += discountedUnits * (price * 0.5);
              }
            }
          } catch (e) { /* ignore parse errors */ }
        }
      });

      const storeBenefits = benefits.filter(b => b.supermercado.toUpperCase() === store.name.toUpperCase());
      return { 
        name: store.name, 
        subtotal, 
        gondolaDiscount: totalGondolaDiscount,
        totalChango: subtotal - totalGondolaDiscount,
        storeBenefits 
      };
    }).sort((a, b) => a.totalChango - b.totalChango);
  }, [items, favorites, benefits]);

  const best = results[0];
  const others = results.slice(1).filter(r => r.subtotal < 500000);

  // Lógica de Pago
  const paymentAdvice = useMemo(() => {
    if (!best.storeBenefits.length) return null;
    
    const checkOwned = (entidad: string) => userMemberships.some(um => 
      um.slug.toLowerCase() === entidad.toLowerCase() || 
      um.tipo.toLowerCase() === entidad.toLowerCase()
    );

    const owned = best.storeBenefits
      .filter(b => checkOwned(b.entidad_nombre))
      .sort((a,b) => b.descuento - a.descuento)[0];

    const recommend = best.storeBenefits
      .filter(b => !checkOwned(b.entidad_nombre) && b.link_referido)
      .sort((a,b) => b.descuento - a.descuento)[0];

    return { owned, recommend };
  }, [best, userMemberships]);

  if (items.length === 0) return null;

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-700">
      {/* Tarjeta Principal: La mejor opción */}
      <div className="bg-white dark:bg-slate-950 border-2 border-green-500 rounded-[2.5rem] p-8 shadow-2xl shadow-green-500/10 relative overflow-hidden">
        <div className="relative z-10">
          <div className="mb-6">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Tu mejor opción hoy es</h2>
            <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{best.name}</div>
          </div>

          <div className="space-y-3 mb-8">
            <div className="flex justify-between items-center text-sm font-bold text-slate-500">
              <span>Subtotal</span>
              <span className="font-mono">${format(Math.round(best.subtotal))}</span>
            </div>
            
            {best.gondolaDiscount > 0 && (
              <div className="flex justify-between items-center text-sm font-bold text-green-500">
                <span>Descuentos de góndola</span>
                <span className="font-mono">-${format(Math.round(best.gondolaDiscount))}</span>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-end">
              <span className="font-black text-xs uppercase tracking-widest text-slate-400 pb-1">Total Chango*</span>
              <span className="text-4xl font-mono font-black text-slate-900 dark:text-white leading-none">
                ${format(Math.round(best.totalChango))}
              </span>
            </div>
          </div>

          {/* Estrategia de Pago */}
          <div className="space-y-4">
            {paymentAdvice?.recommend && (
              <div className="p-5 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-3xl flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 rounded-2xl flex items-center justify-center text-amber-600 flex-shrink-0 text-xl">
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-bold dark:text-white leading-snug">
                    Sumale un <b className="text-amber-600">{(paymentAdvice.recommend.descuento * 100).toFixed(0)}% de ahorro extra</b> con <b className="uppercase">{paymentAdvice.recommend.entidad_nombre}</b>.
                  </p>
                  <a href={paymentAdvice.recommend.link_referido} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[10px] font-black text-amber-600 uppercase underline underline-offset-4">Pedir Tarjeta</a>
                </div>
              </div>
            )}

            {paymentAdvice?.owned && (
              <div className="p-5 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-3xl flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center text-blue-600 flex-shrink-0 text-xl">
                  <i className="fa-solid fa-id-card"></i>
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-bold dark:text-white leading-snug">
                    Además, por tener <b className="text-blue-600 uppercase">{paymentAdvice.owned.entidad_nombre}</b>, tenés un <b className="text-blue-600">{(paymentAdvice.owned.descuento * 100).toFixed(0)}% de descuento</b> hoy.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comparación con otros mercados */}
      <div className="px-2 pt-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Comparar con otros mercados</h3>
        <div className="grid grid-cols-1 gap-2">
          {others.map((store) => (
            <div key={store.name} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl flex justify-between items-center border border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">{store.name}</span>
              <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">${format(Math.round(store.totalChango))}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[9px] text-center text-slate-400 font-medium px-4">
        *Los precios no incluyen costos de envío ni descuentos por cuotas. 
        Los beneficios bancarios pueden tener topes de reintegro.
      </p>
    </div>
  );
};

export default CartSummary;
