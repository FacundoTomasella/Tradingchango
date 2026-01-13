
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getProductHistory } from '../services/supabase';
import { Product, PriceHistory } from '../types';

interface ProductDetailProps {
  productId: number;
  onClose: () => void;
  onFavoriteToggle: (id: number) => void;
  isFavorite: boolean;
  products: Product[];
  theme: 'light' | 'dark';
}

const ProductDetail: React.FC<ProductDetailProps> = ({ productId, onClose, onFavoriteToggle, isFavorite, products, theme }) => {
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const [days, setDays] = useState(90);
  const [loading, setLoading] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);

  const product = products.find(p => p.id === productId);

  useEffect(() => {
    if (product) {
      setLoading(true);
      getProductHistory(product.nombre, 365)
        .then(data => setHistory(data || []))
        .catch(() => setHistory([]))
        .finally(() => setLoading(false));
    }
  }, [product]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      // Si el clic es en el fondo (el contenedor con inset-0) y no en el modalRef
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [onClose]);

  const STORES = [
    { name: "COTO", key: 'p_coto', url: 'url_coto', color: "#ff3b30" },
    { name: "CARREFOUR", key: 'p_carrefour', url: 'url_carrefour', color: "#2962ff" },
    { name: "DIA", key: 'p_dia', url: 'url_dia', color: "#ff3b30" },
    { name: "JUMBO", key: 'p_jumbo', url: 'url_jumbo', color: "#00c853" },
    { name: "MAS ONLINE", key: 'p_masonline', url: 'url_masonline', color: "#00c853" }
  ] as const;

  const chartData = useMemo(() => {
    if (!history.length) return [];
    const filtered = history.filter(h => {
        const hDate = new Date(h.fecha);
        const limitDate = new Date();
        limitDate.setDate(limitDate.getDate() - days);
        return hDate >= limitDate;
    });
    return filtered.map(h => ({
      date: new Date(h.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }),
      price: h.precio_minimo,
    }));
  }, [history, days]);

  const minPrice = useMemo(() => {
    if (!product) return 0;
    const prices = [product.p_coto, product.p_carrefour, product.p_dia, product.p_jumbo, product.p_masonline].filter(p => p > 0);
    return prices.length > 0 ? Math.min(...prices) : 0;
  }, [product]);

  const avgPrice = useMemo(() => {
    if (!product) return 0;
    const prices = [product.p_coto, product.p_carrefour, product.p_dia, product.p_jumbo, product.p_masonline].filter(p => p > 0);
    return prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
  }, [product]);

  const variation = useMemo(() => {
    if (chartData.length < 2) return null;
    const start = chartData[0].price;
    const end = chartData[chartData.length - 1].price;
    return (((end - start) / start) * 100).toFixed(1);
  }, [chartData]);

  if (!product) return null;
  const format = (n: number) => new Intl.NumberFormat('es-AR').format(n);
  const isUp = variation ? parseFloat(variation) > 0 : false;
  const trendColor = isUp ? "#ff3b30" : "#00c853";

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-6 overflow-hidden transition-all duration-300">
      <div 
        ref={modalRef}
        className="w-full md:max-w-4xl h-[92vh] md:h-auto md:max-h-[90vh] bg-white dark:bg-black md:rounded-[2.5rem] flex flex-col md:flex-row overflow-hidden shadow-2xl border-t md:border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-10"
      >
        {/* Lado Izquierdo: Info + Gráfico */}
        <div className="flex-1 overflow-y-auto no-scrollbar border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-900">
          <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-900">
            <button onClick={onClose} className="text-slate-400 hover:text-black dark:hover:text-white p-2 -ml-2 transition-colors">
              <i className="fa-solid fa-arrow-left text-lg"></i>
            </button>
            <div className="flex gap-4">
              <button onClick={() => onFavoriteToggle(product.id)} className={`text-2xl transition-all active:scale-90 ${isFavorite ? 'text-star-gold' : 'text-slate-300 dark:text-slate-700 hover:text-black dark:hover:text-white'}`}>
                <i className="fa-solid fa-cart-shopping"></i>
              </button>
            </div>
          </div>

          <div className="p-8">
            <div className="flex items-start gap-6 mb-8">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-3xl p-3 shadow-lg border border-slate-100 flex-shrink-0">
                <img src={product.imagen_url || 'https://via.placeholder.com/200?text=No+Img'} alt={product.nombre} className="w-full h-full object-contain" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight mb-2 tracking-tighter">{product.nombre}</h1>
                <div className="text-4xl font-mono font-black text-slate-900 dark:text-white tracking-tighter mb-4">${format(minPrice)}</div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 rounded-full text-[10px] font-black uppercase text-slate-500 tracking-widest">
                  Promedio: <span className="text-slate-900 dark:text-white">${format(avgPrice)}</span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-end mb-4">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Historial de precios</h3>
                <div className="flex gap-1">
                  {[30, 90, 365].map(d => (
                    <button key={d} onClick={() => setDays(d)} className={`px-3 py-1 text-[9px] font-black rounded-lg transition-all ${days === d ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'}`}>{d === 30 ? '1M' : d === 90 ? '3M' : '1Y'}</button>
                  ))}
                </div>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={trendColor} stopOpacity={0.1}/><stop offset="95%" stopColor={trendColor} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={theme === 'dark' ? '#111' : '#eee'} />
                    <XAxis dataKey="date" hide />
                    <YAxis orientation="right" hide domain={['auto', 'auto']} />
                    <Tooltip 
                      contentStyle={{backgroundColor: theme === 'dark' ? '#000' : '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                      labelStyle={{fontSize: '9px', fontWeight: 'bold', color: '#999'}}
                    />
                    <Area type="monotone" dataKey="price" stroke={trendColor} strokeWidth={3} fill="url(#colorPrice)" animationDuration={1000} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Comparativa de Mercados (Side-by-side en escritorio) */}
        <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-950/50 p-8 flex flex-col justify-center">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6">Comparar mercados</h3>
          <div className="space-y-4">
            {STORES.map((s) => {
              const price = (product as any)[s.key];
              const productUrl = (product as any)[s.url];
              if (!price || price <= 0) return null;
              const isBest = price === minPrice;
              
              return (
                <div key={s.name} className="flex flex-col gap-1 pb-4 border-b border-slate-100 dark:border-slate-900 last:border-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-black text-slate-400 uppercase tracking-tight">{s.name}</span>
                    <span className={`text-lg font-mono font-black ${isBest ? 'text-green-500' : 'text-slate-900 dark:text-white'}`}>
                      ${format(price)}
                    </span>
                  </div>
                  {productUrl && (
                    <a href={productUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black text-slate-400 uppercase hover:text-black dark:hover:text-white underline underline-offset-2">Ver en tienda</a>
                  )}
                </div>
              );
            })}
          </div>
          
          <button onClick={onClose} className="hidden md:block mt-12 w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-[1.02] transition-all">
            Cerrar Detalle
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
