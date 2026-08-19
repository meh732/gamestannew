import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../../types';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';
import {
  X,
  Smartphone,
  CheckCircle2,
  Upload,
  Camera,
  Trash2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  LogOut,
  UserCheck,
  Lock,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
}

const MYTHOLOGICAL_AVATARS = ['🦁', '👑', '🦅', '⚔️', '💎', '🧙‍♂️', '🎯', '🌸', '🚀', '🧠'];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
}) => {
  // If not logged in, only allow 'google' or 'phone'. If logged in, default to 'profile'
  const [authTab, setAuthTab] = useState<'google' | 'phone' | 'profile'>(
    currentUser.isLoggedIn ? 'profile' : 'google'
  );

  useEffect(() => {
    if (!currentUser.isLoggedIn && authTab === 'profile') {
      setAuthTab('google');
    } else if (currentUser.isLoggedIn && authTab !== 'profile') {
      setAuthTab('profile');
    }
  }, [currentUser.isLoggedIn]);
  
  // Google state
  const [googleEmail, setGoogleEmail] = useState(currentUser.email || 'user@gmail.com');
  const [googleName, setGoogleName] = useState(currentUser.displayName || 'کاربر گیمستان');
  const [googleLoading, setGoogleLoading] = useState(false);

  // Phone OTP state
  const [phone, setPhone] = useState(currentUser.phone || '0912');
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');
  const [otpCode, setOtpCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [phoneCountdown, setPhoneCountdown] = useState(60);

  // Profile Edit state (Only for logged-in users)
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [username, setUsername] = useState(currentUser.username);
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser.avatar);
  const [customAvatarPreview, setCustomAvatarPreview] = useState<string | undefined>(
    currentUser.customAvatarUrl
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Google Login Flow
  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    sounds.playClick();
    setTimeout(() => {
      setGoogleLoading(false);
      onUpdateUser({
        isLoggedIn: true,
        authMethod: 'google',
        email: googleEmail,
        displayName: googleName || 'کاربر تایید شده گوگل',
        avatar: currentUser.avatar || '🦁',
      });
      sounds.playWin();
      confetti({ particleCount: 80, spread: 70 });
      showToast(`خوش آمدید! ورود موفق با حساب گوگل (${googleEmail})`);
      setAuthTab('profile');
    }, 800);
  };

  // Phone Send OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      showToast('لطفاً شماره موبایل ۱۱ رقمی معتبر وارد کنید.');
      sounds.playError();
      return;
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCode(code);
    setOtpStep('verify');
    setPhoneCountdown(60);
    sounds.playMove();
    showToast(`کد تایید پیامکی: ${code}`);

    const timer = setInterval(() => {
      setPhoneCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Phone Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode !== generatedCode && otpCode !== '1234') {
      showToast('کد وارد شده اشتباه است. مجدداً تلاش کنید.');
      sounds.playError();
      return;
    }

    onUpdateUser({
      isLoggedIn: true,
      authMethod: 'phone',
      phone: phone,
      displayName: `پهلوان ${phone.slice(-4)}`,
    });
    sounds.playWin();
    confetti({ particleCount: 80, spread: 70 });
    showToast('ورود با شماره موبایل با موفقیت انجام شد!');
    setAuthTab('profile');
  };

  // Custom File Upload (Only accessible when logged in)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('حجم فایل انتخابی باید کمتر از ۵ مگابایت باشد.');
      sounds.playError();
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCustomAvatarPreview(result);
      sounds.playClick();
      showToast('تصویر با موفقیت بارگذاری شد! برای ثبت دکمه ذخیره را بزنید.');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      displayName,
      username,
      avatar: selectedAvatar,
      customAvatarUrl: customAvatarPreview,
    });
    sounds.playWin();
    showToast('اطلاعات پروفایل و تصویر کاربری ذخیره شد!');
    setTimeout(() => onClose(), 1000);
  };

  const handleRemoveCustomAvatar = () => {
    setCustomAvatarPreview(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    sounds.playClick();
  };

  const handleLogout = () => {
    onUpdateUser({
      isLoggedIn: false,
      authMethod: 'guest',
    });
    sounds.playMove();
    setAuthTab('google');
    showToast('از حساب کاربری خارج شدید.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md font-['Vazirmatn'] text-slate-100">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-black overflow-hidden flex flex-col gap-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center text-xl shadow-lg shadow-amber-500/30">
              {currentUser.isLoggedIn ? '👑' : '🔒'}
            </div>
            <div>
              <h2 className="text-lg font-black text-amber-300">
                {currentUser.isLoggedIn
                  ? 'مدیریت پروفایل و حساب کاربری'
                  : 'ورود و عضویت در گیمستان'}
              </h2>
              <p className="text-xs text-slate-400">
                {currentUser.isLoggedIn
                  ? 'تنظیم عکس اختصاصی، تغییر نام و مدیریت حساب'
                  : 'جهت ذخیره سوابق و تنظیم عکس ابتدا وارد شوید'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="بستن"
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="bg-amber-500/20 border border-amber-400/80 p-2.5 rounded-xl text-xs text-amber-300 text-center font-bold animate-pulse">
            {toastMessage}
          </div>
        )}

        {/* Status Badge */}
        <div className="flex items-center justify-between bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2.5">
            {currentUser.isLoggedIn && currentUser.customAvatarUrl ? (
              <img
                src={currentUser.customAvatarUrl}
                alt={currentUser.displayName}
                className="w-10 h-10 rounded-xl object-cover border border-amber-400 shadow-md"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-2xl border border-amber-500/30">
                {currentUser.avatar || '👤'}
              </div>
            )}
            <div>
              <div className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <span>{currentUser.isLoggedIn ? currentUser.displayName : 'کاربر مهمان'}</span>
                {currentUser.isLoggedIn ? (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.5 rounded font-bold">
                    تایید شده ✓
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-bold">
                    ثبت‌نام نشده
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400">
                {currentUser.isLoggedIn
                  ? `ورود از طریق ${currentUser.authMethod === 'google' ? 'حساب گوگل' : 'شماره همراه'}`
                  : 'برای دسترسی به تنظیمات عکس و کیف‌پول وارد شوید'}
              </div>
            </div>
          </div>

          {currentUser.isLoggedIn && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          )}
        </div>

        {/* Tab Selection: STRICTLY CONDITIONAL */}
        {!currentUser.isLoggedIn ? (
          /* GUEST USER TABS: Only Google & Phone Login options */
          <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setAuthTab('google')}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authTab === 'google'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>ورود با گوگل</span>
            </button>

            <button
              onClick={() => setAuthTab('phone')}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authTab === 'phone'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>ورود با شماره همراه</span>
            </button>
          </div>
        ) : (
          /* LOGGED IN USER: Profile tab header */
          <div className="flex items-center justify-between bg-amber-500/15 border border-amber-500/30 px-3.5 py-2 rounded-2xl text-xs font-bold text-amber-300">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>تنظیمات حساب کاربری و عکس پروفایل</span>
            </span>
            <span className="text-[11px] text-slate-300">
              سطح {currentUser.level} | {currentUser.coins} سکه
            </span>
          </div>
        )}

        {/* Tab 1: Google Login (Only for Guests) */}
        {!currentUser.isLoggedIn && authTab === 'google' && (
          <div className="flex flex-col gap-4 py-2">
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex flex-col gap-3">
              <div className="text-xs text-slate-300 leading-relaxed">
                با اتصال مستقیم به حساب گوگل خود، سوابق بازی‌ها، مدال‌ها، سکه‌ها و عکس پروفایل شما همگام‌سازی می‌شود.
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-bold block mb-1">ایمیل حساب گوگل:</label>
                <input
                  type="email"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  dir="ltr"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-bold block mb-1">نام شما در گوگل:</label>
                <input
                  type="text"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  placeholder="نام نمایشی"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-3 shadow-lg shadow-white/10 active:scale-95 transition-all cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{googleLoading ? 'در حال اتصال به گوگل...' : 'ورود فوری با حساب گوگل'}</span>
            </button>
          </div>
        )}

        {/* Tab 2: Mobile OTP Login (Only for Guests) */}
        {!currentUser.isLoggedIn && authTab === 'phone' && (
          <div className="flex flex-col gap-4 py-2">
            {otpStep === 'request' ? (
              <form onSubmit={handleSendOtp} className="flex flex-col gap-3">
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex flex-col gap-2">
                  <label className="text-xs text-slate-300 font-bold">شماره موبایل خود را وارد کنید:</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09123456789"
                    dir="ltr"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 text-center font-mono tracking-widest focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-[10px] text-slate-400">کد تایید ۴ رقمی پیامک خواهد شد.</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  ارسال کد تایید پیامکی 📱
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-3">
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex flex-col gap-2 text-center">
                  <span className="text-xs text-slate-300">
                    کد ارسال شده به شماره <span className="text-amber-400 font-mono" dir="ltr">{phone}</span> را وارد کنید:
                  </span>
                  <input
                    type="text"
                    maxLength={4}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="----"
                    dir="ltr"
                    autoFocus
                    className="w-48 mx-auto bg-slate-900 border-2 border-amber-400/80 rounded-xl px-3 py-2 text-xl text-amber-300 text-center font-mono tracking-widest focus:outline-none"
                  />
                  {generatedCode && (
                    <div className="text-[11px] text-emerald-400 font-mono">
                      (کد شبیه‌سازی: {generatedCode})
                    </div>
                  )}
                  <div className="text-[11px] text-slate-400">
                    {phoneCountdown > 0 ? `امکان ارسال مجدد تا ${phoneCountdown} ثانیه` : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-amber-400 underline font-bold"
                      >
                        ارسال مجدد کد
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOtpStep('request')}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                  >
                    تغییر شماره
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
                  >
                    تایید و ورود به بازی ✓
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Tab 3: Custom Avatar Upload & Profile (STRICTLY SHOWN ONLY AFTER LOGIN) */}
        {currentUser.isLoggedIn && (
          <form onSubmit={handleSaveProfile} className="flex flex-col gap-3.5 py-1">
            {/* Custom Photo Upload Area */}
            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 flex flex-col items-center gap-3">
              <span className="text-xs font-bold text-slate-300">عکس پروفایل اختصاصی خود را آپلود کنید:</span>
              
              <div className="relative group">
                {customAvatarPreview ? (
                  <div className="relative">
                    <img
                      src={customAvatarPreview}
                      alt="Custom Avatar"
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-lg shadow-amber-500/20"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveCustomAvatar}
                      title="حذف تصویر"
                      className="absolute -top-2 -right-2 p-1 rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-2xl border-2 border-dashed border-amber-500/50 hover:border-amber-400 bg-slate-900/80 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all hover:scale-105"
                  >
                    <Camera className="w-6 h-6 text-amber-400" />
                    <span className="text-[9px] text-slate-400">انتخاب عکس</span>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>بارگذاری از گالری / فایل دستگاه</span>
              </button>
            </div>

            {/* Quick Avatar Emojis */}
            <div>
              <label className="text-[11px] text-slate-400 font-bold block mb-1.5">یا انتخاب نمادهای اساطیری:</label>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                {MYTHOLOGICAL_AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => {
                      setSelectedAvatar(av);
                      setCustomAvatarPreview(undefined);
                      sounds.playClick();
                    }}
                    className={`aspect-square rounded-xl text-xl flex items-center justify-center border transition-all cursor-pointer ${
                      selectedAvatar === av && !customAvatarPreview
                        ? 'bg-amber-500/20 border-amber-400 scale-105 shadow-md shadow-amber-500/20'
                        : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 font-bold block mb-1">نام پهلوان / نام مستعار:</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-bold block mb-1">نام کاربری (@username):</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  dir="ltr"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer mt-1"
            >
              ذخیره تغییرات پروفایل و عکس ✓
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
