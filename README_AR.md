# المركز الفني للصيانة — نسخة مرتبة جديدة

## محتويات المشروع
- `index.html`
- `package.json`
- `vite.config.js`
- `src/main.jsx`
- `src/supabase.js`
- `src/style.css`
- `supabase/schema.sql`

**مهم:** يجب أن يكون مجلد `src` في جذر المستودع، وبداخله الملفات الثلاثة مباشرة. لا تنشئ `src/src`.

## النشر على Netlify
1. ارفع جميع محتويات هذا المجلد إلى جذر مستودع GitHub.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. أضف متغيري البيئة:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. أعد النشر.

## إعداد Supabase
1. افتح SQL Editor وشغّل محتوى `supabase/schema.sql`.
2. أنشئ مستخدمًا من Authentication > Users.
3. انسخ UID الخاص بالمستخدم من لوحة Supabase.
4. نفّذ الاستعلام التالي بعد استبدال UID:
   `insert into public.admin_users(user_id) values ('USER-UUID');`
5. من Project Settings > API انسخ Project URL و anon/publishable key إلى متغيرات Netlify.

لا تضع service_role key في الموقع أو GitHub ولا ترسله في المحادثة.

## بيانات المركز
المركز الفني للصيانة — المهندس رضا محمد فتحي
الهاتف: 01066216816 — 01145319938
واتساب: 01066216816
العنوان: قرية الوفاء – البر التاني – بجوار مسجد الحاج محمد فتحي

الضمان: سنة لليدات، 3 شهور لصيانة الشاشات، 3 شهور للريسيفرات.
الأسعار استرشادية ويُحدد السعر النهائي بعد الفحص.
