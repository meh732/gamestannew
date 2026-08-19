import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';

interface LawRulesViewProps {
  onBack?: () => void;
}

interface GameRuleItem {
  id: string;
  title: string;
  icon: string;
  rules: string[];
}

const GAME_RULES: GameRuleItem[] = [
  {
    id: 'chess',
    title: 'قوانین رسمی شطرنج هوشمند (Chess)',
    icon: '♟️',
    rules: [
      'هدف بازی مات کردن شاه حریف است به‌نحوی که شاه زیر ضربه باشد و هیچ راه گریزی نداشته باشد.',
      'حرکت پیاده: در حرکت اول ۱ یا ۲ خانه رو به جلو، در ادامه ۱ خانه و ضربه زدن به صورت مورب.',
      'ارتقای پیاده (Promotion): پیاده با رسیدن به آخرین عرض زمین به وزیر، رخ، فیل یا اسب تبدیل می‌شود.',
      'حرکت اسب: به صورت حرف L انگلیسی (دو خانه مستقیم و یک خانه عمود) با قابلیت جهش از روی سایر مهره‌ها.',
      'کیش و رفع کیش: اگر شاه در معرض خطر باشد، بازیکن موظف است در همان نوبت کیش را رفع کند.',
      'پات (Stalemate): اگر بازیکنی در نوبت خود هیچ حرکت قانونی نداشته باشد و شاه او در کیش نباشد، بازی مساوی است.',
    ],
  },
  {
    id: 'othello',
    title: 'قوانین رسمی اتللو / ریورسی (Othello)',
    icon: '⚪',
    rules: [
      'بازی بر روی یک صفحه ۸ در ۸ با دیسک‌های دورو (سیاه و سفید) انجام می‌شود. سیاه آغازگر بازی است.',
      'قاعده محاصره: در هر حرکت، بازیکن باید مهره خود را به شکلی قرار دهد که یک یا چند مهره حریف بین مهره جدید و مهره‌های قبلی وی در یکی از جهت‌های هشت‌گانه محصور شوند.',
      'چرخش مهره‌ها: تمامی مهره‌های محاصره‌شده حریف به رنگ بازیکن درمی‌آیند.',
      'رد شدن نوبت (Pass): اگر بازیکنی هیچ حرکت مجازی برای چرخش مهره حریف نداشته باشد، نوبت او رد می‌شود.',
      'پایان بازی: زمانی که صفحه پر شود یا هیچ بازیکنی امکان حرکت نداشته باشد، بازیکنی که بیشترین مهره را دارد برنده است.',
    ],
  },
  {
    id: 'sudoku',
    title: 'قوانین جدول سودوکو (Sudoku)',
    icon: '🔢',
    rules: [
      'جدول ۹ در ۹ از ۹ بلوک ۳ در ۳ تشکیل شده است.',
      'قانون سطرها: در هر سطر افقی، اعداد ۱ تا ۹ بدون تکرار قرار می‌گیرند.',
      'قانون ستون‌ها: در هر ستون عمودی، اعداد ۱ تا ۹ بدون تکرار قرار می‌گیرند.',
      'قانون بلوک‌ها: در هر بلوک ۳ در ۳، اعداد ۱ تا ۹ بدون تکرار قرار می‌گیرند.',
      'محدودیت خطا: حداکثر ۳ خطای مجاز در مسابقات رتبه‌بندی شده قبل از اتمام فرصت وجود دارد.',
    ],
  },
  {
    id: 'ludo',
    title: 'قوانین منچ و لوردیو ۳D (Ludo Lordio)',
    icon: '🎲',
    rules: [
      'برای خروج مهره از پایگاه اولیه نیاز به آوردن تاس ۶ است.',
      'جایزه تاس ۶: آوردن ۶ به بازیکن یک پرتاب مجدد تاس پاداش می‌دهد.',
      'زدن مهره حریف: اگر مهره شما دقیقاً روی خانه حریف فرود آید، مهره حریف سوخته و به پایگاه بازمی‌گردد.',
      'خط پایان: بازیکنی که بتواند تمام مسیر ۲۰ پله‌ای را طی کرده و وارد خانه امن و کاپ شود برنده است.',
    ],
  },
  {
    id: 'quiz',
    title: 'قوانین کوئیز اطلاعات عمومی (AI Quiz)',
    icon: '🧠',
    rules: [
      'هر سوال دارای تایمر ۱۵ ثانیه‌ای است؛ هر چه سریع‌تر پاسخ دهید، امتیاز سرعت بالاتری کسب می‌کنید.',
      'پاسخ‌های زنجیره‌ای متوالی صحیح (Streak) ضریب امتیاز را تا ۲ برابر افزایش می‌دهد.',
      'پاسخ غلط یا اتمام زمان منجر به صفر شدن زنجیره امتیاز خواهد شد.',
    ],
  },
  {
    id: 'wordle',
    title: 'قوانین حدس کلمه فارسی (Wordle)',
    icon: '🔤',
    rules: [
      'هدف، حدس زدن یک کلمه ۵ حرفی معتبر فارسی در ۶ فرصت است.',
      'رنگ سبز: حرف در کلمه وجود دارد و جایگاه آن کاملاً درست است.',
      'رنگ زرد: حرف در کلمه وجود دارد اما در این موقعیت نیست.',
      'رنگ خاکستری: حرف به هیچ وجه در کلمه پنهان وجود ندارد.',
    ],
  },
];

export const LawRulesView: React.FC<LawRulesViewProps> = ({ onBack }) => {
  const [openSection, setOpenSection] = useState<string | null>('chess');

  return (
    <div className="w-full max-w-4xl mx-auto p-3 sm:p-5 flex flex-col gap-5 text-slate-100 font-['Vazirmatn']">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-3xl shadow-md shadow-amber-500/20">
            📜
          </div>
          <div>
            <h1 className="text-xl font-black text-amber-300">مرام‌نامه و قوانین بازی‌های گیمستان</h1>
            <p className="text-xs text-slate-400">قوانین استاندارد بین‌المللی و ساختار فنی بازی‌ها</p>
          </div>
        </div>

        {onBack && (
          <button
            id="rules-back-btn"
            onClick={onBack}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
          >
            بازگشت
          </button>
        )}
      </div>

      {/* Accordion Rules List */}
      <div className="flex flex-col gap-3">
        {GAME_RULES.map((item) => {
          const isOpen = openSection === item.id;
          return (
            <div
              key={item.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-md transition-all"
            >
              <button
                id={`rules-toggle-${item.id}`}
                onClick={() => setOpenSection(isOpen ? null : item.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors text-right"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-sm sm:text-base font-bold text-slate-100">{item.title}</span>
                </div>
                {isOpen ? <ChevronUp className="w-5 h-5 text-amber-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </button>

              {isOpen && (
                <div className="p-4 pt-0 border-t border-slate-800/80 bg-slate-950/40">
                  <ul className="flex flex-col gap-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed pr-2 pt-3">
                    {item.rules.map((rule, rIdx) => (
                      <li key={rIdx} className="flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
