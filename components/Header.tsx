
import React, { useState, useRef, useEffect } from 'react';
import { TabType } from '../types';

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  toggleTheme: () => void;
  theme: 'light' | 'dark';
  onUserClick: () => void;
  user: any;
  subscription?: string;
  trendFilter: 'up' | 'down' | null;
  setTrendFilter: (val: 'up' | 'down' | null) => void;
  showHero: boolean;
  onNavigate: (tab: TabType) => void;
  currentTab: TabType;
}

const Header: React.FC<HeaderProps> = ({ 
  searchTerm, 
  setSearchTerm, 
  toggleTheme, 
  theme, 
  onUserClick, 
  user,
  subscription = 'free',
  trendFilter,
  setTrendFilter,
  showHero,
  onNavigate,
  currentTab
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#ffffff] dark:bg-[#000000] p-4 border-b border-border-light dark:border-border-dark">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-[8px] cursor-pointer group" onClick={() => onNavigate('home')}>
          <div className="relative flex items-center justify-center h-[24px] w-[30px]">
             {/* Logo SVG que replica la imagen: Carrito negro + Flecha verde de tendencia */}
             <svg viewBox="0 0 100 100" className="w-full h-full text-[#131722] dark:text-[#ffffff] fill-current">
                <path d="M15,25 L35,25 L40,65 L85,65 L90,35 L40,35" strokeWidth="7" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="48" cy="85" r="10"/>
                <circle cx="78" cy="85" r="10"/>
                <path d="M55,50 L68,35 L78,45 L95,20 M95,20 L95,35 M95,20 L80,20" stroke="#00a650" strokeWidth="9" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
          </div>
          <span className="font-[800] text-[22px] tracking-[-1px] text-primary dark:text-[#ffffff] leading-none font-sans">TradingChango</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-4 mr-2">
            <button onClick={() => onNavigate('about')} className="text-[10px] font-bold uppercase tracking-widest text-muted hover:text-primary dark:hover:text-[#ffffff] transition-colors">Acerca de</button>
            <button onClick={() => onNavigate('terms')} className="text-[10px] font-bold uppercase tracking-widest text-muted hover:text-primary dark:hover:text-[#ffffff] transition-colors">Términos</button>
            <button onClick={() => onNavigate('contact')} className="text-[10px] font-bold uppercase tracking-widest text-muted hover:text-primary dark:hover:text-[#ffffff] transition-colors">Contacto</button>
          </div>

          <div className="relative md:hidden" ref={menuRef}>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="w-8 h-8 flex items-center justify-center text-primary dark:text-[#ffffff]">
              <i className="fa-solid fa-circle-info text-xl"></i>
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-[#ffffff] dark:bg-[#121212] border border-border-light dark:border-border-dark rounded-xl shadow-xl p-1 z-50 animate-in fade-in zoom-in duration-200">
                <button onClick={() => { onNavigate('about'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase dark:text-[#ffffff] hover:bg-bg-card-light dark:hover:bg-bg-card-dark rounded-lg">Acerca de</button>
                <button onClick={() => { onNavigate('terms'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase dark:text-[#ffffff] hover:bg-bg-card-light dark:hover:bg-bg-card-dark rounded-lg">Términos</button>
                <button onClick={() => { onNavigate('contact'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase dark:text-[#ffffff] hover:bg-bg-card-light dark:hover:bg-bg-card-dark rounded-lg">Contacto</button>
              </div>
            )}
          </div>

          <button onClick={onUserClick} className="w-8 h-8 flex items-center justify-center text-primary dark:text-[#ffffff]">
            <i className="fa-solid fa-circle-user text-xl"></i>
          </button>
          <button onClick={toggleTheme} className="text-primary dark:text-[#ffffff] hover:opacity-70 transition-opacity">
            <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'} text-xl`}></i>
          </button>
        </div>
      </div>

      <div className="relative mb-3">
        <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-muted"></i>
        <input 
          type="text" 
          placeholder="BUSCAR PRODUCTO..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#f9f9f9] dark:bg-[#121212] border border-border-light dark:border-border-dark rounded-lg py-3.5 pl-12 pr-4 text-sm font-medium focus:outline-none transition-all text-primary dark:text-[#ffffff] placeholder:text-muted"
        />
      </div>

      {!['favs', 'about', 'terms', 'contact'].includes(currentTab) && (
        <div className="flex gap-2">
          <button 
            onClick={() => setTrendFilter(trendFilter === 'down' ? null : 'down')} 
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-[11px] font-[800] uppercase border transition-all ${trendFilter === 'down' ? 'bg-chart-green text-white border-chart-green' : 'bg-[#ffffff] dark:bg-[#000000] text-chart-green border-border-light dark:border-border-dark'}`}
          >
            <i className="fa-solid fa-arrow-trend-down"></i> Precios Bajando
          </button>
          <button 
            onClick={() => setTrendFilter(trendFilter === 'up' ? null : 'up')} 
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-[11px] font-[800] uppercase border transition-all ${trendFilter === 'up' ? 'bg-chart-red text-white border-chart-red' : 'bg-[#ffffff] dark:bg-[#000000] text-chart-red border-border-light dark:border-border-dark'}`}
          >
            <i className="fa-solid fa-arrow-trend-up"></i> Precios Subiendo
          </button>
        </div>
      )}

      {showHero && (
        <div className="mt-8 text-center px-4 animate-in fade-in duration-500">
          <h2 className="text-[22px] font-[800] text-primary dark:text-[#ffffff] leading-none tracking-tight font-sans">Los precios del super como nunca los viste</h2>
          <p className="mt-3 text-sm text-muted font-medium tracking-tight">Analizá los precios, tendencias, y compará antes de comprar</p>
        </div>
      )}
    </header>
  );
};

export default Header;
