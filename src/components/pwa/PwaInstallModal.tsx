import React, { useState, useEffect } from 'react';
import { Download, Smartphone, CheckCircle, Share2, PlusSquare, X, Monitor, Shield } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if running as standalone PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    sounds.playClick();
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        sounds.playWin();
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-['Vazirmatn'] text-slate-100">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/30">
            👑
          </div>
          <div>
            <h2 className="text-lg font-black text-amber-300">نصب اپلیکیشن گیمستان (PWA)</h2>
            <p className="text-xs text-slate-400">تجربه سریع، بدون افت فریم و بدون نیاز به دانلود از بازار</p>
          </div>
        </div>

        {/* Benefits List */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-2.5 text-xs">
          <div className="flex items-center gap-2 text-slate-200">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>نصب فوق‌سریع در ۲ ثانیه (کمتر از ۱ مگابایت حجم)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>اجرای تمام‌صفحه و روان بدون نوار مرورگر دقیقاً شبیه اپلیکیشن اندروید</span>
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>عملکرد آفلاین و بدون قطعی در بازی‌های تک‌نفره و هوش مصنوعی</span>
          </div>
        </div>

        {/* Action button based on platform */}
        {isInstalled ? (
          <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-center flex flex-col items-center gap-2">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
            <span className="text-sm font-bold text-emerald-300">اپلیکیشن گیمستان با موفقیت روی دستگاه شما نصب است!</span>
          </div>
        ) : deferredPrompt ? (
          <button
            onClick={handleInstallClick}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
          >
            <Download className="w-5 h-5" />
            <span>نصب مستقیم اپلیکیشن روی دستگاه ⚡</span>
          </button>
        ) : isIOS ? (
          /* iOS Guide */
          <div className="bg-slate-800/80 border border-amber-500/30 rounded-2xl p-4 flex flex-col gap-3 text-xs">
            <span className="font-bold text-amber-300">راهنمای نصب در آیفون / آیپد (Safari):</span>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[10px]">۱</span>
              <span>در پایین مرورگر سافاری روی دکمه <Share2 className="inline w-3.5 h-3.5 text-sky-400" /> (Share) بزنید.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[10px]">۲</span>
              <span>گزینه <PlusSquare className="inline w-3.5 h-3.5 text-amber-400" /> <b>Add to Home Screen</b> را انتخاب کنید.</span>
            </div>
          </div>
        ) : (
          /* Android / Desktop Chrome Fallback Guide */
          <div className="bg-slate-800/80 border border-amber-500/30 rounded-2xl p-4 flex flex-col gap-2.5 text-xs">
            <span className="font-bold text-amber-300">راهنمای افزودن به صفحه اصلی:</span>
            <p className="text-slate-300 leading-relaxed">
              روی علامت ۳ نقطه مرورگر (⋮) در بالا یا پایین ضربه بزنید و گزینه <b>«افزودن به صفحه اصلی» (Add to Home screen)</b> یا <b>«نصب برنامه» (Install App)</b> را بزنید.
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
        >
          بستن و ادامه در وب‌سایت
        </button>
      </div>
    </div>
  );
};
