import React from 'react';
import { NavTab, UserProfile, ViewMode } from '../types';
import { sounds } from '../utils/audio';
import {
  Globe,
  Smartphone,
  Volume2,
  VolumeX,
  Coins,
  Gem,
  LogIn,
  Download,
} from 'lucide-react';

interface NavbarProps {
  viewMode: ViewMode;
  onToggleViewMode: (mode: ViewMode) => void;
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  profile: UserProfile;
  onOpenAuth: () => void;
  onOpenPwaInstall: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  onToggleViewMode,
  activeTab,
  onSelectTab,
  profile,
  onOpenAuth,
  onOpenPwaInstall,
}) => {
  const [isMuted, setIsMuted] = React.useState(sounds.getMuted());

  const toggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#070a12] border-b border-amber-500/20 px-3 sm:px-6 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo & Title */}
        <div
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center text-xl shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            👑
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black bg-gradient-to-l from-amber-300 to-amber-500 bg-clip-text text-transparent">
                گیمستان
              </span>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PRO
              </span>
            </div>
            <div className="text-[10px] text-slate-400">GameStan Gaming Platform</div>
          </div>
        </div>

        {/* Center Nav Links (For Web Mode) */}
        {viewMode === 'web' && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
            <button
              id="web-nav-home"
              onClick={() => onSelectTab('home')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              خانه و بازی‌ها
            </button>
            <button
              id="web-nav-wheel"
              onClick={() => onSelectTab('wheel')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'wheel'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              گردونه شانس 🎡
            </button>
            <button
              id="web-nav-leagues"
              onClick={() => onSelectTab('leagues')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'leagues'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              لیگ‌ها 🏆
            </button>
            <button
              id="web-nav-rules"
              onClick={() => onSelectTab('rules')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'rules'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              قوانین 📜
            </button>
            <button
              id="web-nav-chat"
              onClick={() => onSelectTab('chat')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              چت و پشتیبانی 💬
            </button>
          </nav>
        )}

        {/* Right Section: PWA Install, Mode Switcher, Wallet, Sound, Profile/Auth */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* PWA Install Button */}
          <button
            id="navbar-pwa-install-btn"
            onClick={onOpenPwaInstall}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
            title="نصب نسخه اپلیکیشن PWA"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">نصب اپلیکیشن</span>
          </button>

          {/* Dual Perspective Mode Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 shadow-inner">
            <button
              id="mode-web-btn"
              onClick={() => onToggleViewMode('web')}
              title="نمای پورتال وب‌سایت"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'web'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden md:inline">وب‌سایت</span>
            </button>

            <button
              id="mode-android-btn"
              onClick={() => onToggleViewMode('android')}
              title="نمای اپلیکیشن موبایل (PWA)"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'android'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">اپ اندروید</span>
            </button>
          </div>

          {/* Wallet Chips */}
          <div
            onClick={() => onSelectTab('wallet')}
            className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 px-2.5 py-1 rounded-xl cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
              <Coins className="w-3.5 h-3.5" />
              <span className="font-mono">{profile.coins.toLocaleString('fa-IR')}</span>
            </div>
            <div className="w-px h-3 bg-slate-700 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-1 text-cyan-400 text-xs font-bold">
              <Gem className="w-3.5 h-3.5" />
              <span className="font-mono">{profile.gems.toLocaleString('fa-IR')}</span>
            </div>
          </div>

          {/* Sound Mute Toggle */}
          <button
            id="sound-toggle-btn"
            onClick={toggleSound}
            title={isMuted ? 'صدا قطع است' : 'صدا فعال است'}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Login / Profile Button */}
          {profile.isLoggedIn ? (
            <button
              id="user-profile-btn"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/40 text-xs font-bold text-amber-200 transition-all shadow-md cursor-pointer"
            >
              {profile.customAvatarUrl ? (
                <img
                  src={profile.customAvatarUrl}
                  alt={profile.displayName}
                  className="w-6 h-6 rounded-lg object-cover border border-amber-400"
                />
              ) : (
                <span className="text-base">{profile.avatar}</span>
              )}
              <span className="hidden sm:inline">{profile.displayName}</span>
            </button>
          ) : (
            <button
              id="nav-login-btn"
              onClick={onOpenAuth}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>ورود</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
