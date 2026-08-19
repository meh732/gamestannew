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
  Sparkles,
  Search,
  Swords,
  Award,
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
  const [viewStyle, setViewStyle] = useState<'grid' | 'rooms'>('grid');
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
    const matchesCategory =
      selectedCategory === 'همه' || game.category === selectedCategory;
    const matchesSearch =
      game.title.includes(searchQuery) ||
      game.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.includes(searchQuery) ||
      game.heroName.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col gap-6 text-slate-100 font-['Vazirmatn'] select-none">
      {/* 1. Royal Spotlight Hero Showcase */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#140b05] via-[#090d18] to-[#04121d] border-2 border-amber-500/40 p-5 sm:p-8 overflow-hidden shadow-2xl">
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -top-12 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-2xl flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold w-fit">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>پلتفرم تخصصی بازی‌های فکری و اساطیری ایران</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black leading-tight text-white">
              کاخ بازی‌های کهن و <span className="text-amber-400">پهلوانان شاهنامه</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              میدان هوش، استراتژی و منطق با ۱۰ تالار بازی اساطیری: شطرنج رستم، اتللو سیمرغ، سودوکو، منچ هفت‌خان، دوز کاوه، کوییز فردوسی و گردونه جوایز طلایی.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                id="hero-play-chess-btn"
                onClick={() => onSelectGame('chess', 'ai')}
                className="px-5 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>نبرد شطرنج رستم</span>
              </button>

              <button
                id="hero-wheel-btn"
                onClick={onOpenWheel}
                className="px-4 py-2.5 sm:py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/40 text-amber-300 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>گردونه شانس 🎡</span>
              </button>

              <button
                id="hero-leagues-btn"
                onClick={onOpenLeagues}
                className="px-4 py-2.5 sm:py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-cyan-300 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>لیگ پهلوانان</span>
              </button>
            </div>
          </div>

          {/* Quick Match Featured Pod */}
          <div className="w-full lg:w-80 bg-slate-950/90 border border-amber-500/40 p-4 rounded-2xl flex flex-col gap-3 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between text-xs font-bold border-b border-slate-800 pb-2">
              <span className="text-amber-400 flex items-center gap-1.5 font-black">
                <Flame className="w-4 h-4 text-rose-500" />
                <span>تالار داغ امروز</span>
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                جایزه ۲۵۰ سکه
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-3xl p-2 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-700/20 border border-amber-500/40">
                ♟️
              </div>
              <div>
                <div className="text-sm font-black text-amber-300">شطرنج اساطیری رستم</div>
                <div className="text-xs text-slate-400">۱۸,۴۵۰ بازیکن آنلاین</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 pt-1 text-center font-bold text-[11px]">
              <button
                onClick={() => onSelectGame('chess', 'ai')}
                className="py-2 rounded-xl bg-slate-900 hover:bg-amber-500 hover:text-slate-950 border border-slate-800 hover:border-amber-400 text-slate-200 transition-all cursor-pointer"
              >
                🤖 هوش
              </button>
              <button
                onClick={() => onSelectGame('chess', '2p')}
                className="py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                👥 دونفره
              </button>
              <button
                onClick={() => onSelectGame('chess', 'league')}
                className="py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-purple-500/40 text-purple-200 transition-all cursor-pointer"
              >
                🏆 تورنمنت
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Category Filter Bar & Live Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl shadow-md">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & View Switcher */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی تالار بازی..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400 placeholder:text-slate-500"
            />
          </div>

          <div className="flex bg-slate-950 p-0.5 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => setViewStyle('grid')}
              title="نمایش شبکه‌ای مدرن (پیش‌فرض)"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewStyle === 'grid'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewStyle('rooms')}
              title="نمایش اسلایدر ۳بعدی"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewStyle === 'rooms'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Ultra-Fast Responsive Bento Game Grid */}
      {viewStyle === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              id={`game-pod-${game.id}`}
              className="group rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-lg hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-200 hover:-translate-y-1 relative overflow-hidden"
            >
              {/* Top Row: Icon + Badge + Rating */}
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 via-amber-600/15 to-transparent border border-amber-500/30 flex items-center justify-center text-2xl shadow-md">
                  {game.icon}
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-sans shadow-sm">
                    {game.badge}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-amber-300 font-bold">
                    <Star className="w-3 h-3 fill-current text-amber-400" />
                    <span>{game.rating}</span>
                  </div>
                </div>
              </div>

              {/* Middle Lore & Info */}
              <div className="flex flex-col gap-1.5 my-1">
                <div className="text-[11px] text-amber-400/90 font-black">{game.heroName} • {game.heroRole}</div>
                <h3 className="text-base font-black text-white group-hover:text-amber-300 transition-colors">
                  {game.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {game.description}
                </p>
              </div>

              {/* Online Player Meta */}
              <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  <span className="text-[11px]">{game.playersCount} آنلاین</span>
                </span>
                <span className="text-amber-400/90 font-bold text-[11px]">ورودی: {game.minCoins} سکه</span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1 font-bold text-xs">
                <button
                  onClick={() => onSelectGame(game.id, 'ai')}
                  className="py-2.5 px-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Bot className="w-3.5 h-3.5 text-amber-400" />
                  <span>بازی با هوش</span>
                </button>

                <button
                  onClick={() => onSelectGame(game.id, '2p')}
                  className="py-2.5 px-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Users className="w-3.5 h-3.5 text-slate-950" />
                  <span>دونفره / آنلاین</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Optional 3D Room-by-Room Carousel */
        <div className="w-full max-w-xl mx-auto py-2">
          <MythologicalRoomCarousel
            onStartGame={(gameId, mode) => onSelectGame(gameId, mode)}
          />
        </div>
      )}
    </div>
  );
};
