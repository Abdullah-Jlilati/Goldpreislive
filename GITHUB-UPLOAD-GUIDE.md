# 🚀 دليل رفع التعديلات إلى GitHub

## الطريقة الأسهل: GitHub Desktop

### 1. تحميل GitHub Desktop

- اذهب إلى: https://desktop.github.com/
- حمّل وثبّت البرنامج

### 2. تسجيل الدخول

- افتح GitHub Desktop
- سجل دخول بحسابك GitHub

### 3. Clone Repository

- File → Clone Repository
- اختر: `Abdullah-Jlilati/Goldpreislive`
- اختر مجلد مؤقت (مثل: `d:\Goldpreislive-temp`)
- اضغط Clone

### 4. نسخ التعديلات

- انسخ جميع الملفات من `d:\Goldpreislive.com`
- الصقها في المجلد المستنسخ `d:\Goldpreislive-temp`
- استبدل الملفات القديمة

### 5. Commit & Push

في GitHub Desktop:

- سترى قائمة التغييرات
- في Summary اكتب: "Added shimmer effect and final improvements"
- اضغط **Commit to main**
- اضغط **Push origin**

✅ **تم! التعديلات الآن على GitHub والموقع سيتحدث تلقائياً**

---

## الطريقة الثانية: Git CLI (يحتاج تثبيت)

### 1. تثبيت Git

- حمّل من: https://git-scm.com/download/win
- ثبّت بالإعدادات الافتراضية
- أعد تشغيل PowerShell

### 2. إعداد Git (أول مرة فقط)

```powershell
git config --global user.name "Abdullah Jlilati"
git config --global user.email "your-email@example.com"
```

### 3. في مجلد الموقع (d:\Goldpreislive.com)

```powershell
# تهيئة Git (إذا لم يكن مهيأ)
git init

# إضافة Remote
git remote add origin https://github.com/Abdullah-Jlilati/Goldpreislive.git

# إضافة جميع الملفات
git add .

# Commit
git commit -m "Added shimmer effect - final improvements v3.0"

# Push
git branch -M main
git push -u origin main --force
```

⚠️ **ملاحظة:** --force سيستبدل كل شيء على GitHub بالملفات المحلية

---

## الطريقة الثالثة: VS Code (إذا كان لديك)

### 1. افتح المجلد في VS Code

- File → Open Folder → `d:\Goldpreislive.com`

### 2. في Source Control (Ctrl+Shift+G)

- اضغط **Initialize Repository**
- اكتب commit message: "Shimmer effect update"
- اضغط ✓ Commit
- اضغط **...** → Push

---

## الطريقة الرابعة: رفع مباشر من GitHub

### 1. اذهب إلى Repository

https://github.com/Abdullah-Jlilati/Goldpreislive

### 2. طريقة أ: استبدال ملفات فردية

- افتح الملف المراد تحديثه (مثل: css/styles.css)
- اضغط أيقونة القلم (Edit)
- الصق المحتوى الجديد
- Commit changes

### 3. طريقة ب: حذف واستبدال كامل

- احذف جميع الملفات القديمة
- اضغط **Upload files**
- اسحب جميع الملفات من `d:\Goldpreislive.com`
- Commit changes

---

## 📋 الملفات الرئيسية المحدثة

هذه الملفات تحتاج رفع:

### 1. CSS (الأهم):

- ✅ `css/styles.css` - تأثير Shimmer

### 2. JavaScript:

- ✅ `js/app.js` - رموز العملات صحيحة

### 3. HTML (إذا عدلتها):

- ✅ `de/index.html`
- ✅ `en/index.html`
- ✅ `ar/index.html`

### 4. التوثيق:

- ✅ `README-FINAL.md`
- ✅ `SEO-GUIDE.md`

---

## ⚡ الطريقة الأسرع (موصى بها):

**استخدم GitHub Desktop** - الأسهل والأسرع بدون أوامر!

1. حمّل من: https://desktop.github.com/
2. Clone repository
3. انسخ الملفات
4. Commit & Push

**وقت التنفيذ:** 5 دقائق فقط!

---

## ✅ بعد الرفع

الموقع سيتحدث تلقائياً على:

- **GitHub Pages:** https://abdullah-jlilati.github.io/Goldpreislive/
- **Domain الخاص:** https://goldpreislive.com (إذا كان مربوط)

**وقت التحديث:** 1-5 دقائق بعد Push

---

**آخر تحديث:** 26 يناير 2026  
**التعديلات:** Shimmer Effect + جميع التحسينات النهائية
