import React from 'react';
import { NavTab, UserProfile } from '../../types';
import { sounds } from '../../utils/audio';
import {
  Gamepad2,
  Trophy,
  MessageSquare,
  Gift,
  User,
  Sparkles,
  Crown,
} from 'lucide-react';

interface SleekMobileNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  profile: UserProfile;
  onOpenAuth?: () => void;
}

export const SleekMobileNav: React.FC<SleekMobileNavProps> = ({
  activeTab,
  onSelectTab,
  profile,
  onOpenAuth,
}) => {
  const handleTabClick = (tab: NavTab) => {
    sounds.playClick();
    onSelectTab(tab);
  };

  const isHome = activeTab === 'home' || activeTab === 'game_view';
  const isWheel = activeTab === 'wheel';
  const isLeagues = activeTab === 'leagues';
  const isChat = activeTab === 'chat';
  const isProfile = activeTab === 'profile' || activeTab === 'wallet';

  return (
    <div className="fixed bottom-3 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:w-[440px] z-40 pointer-events-auto font-['Vazirmatn'] select-none gpu-layer">
      {/* Main Solid Dock (Zero GPU lag on older phones) */}
      <nav className="relative w-full bg-[#0b0f19] border-2 border-amber-500/40 rounded-3xl px-2 py-2 shadow-2xl flex items-center justify-between">
        
        {/* 1. تالار بازی‌ها */}
        <button
          id="m-nav-home"
          onClick={() => handleTabClick('home')}
          className={`relative flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-300 active:scale-90 cursor-pointer ${
            isHome
              ? 'text-amber-300'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {isHome && (
            <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 via-amber-500/5 to-transparent rounded-2xl border-b-2 border-amber-400 -z-10" />
          )}
          <div className={`transition-transform duration-300 ${isHome ? 'scale-110 -translate-y-0.5' : ''}`}>
            <Gamepad2 className="w-5 h-5 drop-shadow-[0_2px_8px_rgba(245,158,11,0.4)]" />
          </div>
          <span className={`text-[10px] tracking-tight mt-0.5 ${isHome ? 'font-black text-amber-300 drop-shadow' : 'font-medium'}`}>
            بازی‌ها
          </span>
          {isHome && (
            <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5 shadow-sm shadow-amber-400" />
          )}
        </button>

        {/* 2. لیگ‌ها و جوایز */}
        <button
          id="m-nav-leagues"
          onClick={() => handleTabClick('leagues')}
          className={`relative flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-300 active:scale-90 cursor-pointer ${
            isLeagues
              ? 'text-amber-300'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {isLeagues && (
            <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 via-amber-500/5 to-transparent rounded-2xl border-b-2 border-amber-400 -z-10" />
          )}
          <div className={`relative transition-transform duration-300 ${isLeagues ? 'scale-110 -translate-y-0.5' : ''}`}>
            <Trophy className="w-5 h-5 drop-shadow-[0_2px_8px_rgba(245,158,11,0.4)]" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-950 animate-pulse" />
          </div>
          <span className={`text-[10px] tracking-tight mt-0.5 ${isLeagues ? 'font-black text-amber-300 drop-shadow' : 'font-medium'}`}>
            لیگ‌ها
          </span>
          {isLeagues && (
            <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5 shadow-sm shadow-amber-400" />
          )}
        </button>

        {/* 3. CENTER HERO: گردونه شانس اساطیری (Elevated Floating Crown Action) */}
        <div className="relative -top-5 px-1">
          <button
            id="m-nav-wheel-hero"
            onClick={() => handleTabClick('wheel')}
            className="group relative w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 p-0.5 shadow-[0_10px_25px_rgba(245,158,11,0.5),0_0_15px_rgba(245,158,11,0.3)] transition-all duration-300 hover:scale-105 active:scale-90 cursor-pointer"
          >
            {/* Outer Spinning Ambient Ring */}
            <div className="absolute -inset-1 rounded-[18px] bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-600 opacity-70 blur-xs group-hover:opacity-100 transition-opacity animate-spin-slow -z-10" />

            <div className="w-full h-full bg-slate-950 rounded-[14px] flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 via-transparent to-yellow-400/20" />
              <Gift className="w-6 h-6 text-amber-400 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_2px_6px_rgba(245,158,11,0.6)]" />
              <span className="text-[8px] font-black text-amber-300 leading-none mt-0.5">
                گردونه
              </span>
            </div>

            {/* Sparkle Badge */}
            <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[8px] font-black rounded-full shadow-md border border-slate-900 animate-bounce">
              هدیه
            </span>
          </button>
        </div>

        {/* 4. چت و پشتیبانی */}
        <button
          id="m-nav-chat"
          onClick={() => handleTabClick('chat')}
          className={`relative flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-300 active:scale-90 cursor-pointer ${
            isChat
              ? 'text-amber-300'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {isChat && (
            <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 via-amber-500/5 to-transparent rounded-2xl border-b-2 border-amber-400 -z-10" />
          )}
          <div className={`relative transition-transform duration-300 ${isChat ? 'scale-110 -translate-y-0.5' : ''}`}>
            <MessageSquare className="w-5 h-5 drop-shadow-[0_2px_8px_rgba(245,158,11,0.4)]" />
            <span className="absolute -top-0.5 -left-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-ping" />
            <span className="absolute -top-0.5 -left-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
          </div>
          <span className={`text-[10px] tracking-tight mt-0.5 ${isChat ? 'font-black text-amber-300 drop-shadow' : 'font-medium'}`}>
            گفتگو
          </span>
          {isChat && (
            <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5 shadow-sm shadow-amber-400" />
          )}
        </button>

        {/* 5. پروفایل کاربری یا ورود */}
        <button
          id="m-nav-profile"
          onClick={() => {
            sounds.playClick();
            if (onOpenAuth) {
              onOpenAuth();
            } else {
              onSelectTab('profile');
            }
          }}
          className={`relative flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-300 active:scale-90 cursor-pointer ${
            isProfile
              ? 'text-amber-300'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {isProfile && (
            <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 via-amber-500/5 to-transparent rounded-2xl border-b-2 border-amber-400 -z-10" />
          )}
          <div className={`transition-transform duration-300 ${isProfile ? 'scale-110 -translate-y-0.5' : ''}`}>
            {profile.customAvatarUrl ? (
              <img
                src={profile.customAvatarUrl}
                alt="Avatar"
                className="w-5 h-5 rounded-full object-cover border border-amber-400 shadow-sm"
              />
            ) : profile.isLoggedIn ? (
              <span className="text-base leading-none">{profile.avatar}</span>
            ) : (
              <User className="w-5 h-5 drop-shadow-[0_2px_8px_rgba(245,158,11,0.4)]" />
            )}
          </div>
          <span className={`text-[10px] tracking-tight mt-0.5 ${isProfile ? 'font-black text-amber-300 drop-shadow' : 'font-medium'}`}>
            {profile.isLoggedIn ? 'پروفایل' : 'ورود'}
          </span>
          {isProfile && (
            <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5 shadow-sm shadow-amber-400" />
          )}
        </button>

      </nav>
    </div>
  );
};
