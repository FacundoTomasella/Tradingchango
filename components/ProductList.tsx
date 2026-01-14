import React from 'react';
import { Product } from '../types';

interface ProductWithStats extends Product {
  stats: {
    min: number;
    spread: string;
    trendClass: string;
    icon: string;
    isUp: boolean;
    isDown: boolean;
  };
}

interface ProductListProps {
  products: ProductWithStats[];
  onProductClick: (id: number) => void;
  onFavoriteToggle: (id: number) => void;
  isFavorite: (id: number) => boolean;
  isCartView?: boolean;
  quantities?: Record<number, number>;
  onUpdateQuantity?: (id: number, delta: number) => void;
  searchTerm?: string;
}

const ProductList: React.FC<ProductListProps> = ({ 
  products, 
  onProductClick, 
  onFavoriteToggle, 
  isFavorite,
  isCartView,
  quantities,
  onUpdateQuantity,
  searchTerm
}) => {
  const format = (n: number) => new Intl.NumberFormat('es-AR').format(n);

  const getPromoBadges = (oferta: any) => {
    if (!oferta) return null;
    let ofertas: string[] = [];
    try {
      const obj = typeof oferta === 'string' ? JSON.parse(oferta) : oferta;
      Object.values(obj).forEach((v: any) => {
        const label = v.etiqueta || (typeof v === 'string' ? v : null);
        if (label && !ofertas.includes(label)) ofertas.push(label);
      });
    } catch (e) {
      if (typeof oferta === 'string') ofertas = [oferta];
    }
    return ofertas.length > 0 ? ofertas : null;
  };

  if (products.length === 0 && searchTerm) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-900 rounded-2xl flex items-center justify-center text-neutral-400 mb-5 text-2xl">
          <i className="fa-solid fa-magnifying-glass"></i>
        </div>
        <h3 className="text-base font-black text-black dark:text-white mb-2 uppercase tracking-tighter">Sin resultados</h3>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed">Probá con otros términos.</p>
      </div>
    );
  }

  if (products.length === 0 && isCartView) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-8 text-center animate-in fade-in zoom-in duration-700">
        <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-900 rounded-[2rem] flex items-center justify-center text-neutral-400 mb-6 text-3xl">
          <i className="fa-solid fa-cart-shopping"></i>
        </div>
        <h3 className="text-lg font-black text-black dark:text-white mb-3 uppercase tracking-tighter">Tu chango está vacío</h3>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed max-w-[240px]">
          Agregá productos para comparar y ahorrar.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-neutral-100 dark:divide-neutral-900 border-b border-neutral-100 dark:border-neutral-900">
      {products.map((p) => {
        const fav = isFavorite(p.id);
        const qty = quantities ? (quantities[p.id] || 1) : 1;
        const badges = getPromoBadges(p.oferta_gondola);

        return (
          <div 
            key={p.id} 
            onClick={() => onProductClick(p.id)}
            className="flex items-center justify-between px-4 py-3 bg-white dark:bg-black hover:bg-neutral-50 dark:hover:bg-neutral-900/50 cursor-pointer transition-colors"
          >
            <div className="flex-1 flex items-center justify-between pr-3">
              <div className="flex flex-col gap-0">
                <div className="flex items-center flex-wrap gap-1.5">
                  <span className="font-[800] text-black dark:text-white text-[15px] tracking-tight uppercase font-mono leading-none">
                    {p.ticker || p.nombre.substring(0, 5).toUpperCase()}
                  </span>
                  {badges && badges.map((b, idx) => (
                    <span key={idx} className="bg-green-500 text-white text-[8px] font-[900] px-1 py-0.5 rounded-[2px] uppercase leading-none font-sans">
                      {b}
                    </span>
                  ))}
                </div>
                <span className="text-[12px] font-medium text-neutral-700 dark:text-neutral-400 line-clamp-1 font-sans mt-0.5">
                  {p.nombre}
                </span>
              </div>

              <div className="text-right flex flex-col items-end min-w-[90px]">
                <span className="font-mono font-[800] text-black dark:text-white text-[16px] leading-none">
                  ${format(p.stats.min)}
                </span>
                <span className={`font-mono text-[11px] font-[700] mt-1 ${p.stats.trendClass} leading-none`}>
                  {p.stats.icon} {p.stats.spread}%
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isCartView && onUpdateQuantity && (
                <div 
                  className="flex items-center bg-neutral-100 dark:bg-neutral-900 px-1 rounded-lg border border-neutral-200 dark:border-neutral-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button onClick={() => onUpdateQuantity(p.id, -1)} className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white px-1.5 py-1 font-black text-xs">-</button>
                  <span className="font-mono text-[12px] font-black min-w-[16px] text-center text-black dark:text-white">{qty}</span>
                  <button onClick={() => onUpdateQuantity(p.id, 1)} className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white px-1.5 py-1 font-black text-xs">+</button>
                </div>
              )}
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onFavoriteToggle(p.id);
                }}
                className={`transition-all flex items-center justify-center active:scale-90 p-1.5 ${fav ? 'text-star-gold' : 'text-neutral-300 dark:text-neutral-700'}`}
              >
                <i className="fa-solid fa-cart-shopping text-[18px]"></i>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductList;