import React, { useState } from 'react';
import { GameId, GameInfo, GameMode } from '../types';
import { GAMES_LIST } from '../data/gamesList';
import { MythologicalRoomCarousel } from './MythologicalRoomCarousel';
import {
  Crown,
  Trophy,
  Flame,
  Play,
  Bot,
  Users,
  Star,
  Layers,
  LayoutGrid,
  Coins,
} from 'lucide-react';

interface WebPortalProps {
  onSelectGame: (gameId: GameId, mode?: GameMode) => void;
  onOpenWheel: () => void;
  onOpenLeagues: () => void;
}

export const WebPortal: React.FC<WebPortalProps> = ({
  onSelectGame,
  onOpenWheel,
  onOpenLeagues,
}) => {
  const [viewStyle, setViewStyle] = useState<'rooms' | 'grid'>('rooms');
  const [selectedCategory, setSelectedCategory] = useState<string>('همه');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'همه',
    'استراتژیک',
    'فکری و تخته‌ای',
    'معمایی و منطق',
    'کلمات و اطلاعات',
    'سرگرمی و شانس',
  ];

  const filteredGames = GAMES_LIST.filter((game) => {
    const matchesCategory = selectedCategory === 'همه' || game.category === selectedCategory;
    const matchesSearch =
      game.title.includes(searchQuery) ||
      game.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.includes(searchQuery) ||
      game.heroName.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-8 text-slate-100 font-['Vazirmatn']">
      {/* Persian Mythological Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#170a04] via-slate-900 to-[#0a1826] border-2 border-amber-500/40 p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-2xl flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold w-fit">
              <Crown className="w-3.5 h-3.5" />
              <span>کاخ بازی‌های اساطیری ایران و شاهنامه فردوسی</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black leading-tight text-white">
              میدان نبرد <span className="text-amber-400">پهلوانان شاهنامه</span>
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              شطرنج اساطیری رستم، اتللو تاکتیکی زال و سیمرغ، دوز و گوموکو کاوه آهنگر، منچ هفت‌خان سهراب، سودوکوی کوروش و کوییز حکمت فردوسی با جوایز سکه طلا.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="hero-play-chess-btn"
                onClick={() => onSelectGame('chess', 'ai')}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>شروع نبرد شطرنج رستم</span>
              </button>

              <button
                id="hero-wheel-btn"
                onClick={onOpenWheel}
                className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-amber-500/30 text-amber-300 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>گردونه شانس اساطیری 🎡</span>
              </button>

              <button
                id="hero-leagues-btn"
                onClick={onOpenLeagues}
                className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Trophy className="w-4 h-4" />
                <span>جدول لیگ پهلوانان</span>
              </button>
            </div>
          </div>

          {/* Featured Right Hero Card */}
          <div className="w-full lg:w-80 bg-slate-950/85 border border-amber-500/40 p-4.5 rounded-2xl flex flex-col gap-3 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between text-xs font-bold border-b border-amber-500/20 pb-2">
              <span className="text-amber-400 flex items-center gap-1.5 font-black">
                <Flame className="w-4 h-4 text-rose-500" />
                <span>اتاق برگزیده شاهنامه</span>
              </span>
              <span className="text-[10px] text-amber-300 font-mono">🏆 لیگ فعال</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-4xl p-2 rounded-xl bg-amber-500/20 border border-amber-500/30">
                🦁
              </div>
              <div>
                <div className="text-sm font-black text-amber-300">رستم دستان</div>
                <div className="text-xs text-slate-300">شطرنج بین‌المللی با سیمرغ دانا</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 pt-1 text-center">
              <button
                onClick={() => onSelectGame('chess', 'ai')}
                className="py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500/20 border border-cyan-500/40 text-[10px] font-bold text-cyan-300 cursor-pointer"
              >
                🤖 ربات
              </button>
              <button
                onClick={() => onSelectGame('chess', 'pvp')}
                className="py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-bold text-emerald-300 cursor-pointer"
              >
                👥 آنلاین
              </button>
              <button
                onClick={() => onSelectGame('chess', 'league')}
                className="py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-[10px] font-bold text-amber-300 cursor-pointer"
              >
                🏆 لیگ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View Switcher Toolbar (Room Flip vs Grid View) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 border border-amber-500/20 p-3 rounded-2xl shadow-lg">
        {/* Toggle Mode */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300">نمایش بازی‌ها:</span>
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              id="view-style-rooms-btn"
              onClick={() => setViewStyle('rooms')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewStyle === 'rooms'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>اتاق‌های سه‌بعدی اساطیری (ورق‌زن)</span>
            </button>

            <button
              id="view-style-grid-btn"
              onClick={() => setViewStyle('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewStyle === 'grid'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>شبکه‌ای</span>
            </button>
          </div>
        </div>

        {/* Category Filters (when in grid) & Search */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی پهلوان یا بازی..."
            className="w-full sm:w-60 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400 placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Primary Display View */}
      {viewStyle === 'rooms' ? (
        /* The 3D Room-by-Room Flip Carousel */
        <div className="w-full max-w-xl mx-auto">
          <MythologicalRoomCarousel
            onStartGame={(gameId, mode) => onSelectGame(gameId, mode)}
          />
        </div>
      ) : (
        /* Grid Display */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              id={`game-card-${game.id}`}
              className="group rounded-3xl bg-slate-900 border-2 border-amber-500/40 p-4.5 flex flex-col justify-between gap-3 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 transition-all relative overflow-hidden"
            >
              {game.heroImage && (
                <div className="absolute inset-0 z-0">
                  <img
                    src={game.heroImage}
                    alt={game.title}
                    className="w-full h-full object-cover brightness-[0.4] group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
                </div>
              )}

              <div className="relative z-10">
                {/* Top Row: Hero Avatar & Badge */}
                <div className="flex items-center justify-between mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-950/80 border border-amber-500/40 flex items-center justify-center text-3xl shadow-inner">
                    {game.heroAvatar}
                  </div>
                  {game.badge && (
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 shadow-sm">
                      {game.badge}
                    </span>
                  )}
                </div>

                <div className="text-[10px] font-bold text-amber-400">{game.heroRole}</div>
                <h3 className="text-base font-black text-white">{game.heroName}</h3>
                <h4 className="text-xs font-bold text-amber-300 mb-1">{game.title}</h4>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {game.description}
                </p>
              </div>

              {/* Action Buttons for 3 Modes */}
              <div className="relative z-10 flex flex-col gap-1.5 pt-2 border-t border-amber-500/20">
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => onSelectGame(game.id, 'ai')}
                    className="py-1.5 rounded-xl bg-slate-900/90 hover:bg-cyan-500/20 border border-cyan-500/40 text-[10px] font-bold text-cyan-300 text-center active:scale-95 transition-all cursor-pointer"
                  >
                    🤖 ربات
                  </button>
                  <button
                    onClick={() => onSelectGame(game.id, 'pvp')}
                    className="py-1.5 rounded-xl bg-slate-900/90 hover:bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-bold text-emerald-300 text-center active:scale-95 transition-all cursor-pointer"
                  >
                    👥 آنلاین
                  </button>
                  <button
                    onClick={() => onSelectGame(game.id, 'league')}
                    className="py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-[10px] hover:bg-amber-400 text-center shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    🏆 لیگ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
