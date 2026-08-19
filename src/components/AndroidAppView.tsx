import React, { useState } from 'react';
import { GameId, GameMode, NavTab, UserProfile, ViewMode } from '../types';
import { GAMES_LIST } from '../data/gamesList';
import { MythologicalRoomCarousel } from './MythologicalRoomCarousel';
import { SleekMobileNav } from './common/SleekMobileNav';
import {
  ChevronLeft,
  Coins,
  LayoutGrid,
  Layers,
  LogIn,
  Download,
  Globe,
} from 'lucide-react';

interface AndroidAppViewProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onSelectGame: (gameId: GameId, mode?: GameMode) => void;
  selectedGameId: GameId | null;
  profile: UserProfile;
  onToggleViewMode?: (mode: ViewMode) => void;
  onOpenAuth?: () => void;
  onOpenPwaInstall?: () => void;
  children: React.ReactNode;
}

export const AndroidAppView: React.FC<AndroidAppViewProps> = ({
  activeTab,
  onSelectTab,
  onSelectGame,
  selectedGameId,
  profile,
  onToggleViewMode,
  onOpenAuth,
  onOpenPwaInstall,
  children,
}) => {
  const [mobileViewStyle, setMobileViewStyle] = useState<'room' | 'grid'>('room');
  const isInsideGame = activeTab === 'game_view' && selectedGameId !== null;

  return (
    <div className="w-full min-h-screen flex flex-col bg-slate-950 font-['Vazirmatn'] text-slate-100 relative overflow-x-hidden">
      {/* Mobile Top App Bar */}
      <header className="sticky top-0 bg-[#070a12] border-b border-amber-500/30 px-3 sm:px-4 py-2 flex items-center justify-between z-30 shadow-md">
        {isInsideGame ? (
          <button
            id="android-back-to-home-btn"
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 active:scale-95 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>بازگشت به تالار</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center text-xs shadow-md shadow-amber-500/20">
              👑
            </div>
            <div>
              <span className="text-xs sm:text-sm font-black bg-gradient-to-l from-amber-300 to-amber-500 bg-clip-text text-transparent">
                گیمستان
              </span>
              <span className="text-[9px] text-amber-400/80 mr-1.5 font-bold">PRO</span>
            </div>
          </div>
        )}

        {/* Top actions: View Toggle, PWA Install, Wallet & User / Auth */}
        <div className="flex items-center gap-1.5">
          {/* Switch to Web Mode */}
          {onToggleViewMode && (
            <button
              onClick={() => onToggleViewMode('web')}
              title="تغییر به نمای وب‌سایت دسکتاپ"
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-300 text-xs flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="text-[10px] hidden sm:inline">وب‌سایت</span>
            </button>
          )}

          {/* PWA Install Button on mobile */}
          {onOpenPwaInstall && (
            <button
              onClick={onOpenPwaInstall}
              title="نصب اپلیکیشن روی گوشی"
              className="p-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="text-[10px] hidden sm:inline">نصب</span>
            </button>
          )}

          {!isInsideGame && activeTab === 'home' && (
            <button
              onClick={() => setMobileViewStyle((s) => (s === 'room' ? 'grid' : 'room'))}
              title={mobileViewStyle === 'room' ? 'نمای شبکه‌ای' : 'نمای ورق‌زدن ۳بعدی'}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 hover:bg-slate-800 text-xs flex items-center gap-1 cursor-pointer"
            >
              {mobileViewStyle === 'room' ? (
                <LayoutGrid className="w-3.5 h-3.5" />
              ) : (
                <Layers className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          {/* Wallet */}
          <div
            onClick={() => onSelectTab('wallet')}
            className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-xl border border-amber-500/30 cursor-pointer shadow-sm"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-black text-amber-300 font-mono">
              {profile.coins.toLocaleString('fa-IR')}
            </span>
          </div>

          {/* User Auth Button */}
          {profile.isLoggedIn ? (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-900 border border-amber-500/30 hover:border-amber-400 transition-colors cursor-pointer"
            >
              {profile.customAvatarUrl ? (
                <img
                  src={profile.customAvatarUrl}
                  alt={profile.displayName}
                  className="w-6 h-6 rounded-lg object-cover"
                />
              ) : (
                <span className="text-base">{profile.avatar}</span>
              )}
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <LogIn className="w-3 h-3" />
              <span>ورود</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Screen Content with ZERO wasted space */}
      <main className="flex-1 w-full flex flex-col pb-24 relative z-10 no-scrollbar overflow-x-hidden">
        {activeTab === 'home' && !isInsideGame ? (
          mobileViewStyle === 'room' ? (
            <MythologicalRoomCarousel onStartGame={onSelectGame} />
          ) : (
            /* Grid View of all Games */
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3">
              {GAMES_LIST.map((game) => (
                <div
                  key={game.id}
                  onClick={() => onSelectGame(game.id, 'ai')}
                  className="bg-slate-900/90 border border-slate-800 hover:border-amber-400/60 rounded-2xl overflow-hidden p-2.5 flex flex-col gap-2 cursor-pointer shadow-lg hover:scale-102 transition-all group"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950">
                    {game.heroImage && (
                      <img
                        src={game.heroImage}
                        alt={game.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <span className="absolute bottom-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-slate-950">
                      {game.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-amber-300">{game.title}</h3>
                    <p className="text-[10px] text-slate-400">{game.heroName}</p>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="flex-1 w-full flex flex-col">{children}</div>
        )}
      </main>

      {/* Ultra-Sleek Floating Bottom Navigation Dock */}
      <SleekMobileNav
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        profile={profile}
        onOpenAuth={onOpenAuth}
      />
    </div>
  );
};
