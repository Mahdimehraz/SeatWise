# راهنمای نصب Tailwind CSS

## نصب وابستگی‌ها

```bash
cd frontend
npm install
```

این دستور به صورت خودکار Tailwind CSS، PostCSS و Autoprefixer را نصب می‌کند.

## ساختار Tailwind

- **tailwind.config.js**: تنظیمات Tailwind
- **postcss.config.js**: تنظیمات PostCSS
- **app/globals.css**: استایل‌های اصلی با Tailwind directives

## استفاده

تمام استایل‌ها با کلاس‌های Tailwind نوشته شده‌اند. دیگر نیازی به فایل‌های CSS module نیست.

### کلاس‌های سفارشی

کلاس‌های سفارشی در `globals.css` تعریف شده‌اند:
- `.btn` - دکمه‌های پایه
- `.btn-primary` - دکمه اصلی
- `.btn-secondary` - دکمه ثانویه
- `.btn-danger` - دکمه خطر
- `.form-group` - گروه فرم
- `.card` - کارت
- `.error-message` - پیام خطا
- `.success-message` - پیام موفقیت
- `.loading` - حالت بارگذاری

## اجرا

```bash
npm run dev
```

Tailwind به صورت خودکار استایل‌ها را تولید می‌کند.

