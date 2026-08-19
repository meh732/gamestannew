import React, { useState } from 'react';
import { GameId, GameMode, NavTab, UserProfile, ViewMode } from '../types';
import { GAMES_LIST } from '../data/gamesList';
import { MythologicalRoomCarousel } from './MythologicalRoomCarousel';
import { SleekMobileNav } from './common/SleekMobileNav';
import { sounds } from '../utils/audio';
import {
  ChevronLeft,
  User,
  Ticket,
  Candy,
  KeyRound,
  Volume2,
  VolumeX,
  LayoutGrid,
  Layers,
  Globe,
  Download,
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
  const [isMuted, setIsMuted] = useState(sounds.getMuted());
  const isInsideGame = activeTab === 'game_view' && selectedGameId !== null;

  const toggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      sounds.playClick();
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#0a0705] font-['Vazirmatn'] text-slate-100 relative overflow-x-hidden">
      {/* Mobile Top App Bar (Antique Bronze Style matching User Reference Image) */}
      <header className="sticky top-0 bg-[#120d08]/95 border-b border-[#a37c2c]/60 px-3 sm:px-4 py-2 flex items-center justify-between z-30 shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
        {isInsideGame ? (
          <button
            id="android-back-to-home-btn"
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-1 text-xs font-bold text-[#f5d996] hover:text-[#fbbf24] active:scale-95 transition-all cursor-pointer bg-[#24170a] px-3 py-1.5 rounded-xl border border-[#c29b38]"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>بازگشت به تالار بازی‌ها</span>
          </button>
        ) : (
          /* Top 5 Antique Badges from Reference Image */
          <div className="w-full flex items-center justify-between gap-1 sm:gap-2">
            {/* 1. پروفایل */}
            <button
              onClick={onOpenAuth}
              className="flex flex-col items-center gap-0.5 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#2e2213] to-[#140d06] border border-[#c29b38] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <User className="w-4 h-4 text-[#e5d0a1]" />
              </div>
              <span className="text-[9px] font-bold text-[#bfa472] leading-none">پروفایل</span>
            </button>

            {/* 2. بلیت */}
            <button
              onClick={() => onSelectTab('leagues')}
              className="flex flex-col items-center gap-0.5 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#2e2213] to-[#140d06] border border-[#c29b38] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Ticket className="w-4 h-4 text-[#e5d0a1]" />
              </div>
              <span className="text-[9px] font-bold text-[#bfa472] leading-none">بلیت</span>
            </button>

            {/* 3. آب‌نبات / سکه */}
            <button
              onClick={() => onSelectTab('wallet')}
              className="flex flex-col items-center gap-0.5 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#3d2211] to-[#170e05] border border-[#f59e0b] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Candy className="w-4 h-4 text-[#fbbf24]" />
              </div>
              <span className="text-[9px] font-black text-[#f5d996] leading-none">
                {profile.coins.toLocaleString('fa-IR')}
              </span>
            </button>

            {/* 4. جاسوییچی / نشان */}
            <button
              onClick={() => onSelectTab('wheel')}
              className="flex flex-col items-center gap-0.5 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#2e2213] to-[#140d06] border border-[#c29b38] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <KeyRound className="w-4 h-4 text-[#e5d0a1]" />
              </div>
              <span className="text-[9px] font-bold text-[#bfa472] leading-none">جاسوییچی</span>
            </button>

            {/* 5. بلندگو */}
            <button
              onClick={toggleSound}
              className="flex flex-col items-center gap-0.5 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#2e2213] to-[#140d06] border border-[#c29b38] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-[#e5d0a1]" />
                )}
              </div>
              <span className="text-[9px] font-bold text-[#bfa472] leading-none">بلندگو</span>
            </button>

            {/* Optional Small Mode Toggles */}
            <div className="flex items-center gap-1 border-r border-[#785928]/50 pr-1.5 mr-0.5">
              {onToggleViewMode && (
                <button
                  onClick={() => onToggleViewMode('web')}
                  title="نمای وب‌سایت"
                  className="p-1 rounded-lg bg-[#24170a] border border-[#785928] text-[#e5d0a1] hover:text-[#fbbf24] cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5" />
                </button>
              )}
              {onOpenPwaInstall && (
                <button
                  onClick={onOpenPwaInstall}
                  title="نصب اپلیکیشن"
                  className="p-1 rounded-lg bg-[#1b3322] border border-[#4ade80]/60 text-emerald-300 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              )}
              {activeTab === 'home' && (
                <button
                  onClick={() => setMobileViewStyle((s) => (s === 'room' ? 'grid' : 'room'))}
                  title={mobileViewStyle === 'room' ? 'نمای شبکه‌ای' : 'نمای ورق‌زدن ۳بعدی'}
                  className="p-1 rounded-lg bg-[#24170a] border border-[#785928] text-[#f59e0b] cursor-pointer"
                >
                  {mobileViewStyle === 'room' ? (
                    <LayoutGrid className="w-3.5 h-3.5" />
                  ) : (
                    <Layers className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Screen Content */}
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
                  className="bg-[#170f07] border border-[#a37c2c]/60 hover:border-[#f59e0b] rounded-2xl overflow-hidden p-2.5 flex flex-col gap-2 cursor-pointer shadow-lg hover:scale-102 transition-all group"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                    {game.heroImage && (
                      <img
                        src={game.heroImage}
                        alt={game.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <span className="absolute bottom-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-slate-950">
                      {game.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-[#f5d996]">{game.roomTitle || game.title}</h3>
                    <p className="text-[10px] text-[#bfa472]">{game.heroName}</p>
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
