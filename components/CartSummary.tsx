
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

  const STORES = ["COTO", "CARREFOUR", "DIA", "JUMBO", "MASONLINE"];
  
  const results = useMemo(() => {
    return STORES.map((name, i) => {
      let subtotal = 0;
      items.forEach(item => {
        const price = item.prices[i];
        const qty = favorites[item.id] || 1;
        subtotal += price > 0 ? price * qty : 999999;
      });
      const storeBenefits = benefits.filter(b => b.supermercado.toUpperCase() === name.toUpperCase());
      return { name, subtotal, storeBenefits };
    }).sort((a, b) => a.subtotal - b.subtotal);
  }, [items, favorites, benefits]);

  const best = results[0];
  const worst = results.filter(r => r.subtotal < 99999).slice(-1)[0];
  const potentialSavings = worst ? worst.subtotal - best.subtotal : 0;

  const paymentAdvice = useMemo(() => {
    if (!best.storeBenefits.length) return null;
    
    // 1. Lo que el usuario YA TIENE vinculado para este super hoy
    const userHas = best.storeBenefits.filter(b => 
      userMemberships.some(um => um.slug.toLowerCase() === b.entidad_nombre.toLowerCase() || um.tipo.toLowerCase() === b.entidad_nombre.toLowerCase())
    ).sort((a,b) => b.descuento - a.descuento);

    // 2. Lo que el usuario NO TIENE y tiene link de referido (Upsell)
    const upsell = best.storeBenefits.filter(b => 
      !userMemberships.some(um => um.slug.toLowerCase() === b.entidad_nombre.toLowerCase() || um.tipo.toLowerCase() === b.entidad_nombre.toLowerCase()) &&
      b.link_referido
    ).sort((a,b) => b.descuento - a.descuento);

    return { owned: userHas[0], recommend: upsell[0] };
  }, [best, userMemberships]);

  if (items.length === 0) return null;

  return (
    <div className="p-4 animate-in fade-in duration-700">
      <div className="bg-white dark:bg-slate-950 border-2 border-green-500 rounded-3xl p-6 shadow-xl shadow-green-500/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03]"><i className="fa-solid fa-cart-shopping text-9xl text-green-500"></i></div>
        
        <div className="relative z-10">
          <div className="text-center mb-6">
            <span className="text-[10px] font-black uppercase text-green-500 tracking-widest">Ahorrás en total</span>
            <div className="text-5xl font-mono font-black text-green-500 leading-none mt-1">
              ${format(Math.round(potentialSavings))}
            </div>
            <p className="mt-2 text-sm text-slate-500 font-medium">Mejor opción: <b className="text-slate-900 dark:text-white uppercase">{best.name}</b></p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <span className="font-black text-xs uppercase tracking-wider text-slate-400">Total Chango</span>
            <span className="text-2xl font-mono font-black text-slate-900 dark:text-white">${format(Math.round(best.subtotal))}</span>
          </div>

          {/* ESTRATEGIA DE PAGO */}
          <div className="mt-6 space-y-3">
            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Estrategia de Pago Sugerida</h4>
            
            {paymentAdvice?.recommend && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl flex items-center gap-4 animate-in slide-in-from-right-2">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center text-amber-600 flex-shrink-0"><i className="fa-solid fa-gift"></i></div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold dark:text-white leading-tight">
                    ¿No tenés <b className="text-amber-600 uppercase">{paymentAdvice.recommend.entidad_nombre}</b>? 
                    Hoy ofrece un {(paymentAdvice.recommend.descuento * 100).toFixed(0)}% de ahorro extra en {best.name}.
                  </p>
                  <a href={paymentAdvice.recommend.link_referido} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[9px] font-black text-amber-600 uppercase underline decoration-2 underline-offset-4">Pedir Beneficio Aquí</a>
                </div>
              </div>
            )}

            {paymentAdvice?.owned && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0"><i className="fa-solid fa-credit-card"></i></div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold dark:text-white leading-tight">
                    ¡Aprovechá! Usá tu <b className="text-blue-600 uppercase">{paymentAdvice.owned.entidad_nombre}</b> vinculada para descontar un {(paymentAdvice.owned.descuento * 100).toFixed(0)}% hoy.
                  </p>
                </div>
              </div>
            )}

            {!paymentAdvice?.recommend && !paymentAdvice?.owned && (
              <p className="text-[10px] text-center text-slate-400 font-medium py-2">No hay promociones bancarias específicas para este súper hoy.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
