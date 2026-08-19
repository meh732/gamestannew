# 👑 کاخ اساطیری گیمستان (GameStan Platform)

پلتفرم یکپارچه بازی‌های ایرانی و اساطیری با طراحی فوق‌العاده مدرن، دارای دو نمای وب‌سایت دسکتاپ و اپلیکیشن اندروید/موبایل (PWA) با قابلیت نصب مستقیم و اجرای آفلاین و آنلاین.

---

## 🚀 راهنمای نصب خودکار و مدیریت روی سرور لینوکس (Linux CLI)

اسکریپت مدیریت و نصب خودکار `install.sh` تمام نیازمندی‌ها (Node.js 20 LTS، Nginx، Certbot SSL، سرویس پس‌زمینه Systemd و پشتیبان‌گیری) را به صورت کامل و تعاملی پیکربندی می‌کند.

### ⚡ دستور تک‌خطی اجرای منوی نصب و مدیریت در لینوکس:

```bash
bash <(curl -sSL https://raw.githubusercontent.com/meh732/gamestannew/main/install.sh)
```

یا با استفاده از Git:

```bash
git clone https://github.com/meh732/gamestannew.git
cd gamestannew
sudo bash install.sh
```

---

## 🛠️ گزینه‌های منوی مدیریت لینوکس (`install.sh`):

1. **🚀 Install GameStan**:
   - درخواست پورت دلخواه (پیش‌فرض: `3000`)
   - درخواست نام دامنه (Domain) یا IP سرور
   - راه‌اندازی گواهی امنیتی رایگان SSL (Let's Encrypt / Certbot)
   - پرسش درباره بازگردانی بکاپ موجود قبل از راه‌اندازی
   - پیکربندی خودکار Nginx Reverse Proxy
   - ایجاد و اجرای سرویس سیستمی `gamestan.service` جهت فعال‌ماندن همیشگی و اجرای خودکار پس از ریبوت سرور

2. **🔄 Update GameStan**:
   - **پشتیبان‌گیری خودکار (Auto-Backup)** از کلیه فایل‌ها قبل از شروع آپدیت در مسیر `/var/backups/gamestan/`
   - دریافت آخرین تغییرات از ریپازیتوری `https://github.com/meh732/gamestannew.git`
   - بیلد مجدد و ری‌استارت سریع سرویس

3. **🗑️ Uninstall GameStan**:
   - **پشتیبان‌گیری خودکار (Auto-Backup)** قبل از حذف جهت جلوگیری از دست رفتن داده‌ها
   - توقف و حذف سرویس Systemd و کانفیگ Nginx
   - پاکسازی کامل فایل‌های برنامه

4. **📦 Create Backup Now**:
   - ایجاد آنی فایل فشرده `.tar.gz` از وضعیت فعلی برنامه در `/var/backups/gamestan/`

5. **⏪ Restore from Backup**:
   - مشاهده لیست فایل‌های بکاپ موجود و بازگردانی سریع به نسخه قبلی

6. **📊 Service Status & Logs**:
   - بررسی وضعیت زنده سرویس و مشاهده ۵۰ خط آخر لاگ‌های سرور

7. **♻️ Restart GameStan Service**:
   - راه‌اندازی مجدد سرویس سیستم

---

## 📱 دستورات مفید سیستمی:

```bash
# بررسی وضعیت سرویس
sudo systemctl status gamestan

# مشاهده لاگ‌های زنده
sudo journalctl -u gamestan -f

# ری‌استارت سرویس
sudo systemctl restart gamestan
```
