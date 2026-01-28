# 🚀 دليل تحديث Netlify

## المشكلة

الموقع على Netlify لم يتحدث تلقائياً بعد Push إلى GitHub.

---

## ✅ الحل السريع: إعادة Deploy من Netlify

### الخطوات:

#### 1️⃣ تسجيل الدخول

```
https://app.netlify.com/
```

- سجل دخول بحسابك

#### 2️⃣ اختر الموقع

- ابحث عن: `goldpreislive`
- اضغط على الموقع

#### 3️⃣ إعادة Deploy

- في الأعلى، اضغط: **Deploys**
- ثم اضغط: **Trigger deploy** → **Deploy site**

⏱️ **انتظر 1-2 دقيقة** حتى يكتمل البناء

#### 4️⃣ تحقق من الموقع

```
https://www.goldpreislive.com
```

- اضغط Ctrl+Shift+R (Force Refresh)
- يجب أن ترى Shimmer effect! ✨

---

## 🔄 الحل الدائم: ربط GitHub مع Netlify (تلقائي)

### لكي يتحدث تلقائياً في المستقبل:

#### في Netlify Dashboard:

1️⃣ **Site Settings** → **Build & Deploy**

2️⃣ **Build settings**:

- Build command: (اتركه فارغ أو: `echo "Static site"`)
- Publish directory: `/`

3️⃣ **Deploy contexts**:

- Production branch: `main`

4️⃣ **Build hooks** (اختياري):

- يمكنك إنشاء webhook لـ deploy تلقائي

---

## ⚙️ تحقق من ربط GitHub

### في Netlify → Site Settings:

1️⃣ اضغط **Build & Deploy** من القائمة

2️⃣ ابحث عن **Continuous Deployment**

3️⃣ تحقق من:

- Repository: `Abdullah-Jlilati/Goldpreislive` ✅
- Branch: `main` ✅
- Auto deploy: `Enabled` ✅

إذا كان **Auto deploy = Disabled**:

- فعّله لكي يتحدث تلقائياً

---

## 🔍 تشخيص المشكلة

### في Netlify Dashboard → Deploys:

تحقق من آخر Deploy:

- **التاريخ:** متى كان؟
- **الحالة:** Published ✅ أو Failed ❌؟
- **Branch:** هل من `main`؟

إذا كان آخر deploy قديم:

- معناه Auto deploy معطل
- أو GitHub webhook غير موجود

---

## 🔗 إضافة GitHub Integration (إذا مفقود)

### في Netlify:

1️⃣ **Site Settings** → **Build & Deploy**

2️⃣ **Link repository**:

- اختر: GitHub
- صرّح لـ Netlify
- اختر: `Abdullah-Jlilati/Goldpreislive`
- Branch: `main`

3️⃣ **Save**

من الآن كل push → deploy تلقائي! 🎉

---

## 📝 ملاحظات مهمة

### Cache في المتصفح:

حتى بعد Deploy الجديد، قد تحتاج:

- **Ctrl+Shift+R** (Hard Refresh)
- أو امسح cache المتصفح

### وقت الـ Deploy:

- **Netlify:** 30 ثانية - 2 دقيقة عادةً
- إذا استغرق أكثر: تحقق من Logs

---

## ✅ Checklist

بعد إعادة Deploy، تحقق من:

- [ ] Shimmer effect يعمل على الأسعار ✨
- [ ] رموز العملات صحيحة (€ و $ يمين)
- [ ] الألوان: أصفر للذهب، فضي للفضة
- [ ] قائمة الموبايل السريعة تظهر

---

## 🆘 إذا استمرت المشكلة

### 1. تحقق من Netlify Build Log:

```
Deploys → آخر deploy → Build log
```

ابحث عن أخطاء

### 2. تحقق من GitHub:

```
https://github.com/Abdullah-Jlilati/Goldpreislive
```

هل الملفات محدثة؟

### 3. امسح Cache Netlify:

```
Site Settings → Build & Deploy → Post processing
→ Clear cache and retry deploy
```

---

**ملخص سريع:**

1. اذهب إلى Netlify
2. اضغط **Trigger deploy**
3. انتظر 1-2 دقيقة
4. Ctrl+Shift+R على الموقع

**سهل!** 🚀
