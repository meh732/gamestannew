import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../../types';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';
import {
  X,
  Mail,
  Lock,
  User,
  UserPlus,
  LogIn,
  CheckCircle2,
  AlertCircle,
  Camera,
  LogOut,
  Sparkles,
  Coins,
  Gem,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
}

interface StoredAccount {
  email: string;
  passwordHash: string;
  displayName: string;
  avatar: string;
  customAvatarUrl?: string;
  coins: number;
  gems: number;
  createdAt: string;
}

const MYTHOLOGICAL_AVATARS = ['👑', '🦁', '🦅', '⚔️', '💎', '🧙‍♂️', '🎯', '🌸', '🚀', '🧠'];
const LOCAL_STORAGE_KEY = 'gamestan_registered_accounts_v1';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
}) => {
  // Mode: 'register' | 'login' | 'profile'
  const [mode, setMode] = useState<'register' | 'login' | 'profile'>(
    currentUser.isLoggedIn ? 'profile' : 'register'
  );

  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAvatar, setRegAvatar] = useState('👑');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Profile Edit State
  const [editName, setEditName] = useState(currentUser.displayName);
  const [editAvatar, setEditAvatar] = useState(currentUser.avatar);
  const [customAvatarPreview, setCustomAvatarPreview] = useState<string | undefined>(
    currentUser.customAvatarUrl
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser.isLoggedIn) {
      setMode('profile');
      setEditName(currentUser.displayName);
      setEditAvatar(currentUser.avatar);
      setCustomAvatarPreview(currentUser.customAvatarUrl);
    } else {
      if (mode === 'profile') setMode('login');
    }
  }, [currentUser.isLoggedIn, currentUser]);

  if (!isOpen) return null;

  const getRegisteredAccounts = (): StoredAccount[] => {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const saveRegisteredAccounts = (accounts: StoredAccount[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(accounts));
    } catch {
      // Storage fallback
    }
  };

  const notifySuccess = (msg: string) => {
    setErrorMsg(null);
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const notifyError = (msg: string) => {
    setSuccessMsg(null);
    setErrorMsg(msg);
    sounds.playError();
    setTimeout(() => setErrorMsg(null), 4000);
  };

  // 1. Real Registration Flow
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const name = regName.trim();
    const email = regEmail.trim().toLowerCase();
    const password = regPassword;

    if (!name) {
      notifyError('لطفاً نام یا نام مستعار خود را وارد کنید.');
      return;
    }
    if (!email || !email.includes('@') || !email.includes('.')) {
      notifyError('لطفاً یک آدرس ایمیل معتبر وارد نمایید.');
      return;
    }
    if (password.length < 4) {
      notifyError('رمز عبور باید حداقل ۴ کاراکتر باشد.');
      return;
    }
    if (password !== regConfirmPassword) {
      notifyError('رمز عبور با تکرار آن مطابقت ندارد.');
      return;
    }

    setLoading(true);
    sounds.playClick();

    setTimeout(() => {
      const accounts = getRegisteredAccounts();
      const existing = accounts.find((a) => a.email === email);

      if (existing) {
        setLoading(false);
        notifyError('این آدرس ایمیل قبلاً در سیستم ثبت‌نام شده است! لطفاً وارد شوید.');
        setMode('login');
        setLoginEmail(email);
        return;
      }

      // Create new real account
      const newAccount: StoredAccount = {
        email,
        passwordHash: password, // client credential
        displayName: name,
        avatar: regAvatar,
        coins: 1000, // 1,000 Welcome Bonus Coins
        gems: 30, // 30 Welcome Gems
        createdAt: new Date().toISOString(),
      };

      accounts.push(newAccount);
      saveRegisteredAccounts(accounts);

      // Log in user
      onUpdateUser({
        isLoggedIn: true,
        email: email,
        displayName: name,
        avatar: regAvatar,
        coins: (currentUser.coins || 0) + 1000,
        gems: (currentUser.gems || 0) + 30,
        authMethod: 'email',
      });

      setLoading(false);
      sounds.playWin();
      confetti({ particleCount: 100, spread: 80 });
      notifySuccess(`ثبت‌نام با موفقیت انجام شد! ۱,۰۰۰ سکه هدیه به حسابتان اضافه شد.`);
      setMode('profile');
    }, 600);
  };

  // 2. Real Login Flow
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const email = loginEmail.trim().toLowerCase();
    const password = loginPassword;

    if (!email || !email.includes('@')) {
      notifyError('لطفاً ایمیل حساب کاربری خود را وارد کنید.');
      return;
    }
    if (!password) {
      notifyError('لطفاً رمز عبور خود را وارد کنید.');
      return;
    }

    setLoading(true);
    sounds.playClick();

    setTimeout(() => {
      const accounts = getRegisteredAccounts();
      const account = accounts.find((a) => a.email === email);

      if (!account) {
        setLoading(false);
        notifyError('حسابی با این ایمیل یافت نشد. ابتدا ثبت‌نام کنید.');
        return;
      }

      if (account.passwordHash !== password) {
        setLoading(false);
        notifyError('رمز عبور وارد شده نادرست است.');
        return;
      }

      // Successful Login
      onUpdateUser({
        isLoggedIn: true,
        email: account.email,
        displayName: account.displayName,
        avatar: account.avatar,
        customAvatarUrl: account.customAvatarUrl,
        coins: account.coins > 0 ? account.coins : currentUser.coins,
        gems: account.gems > 0 ? account.gems : currentUser.gems,
        authMethod: 'email',
      });

      setLoading(false);
      sounds.playWin();
      confetti({ particleCount: 60, spread: 60 });
      notifySuccess(`خوش آمدید، ${account.displayName}! ورود با موفقیت انجام شد.`);
      setMode('profile');
    }, 500);
  };

  // 3. Save Profile Changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const name = editName.trim();
    if (!name) {
      notifyError('نام نمایشی نمی‌تواند خالی باشد.');
      return;
    }

    onUpdateUser({
      displayName: name,
      avatar: editAvatar,
      customAvatarUrl: customAvatarPreview,
    });

    // Update in local accounts database as well
    if (currentUser.email) {
      const accounts = getRegisteredAccounts();
      const updated = accounts.map((a) =>
        a.email === currentUser.email
          ? {
              ...a,
              displayName: name,
              avatar: editAvatar,
              customAvatarUrl: customAvatarPreview,
            }
          : a
      );
      saveRegisteredAccounts(updated);
    }

    sounds.playWin();
    notifySuccess('اطلاعات حساب کاربری با موفقیت بروزرسانی شد.');
  };

  // 4. Log Out
  const handleLogout = () => {
    sounds.playClick();
    onUpdateUser({
      isLoggedIn: false,
      email: undefined,
      displayName: 'کاربر مهمان',
      avatar: '👤',
      customAvatarUrl: undefined,
      authMethod: 'guest',
    });
    setMode('login');
    notifySuccess('از حساب کاربری خود خارج شدید.');
  };

  // Upload Custom Avatar
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      notifyError('حجم تصویر نباید بیشتر از ۳ مگابایت باشد.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      setCustomAvatarPreview(res);
      notifySuccess('تصویر با موفقیت انتخاب شد. دکمه ذخیره را بزنید.');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-xs font-['Vazirmatn'] text-slate-100 select-none animate-fadeIn">
      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-[#140e08] border-2 border-[#c29b38] rounded-3xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.9),inset_0_1px_2px_rgba(245,158,11,0.3)] flex flex-col gap-4 overflow-hidden max-h-[92vh] overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#a37c2c]/40 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#c29b38] to-[#785928] flex items-center justify-center text-slate-950 font-black shadow-md">
              👑
            </div>
            <div>
              <h3 className="text-base font-black text-[#f5d996]">
                {mode === 'profile'
                  ? 'پروفایل و حساب کاربری'
                  : mode === 'register'
                  ? 'ثبت‌نام رسمی در گیمستان'
                  : 'ورود به حساب کاربری'}
              </h3>
              <p className="text-[10px] text-[#bfa472]">
                سامانه اختصاصی اعضای باشگاه گیمستان
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#24170a] hover:bg-[#3d2a13] border border-[#785928] text-[#f5d996] cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher (When not in Profile mode) */}
        {mode !== 'profile' && (
          <div className="grid grid-cols-2 gap-2 bg-[#0a0704] p-1 rounded-2xl border border-[#785928]">
            <button
              onClick={() => {
                sounds.playClick();
                setMode('register');
                setErrorMsg(null);
              }}
              className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-[#c29b38] to-[#f59e0b] text-slate-950 shadow-md'
                  : 'text-[#bfa472] hover:text-[#f5d996]'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>ثبت‌نام جدید</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setMode('login');
                setErrorMsg(null);
              }}
              className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-[#c29b38] to-[#f59e0b] text-slate-950 shadow-md'
                  : 'text-[#bfa472] hover:text-[#f5d996]'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>ورود اعضا</span>
            </button>
          </div>
        )}

        {/* Toast / Alert Feedback */}
        {errorMsg && (
          <div className="bg-rose-950/80 border border-rose-500/70 p-2.5 rounded-xl flex items-center gap-2 text-xs text-rose-200 shadow-md animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-950/80 border border-emerald-500/70 p-2.5 rounded-xl flex items-center gap-2 text-xs text-emerald-200 shadow-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="flex flex-col gap-3">
            {/* Nickname */}
            <div>
              <label className="text-[11px] font-bold text-[#f5d996] block mb-1">
                نام نمایشی / مستعار:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="مثال: رستم دستان"
                  className="w-full bg-[#1c130a] border border-[#a37c2c] rounded-xl px-3 py-2 pr-9 text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-[#fbbf24]"
                />
                <User className="w-4 h-4 text-[#a37c2c] absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-[11px] font-bold text-[#f5d996] block mb-1">
                آدرس ایمیل:
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#1c130a] border border-[#a37c2c] rounded-xl px-3 py-2 pr-9 text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-[#fbbf24] text-left ltr"
                />
                <Mail className="w-4 h-4 text-[#a37c2c] absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-[11px] font-bold text-[#f5d996] block mb-1">
                رمز عبور:
              </label>
              <div className="relative">
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="حداقل ۴ کاراکتر"
                  className="w-full bg-[#1c130a] border border-[#a37c2c] rounded-xl px-3 py-2 pr-9 pl-9 text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-[#fbbf24] text-left ltr"
                />
                <Lock className="w-4 h-4 text-[#a37c2c] absolute right-2.5 top-2.5 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute left-2.5 top-2.5 text-stone-400 hover:text-stone-200"
                >
                  {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-[11px] font-bold text-[#f5d996] block mb-1">
                تکرار رمز عبور:
              </label>
              <div className="relative">
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="تکرار رمز عبور"
                  className="w-full bg-[#1c130a] border border-[#a37c2c] rounded-xl px-3 py-2 pr-9 text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-[#fbbf24] text-left ltr"
                />
                <ShieldCheck className="w-4 h-4 text-[#a37c2c] absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Choose Avatar */}
            <div>
              <label className="text-[11px] font-bold text-[#f5d996] block mb-1">
                انتخاب آواتار شوالیه:
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-[#0a0704] rounded-xl border border-[#785928]">
                {MYTHOLOGICAL_AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setRegAvatar(av);
                    }}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all shrink-0 cursor-pointer ${
                      regAvatar === av
                        ? 'bg-[#c29b38] text-slate-950 scale-110 shadow-md ring-2 ring-[#fbbf24]'
                        : 'bg-[#1c130a] hover:bg-[#2e2010]'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Gift Badge */}
            <div className="bg-[#24170a] border border-[#c29b38]/60 p-2 rounded-xl flex items-center justify-between text-xs">
              <span className="text-[#f5d996] font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#fbbf24]" />
                جایزه ورود اولیه:
              </span>
              <span className="font-mono font-black text-[#fbbf24]">
                + ۱,۰۰۰ سکه طلا 🪙
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#c29b38] via-[#f59e0b] to-[#c29b38] hover:from-[#d4af37] hover:to-[#fbbf24] text-slate-950 font-black text-sm transition-all shadow-[0_4px_15px_rgba(245,158,11,0.4)] active:scale-95 cursor-pointer flex items-center justify-center gap-2 mt-1"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'در حال ثبت حساب...' : 'ثبت‌نام و ورود به بازی‌ها'}</span>
            </button>
          </form>
        )}

        {/* 2. LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            {/* Email */}
            <div>
              <label className="text-[11px] font-bold text-[#f5d996] block mb-1">
                ایمیل ثبت‌شده:
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#1c130a] border border-[#a37c2c] rounded-xl px-3 py-2 pr-9 text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-[#fbbf24] text-left ltr"
                />
                <Mail className="w-4 h-4 text-[#a37c2c] absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-[11px] font-bold text-[#f5d996] block mb-1">
                رمز عبور:
              </label>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="رمز عبور شما"
                  className="w-full bg-[#1c130a] border border-[#a37c2c] rounded-xl px-3 py-2 pr-9 pl-9 text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-[#fbbf24] text-left ltr"
                />
                <Lock className="w-4 h-4 text-[#a37c2c] absolute right-2.5 top-2.5 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute left-2.5 top-2.5 text-stone-400 hover:text-stone-200"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#c29b38] via-[#f59e0b] to-[#c29b38] hover:from-[#d4af37] hover:to-[#fbbf24] text-slate-950 font-black text-sm transition-all shadow-[0_4px_15px_rgba(245,158,11,0.4)] active:scale-95 cursor-pointer flex items-center justify-center gap-2 mt-1"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'در حال تایید...' : 'ورود به حساب کاربری'}</span>
            </button>
          </form>
        )}

        {/* 3. PROFILE DASHBOARD (When Logged in) */}
        {mode === 'profile' && (
          <div className="flex flex-col gap-3.5">
            {/* User Stats Card */}
            <div className="bg-[#1c130a] border border-[#c29b38] rounded-2xl p-3 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  {currentUser.customAvatarUrl ? (
                    <img
                      src={currentUser.customAvatarUrl}
                      alt={currentUser.displayName}
                      className="w-12 h-12 rounded-xl object-cover border border-[#c29b38]"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#2e2010] border border-[#c29b38] flex items-center justify-center text-2xl">
                      {currentUser.avatar}
                    </div>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    title="تغییر عکس"
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#f59e0b] text-slate-950 flex items-center justify-center shadow-md cursor-pointer hover:scale-110 transition-transform"
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                <div>
                  <h4 className="text-sm font-black text-[#f5d996]">
                    {currentUser.displayName}
                  </h4>
                  <span className="text-[10px] text-[#bfa472] font-mono">
                    {currentUser.email || 'حساب کاربری گیمستان'}
                  </span>
                </div>
              </div>

              {/* Coins & Gems */}
              <div className="flex flex-col items-end gap-1 font-mono text-xs font-black">
                <span className="text-amber-300 flex items-center gap-1 bg-[#24170a] px-2 py-0.5 rounded-lg border border-[#785928]">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  {currentUser.coins.toLocaleString('fa-IR')}
                </span>
                <span className="text-purple-300 flex items-center gap-1 bg-[#24170a] px-2 py-0.5 rounded-lg border border-[#785928]">
                  <Gem className="w-3.5 h-3.5 text-purple-400" />
                  {currentUser.gems.toLocaleString('fa-IR')}
                </span>
              </div>
            </div>

            {/* Edit Name Form */}
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-[#f5d996] block mb-1">
                  ویرایش نام نمایشی:
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#1c130a] border border-[#a37c2c] rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-[#fbbf24]"
                />
              </div>

              {/* Avatar Picker */}
              <div>
                <label className="text-[11px] font-bold text-[#f5d996] block mb-1">
                  تغییر نشان آواتار:
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-[#0a0704] rounded-xl border border-[#785928]">
                  {MYTHOLOGICAL_AVATARS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setEditAvatar(av);
                        setCustomAvatarPreview(undefined);
                      }}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all shrink-0 cursor-pointer ${
                        editAvatar === av && !customAvatarPreview
                          ? 'bg-[#c29b38] text-slate-950 scale-110 shadow-md ring-2 ring-[#fbbf24]'
                          : 'bg-[#1c130a] hover:bg-[#2e2010]'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="submit"
                  className="py-2.5 rounded-xl bg-gradient-to-r from-[#c29b38] to-[#f59e0b] text-slate-950 font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  ذخیره تغییرات
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/60 text-rose-200 font-black text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>خروج از حساب</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
