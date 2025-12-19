/**
 * تبدیل اعداد انگلیسی به فارسی
 */
export function toPersianNumber(num: number | string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  let numStr = num.toString();
  
  // تبدیل هر رقم انگلیسی به فارسی
  for (let i = 0; i < englishDigits.length; i++) {
    numStr = numStr.replace(new RegExp(englishDigits[i], 'g'), persianDigits[i]);
  }
  
  return numStr;
}

/**
 * فرمت کردن عدد با جداکننده هزارگان و تبدیل به فارسی
 */
export function formatPersianNumber(num: number | string): string {
  const numValue = typeof num === 'string' ? parseFloat(num) : num;
  const formatted = numValue.toLocaleString('en-US');
  return toPersianNumber(formatted);
}

/**
 * تبدیل زمان به فرمت HH:MM (حذف ثانیه)
 */
export function formatTime(time: string): string {
  if (!time) return '';
  // اگر زمان به صورت HH:MM:SS باشد، فقط HH:MM را برمی‌گرداند
  return time.split(':').slice(0, 2).join(':');
}

