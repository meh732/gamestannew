export const PERSIAN_WORDS_5 = [
  'پرواز',
  'آفتاب',
  'باران',
  'سایه',
  'مهتاب',
  'ستاره',
  'پروانه',
  'گلستان',
  'شمشیر',
  'خاطره',
  'لبخند',
  'آهنگر',
  'جنگجو',
  'فرهنگ',
  'سیمرغ',
  'رستم',
  'دماوند',
  'زاگرس',
  'کارون',
  'پردیس',
  'دریچه',
  'فانوس',
  'گوهر',
  'الماس',
  'یاقوت',
  'زمرد',
  'کهربا',
  'طاووس',
  'عقاب',
  'شاهین',
  'توفان',
  'نسیم',
  'دریا',
  'ساحل',
  'مروارید',
  'سفیر',
  'نگین',
  'سرور',
  'امید',
  'شادی',
  'پیروز',
  'آزادی',
  'ایران',
  'تهران',
  'شیراز',
  'تبریز',
  'اصفهان',
  'مشهد',
  'یزدان',
  'سروش',
  'خسرو',
  'آرش',
  'سهراب',
  'کوروش',
  'داریوش',
  'فریاد',
  'آواز',
  'سازش',
  'پیمان',
  'میهن',
  'جهان',
  'کیهان',
  'سپهر',
  'خورشید',
  'فردا',
  'امروز',
  'دیروز',
  'سحرگاه',
  'غروب',
  'طلوع',
];

// Normalize persian strings for comparison
export function normalizePersian(str: string): string {
  return str
    .trim()
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ة/g, 'ه')
    .replace(/[\u200B-\u200D\uFEFF]/g, '');
}

export function getRandomWord(): string {
  const fiveLetterWords = PERSIAN_WORDS_5.filter((w) => normalizePersian(w).length === 5);
  return fiveLetterWords[Math.floor(Math.random() * fiveLetterWords.length)] || 'پرواز';
}

export function evaluateWordleGuess(
  guess: string,
  target: string
): ('correct' | 'present' | 'absent')[] {
  const normGuess = normalizePersian(guess);
  const normTarget = normalizePersian(target);
  const result: ('correct' | 'present' | 'absent')[] = Array(5).fill('absent');

  const targetChars = normTarget.split('');
  const guessChars = normGuess.split('');
  const targetUsed = Array(5).fill(false);

  // First pass: correct positions
  for (let i = 0; i < 5; i++) {
    if (guessChars[i] === targetChars[i]) {
      result[i] = 'correct';
      targetUsed[i] = true;
    }
  }

  // Second pass: present in wrong position
  for (let i = 0; i < 5; i++) {
    if (result[i] !== 'correct') {
      const char = guessChars[i];
      const foundIdx = targetChars.findIndex((c, idx) => c === char && !targetUsed[idx]);
      if (foundIdx !== -1) {
        result[i] = 'present';
        targetUsed[foundIdx] = true;
      }
    }
  }

  return result;
}

export const PERSIAN_KEYBOARD_ROWS = [
  ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'چ'],
  ['ش', 'س', 'ی', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ک', 'گ'],
  ['ظ', 'ط', 'ز', 'ر', 'ذ', 'د', 'پ', 'و'],
];
