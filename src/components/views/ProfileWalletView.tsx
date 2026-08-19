import React, { useState, useRef } from 'react';
import { UserProfile } from '../../types';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { Trophy, Flame, Shield, Coins, Gem, Gamepad2, Check, Upload, Camera, LogIn } from 'lucide-react';

interface ProfileWalletViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onBack?: () => void;
  onOpenAuth?: () => void;
}

const AVATARS = ['🦁', '👑', '💎', '🚀', '🧠', '⚔️', '🌸', '🧙‍♂️', '🦅', '🎯'];

export const ProfileWalletView: React.FC<ProfileWalletViewProps> = ({
  profile,
  onUpdateProfile,
  onBack,
  onOpenAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'wallet'>('profile');
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar);
  const [savedAlert, setSavedAlert] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const winRate = profile.totalGames > 0 ? Math.round((profile.wins / profile.totalGames) * 100) : 75;

  const handleSaveAvatar = (av: string) => {
    setSelectedAvatar(av);
    onUpdateProfile({ avatar: av, customAvatarUrl: undefined });
    setSavedAlert(true);
    sounds.playClick();
    setTimeout(() => setSavedAlert(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onUpdateProfile({ customAvatarUrl: reader.result as string });
      setSavedAlert(true);
      sounds.playWin();
      setTimeout(() => setSavedAlert(false), 2000);
    };
    reader.readAsDataURL(file);
  };

  const handleBuyPackage = (coins: number, gems: number) => {
    onUpdateProfile({
      coins: profile.coins + coins,
      gems: profile.gems + gems,
    });
    sounds.playWin();
    confetti({ particleCount: 100, spread: 80 });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-2 sm:p-5 flex flex-col gap-3 sm:gap-5 text-slate-100 font-['Vazirmatn']">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-3">
          {profile.customAvatarUrl ? (
            <img
              src={profile.customAvatarUrl}
              alt={profile.displayName}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-md shadow-amber-500/20"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-3xl shadow-md shadow-amber-500/20">
              {profile.avatar}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-amber-300">{profile.displayName}</h1>
              {profile.isLoggedIn && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                  {profile.authMethod === 'google' ? 'گوگل ✓' : 'موبایل ✓'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">@{profile.username} • {profile.rankTitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{profile.isLoggedIn ? 'مدیریت حساب' : 'ورود / ثبت‌نام'}</span>
            </button>
          )}

          {onBack && (
            <button
              id="profile-back-btn"
              onClick={onBack}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer"
            >
              بازگشت
            </button>
          )}
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex gap-2 bg-slate-900/80 p-2 rounded-2xl border border-slate-800">
        <button
          id="profile-tab-btn"
          onClick={() => setActiveTab('profile')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>پروفایل و آمار عملکرد</span>
        </button>

        <button
          id="wallet-tab-btn"
          onClick={() => setActiveTab('wallet')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'wallet'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>کیف پول و شارژ سکه</span>
        </button>
      </div>

      {activeTab === 'profile' ? (
        <div className="flex flex-col gap-4">
          {/* Key Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col gap-1 shadow-md">
              <div className="flex items-center justify-between text-amber-400">
                <Trophy className="w-5 h-5" />
                <span className="text-xs font-bold">ELO Rating</span>
              </div>
              <span className="text-2xl font-black text-white font-mono">{profile.ratingElo}</span>
              <span className="text-[11px] text-slate-400">سطح: {profile.level}</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col gap-1 shadow-md">
              <div className="flex items-center justify-between text-emerald-400">
                <Shield className="w-5 h-5" />
                <span className="text-xs font-bold">نرخ برد</span>
              </div>
              <span className="text-2xl font-black text-white font-mono">{winRate}٪</span>
              <span className="text-[11px] text-emerald-400">{profile.wins} پیروزی</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col gap-1 shadow-md">
              <div className="flex items-center justify-between text-rose-400">
                <Flame className="w-5 h-5" />
                <span className="text-xs font-bold">استریک پیاپی</span>
              </div>
              <span className="text-2xl font-black text-white font-mono">{profile.streak} بازی</span>
              <span className="text-[11px] text-rose-400">پیروزی متوالی</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col gap-1 shadow-md">
              <div className="flex items-center justify-between text-sky-400">
                <Gamepad2 className="w-5 h-5" />
                <span className="text-xs font-bold">مجموع بازی‌ها</span>
              </div>
              <span className="text-2xl font-black text-white font-mono">{profile.totalGames}</span>
              <span className="text-[11px] text-slate-400">در تمام بخش‌ها</span>
            </div>
          </div>

          {/* Level Progress */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col gap-2 shadow-md">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300">پیشرفت تا سطح {profile.level + 1}</span>
              <span className="text-amber-400">{profile.xp} / {profile.xpToNext} XP</span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
                style={{ width: `${(profile.xp / profile.xpToNext) * 100}%` }}
              />
            </div>
          </div>

          {/* Avatar Selector & Upload */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col gap-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">انتخاب یا آپلود عکس کاربری:</span>
              {savedAlert && <span className="text-xs text-emerald-400 font-bold">آواتار به‌روزرسانی شد! ✓</span>}
            </div>

            <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>آپلود عکس از گالری</span>
              </button>
              <span className="text-[11px] text-slate-400">عکس دلخواه شما به جای ایموجی قرار می‌گیرد.</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  id={`avatar-select-${av}`}
                  onClick={() => handleSaveAvatar(av)}
                  className={`aspect-square rounded-xl text-2xl flex items-center justify-center border transition-all cursor-pointer ${
                    selectedAvatar === av && !profile.customAvatarUrl
                      ? 'bg-amber-500/20 border-amber-400 scale-110 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800/80 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Wallet Shop */
        <div className="flex flex-col gap-4">
          {/* Current Balance */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-500/40 p-4 rounded-2xl flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <Coins className="w-8 h-8 text-amber-400" />
                <div>
                  <div className="text-xs text-slate-400">موجودی سکه طلا</div>
                  <div className="text-xl font-black text-amber-300 font-mono">
                    {profile.coins.toLocaleString('fa-IR')}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-700/10 border border-cyan-500/40 p-4 rounded-2xl flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <Gem className="w-8 h-8 text-cyan-400" />
                <div>
                  <div className="text-xs text-slate-400">موجودی الماس</div>
                  <div className="text-xl font-black text-cyan-300 font-mono">
                    {profile.gems.toLocaleString('fa-IR')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recharge Packages Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Package 1 */}
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between gap-4 shadow-md hover:border-amber-500/40 transition-all">
              <div>
                <div className="text-2xl mb-1">🪙</div>
                <h2 className="text-sm font-bold text-slate-100">بسته برنزی سکه</h2>
                <p className="text-xs text-slate-400">۱,۰۰۰ سکه طلا + ۱۰ الماس هدیه</p>
              </div>
              <button
                id="buy-pkg-1"
                onClick={() => handleBuyPackage(1000, 10)}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                دریافت رایگان تست 🎁
              </button>
            </div>

            {/* Package 2 */}
            <div className="bg-slate-900/90 border border-amber-500/50 p-4 rounded-2xl flex flex-col justify-between gap-4 shadow-lg ring-1 ring-amber-400/30">
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-2xl mb-1">💎</div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                    محبوب‌ترین
                  </span>
                </div>
                <h2 className="text-sm font-bold text-amber-300">بسته طلایی ویژه</h2>
                <p className="text-xs text-slate-400">۵,۰۰۰ سکه طلا + ۶۰ الماس هدیه</p>
              </div>
              <button
                id="buy-pkg-2"
                onClick={() => handleBuyPackage(5000, 60)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                دریافت رایگان تست 🎁
              </button>
            </div>

            {/* Package 3 */}
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between gap-4 shadow-md hover:border-cyan-500/40 transition-all">
              <div>
                <div className="text-2xl mb-1">👑</div>
                <h2 className="text-sm font-bold text-slate-100">بسته پادشاهی VIP</h2>
                <p className="text-xs text-slate-400">۲۰,۰۰۰ سکه طلا + ۳۰۰ الماس + تیک VIP</p>
              </div>
              <button
                id="buy-pkg-3"
                onClick={() => handleBuyPackage(20000, 300)}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                دریافت رایگان تست 🎁
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
