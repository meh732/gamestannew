import React, { useState, useRef } from 'react';
import { UserProfile } from '../../types';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Flame,
  Shield,
  Coins,
  Gem,
  Gamepad2,
  Camera,
  LogIn,
  Lock,
  UserPlus,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

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
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar || '👑');
  const [savedAlert, setSavedAlert] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const winRate =
    profile.totalGames > 0
      ? Math.round((profile.wins / profile.totalGames) * 100)
      : 0;

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

  // If user is NOT logged in: Show dedicated Clean Authentication Gate
  if (!profile.isLoggedIn) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 flex flex-col gap-6 text-slate-100 font-['Vazirmatn'] select-none">
        {/* Back Button */}
        {onBack && (
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
            >
              ← بازگشت به صفحه اصلی
            </button>
            <span className="text-xs text-amber-400 font-bold">ورود به حساب کاربری گیمستان</span>
          </div>
        )}

        {/* Hero Card for Unregistered Guests */}
        <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center gap-5 shadow-2xl shadow-amber-500/10 relative overflow-hidden">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/30 p-1">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
              <Lock className="w-9 h-9 text-amber-400" />
            </div>
          </div>

          <div className="flex flex-col gap-2 max-w-md">
            <h2 className="text-2xl font-black bg-gradient-to-l from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
              ورود و ثبت‌نام در گیمستان
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              برای مشاهده و ویرایش مشخصات پروفایل، تنظیم عکس اختصاصی، رتبه‌بندی ELO و ذخیره جوایز لیگ‌ها، لطفاً وارد حساب خود شوید.
            </p>
          </div>

          {/* Key Advantages */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-1 text-right">
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl flex items-center gap-2.5 text-xs text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>تنظیم آواتار و آپلود عکس دلخواه</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl flex items-center gap-2.5 text-xs text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>ذخیره دائمی سکه‌ها و الماس‌ها</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl flex items-center gap-2.5 text-xs text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>شرکت در تورنمنت‌ها و جوایز نقدی</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl flex items-center gap-2.5 text-xs text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>ثبت رنک و مدال‌های اساطیری</span>
            </div>
          </div>

          {/* Action Login Button */}
          <button
            id="gate-open-auth-btn"
            onClick={onOpenAuth}
            className="w-full sm:w-80 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5 text-slate-950" />
            <span>ورود / ایجاد حساب کاربری رایگان</span>
          </button>
        </div>
      </div>
    );
  }

  // Once user IS LOGGED IN: Show full Profile & Customization Dashboard
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
              {profile.avatar || '👑'}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-amber-300">{profile.displayName}</h1>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                {profile.authMethod === 'google' ? 'گوگل ✓' : 'موبایل ✓'}
              </span>
            </div>
            <p className="text-xs text-slate-400">@{profile.username} • {profile.rankTitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>مدیریت حساب</span>
            </button>
          )}

          {onBack && (
            <button
              id="profile-back-btn"
              onClick={onBack}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
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
                style={{ width: `${(profile.xp / (profile.xpToNext || 100)) * 100}%` }}
              />
            </div>
          </div>

          {/* Avatar Selector & Custom Upload Menu (Unlocked after login) */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col gap-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">تنظیم و تغییر آواتار کاربری:</span>
              {savedAlert && <span className="text-xs text-emerald-400 font-bold">آواتار به‌روزرسانی شد! ✓</span>}
            </div>

            <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>آپلود عکس اختصاصی از گالری</span>
              </button>
              <span className="text-[11px] text-slate-400">عکس دلخواه شما روی حساب کاربریتان اعمال می‌شود.</span>
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

          {/* Shop Packages */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-md flex flex-col gap-3">
            <h3 className="text-sm font-bold text-amber-300">بسته‌های شارژ فوری سکه و الماس:</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950 border border-slate-800 hover:border-amber-500/40 p-4 rounded-2xl flex flex-col justify-between gap-3 transition-colors">
                <div>
                  <div className="text-xs font-bold text-slate-200">بسته برنزی</div>
                  <div className="text-base font-black text-amber-400 font-mono mt-1">۱,۰۰۰ سکه + ۱۰ الماس</div>
                </div>
                <button
                  onClick={() => handleBuyPackage(1000, 10)}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  دریافت بسته
                </button>
              </div>

              <div className="bg-slate-950 border border-amber-500/40 p-4 rounded-2xl flex flex-col justify-between gap-3 relative overflow-hidden">
                <span className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">
                  پرفروش
                </span>
                <div>
                  <div className="text-xs font-bold text-amber-300">بسته نقره‌ای</div>
                  <div className="text-base font-black text-amber-400 font-mono mt-1">۵,۰۰۰ سکه + ۶۰ الماس</div>
                </div>
                <button
                  onClick={() => handleBuyPackage(5000, 60)}
                  className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  دریافت بسته
                </button>
              </div>

              <div className="bg-slate-950 border border-cyan-500/40 p-4 rounded-2xl flex flex-col justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-cyan-300">بسته طلایی شاهنامه</div>
                  <div className="text-base font-black text-cyan-400 font-mono mt-1">۲۰,۰۰۰ سکه + ۳۰۰ الماس</div>
                </div>
                <button
                  onClick={() => handleBuyPackage(20000, 300)}
                  className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  دریافت بسته
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
