# مدیریت مشتریان - راهنمای کامل

## 📋 خلاصه ویژگی‌ها

سیستم مدیریت مشتریان به مشاوران املاک امکان می‌دهد تا:

- ✅ مشتریان خود را ثبت و مدیریت کنند
- ✅ مشخصات ملک مورد نیاز مشتری را وارد کنند
- ✅ فایل‌های مرتبط با هر مشتری را مشاهده کنند
- ✅ تطبیق‌های خودکار فایل‌های جدید با نیازهای مشتری
- ✅ نمایش فایل‌های جدید با نشانگر "جدید"
- ✅ جستجو و فیلتر کردن مشتریان

## 🏗️ ساختار پایگاه داده

### جدول Clients
```sql
CREATE TABLE "Clients" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "Users"("id"),
  "name" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(255) NOT NULL,
  "propertyType" VARCHAR(255) NOT NULL CHECK ("propertyType" IN ('sale', 'rent', 'land', 'partnership')),
  "area" VARCHAR(255) NOT NULL,
  "city" VARCHAR(255) NOT NULL,
  "budget" INTEGER,
  "description" TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

### جدول ClientFiles
```sql
CREATE TABLE "ClientFiles" (
  "id" SERIAL PRIMARY KEY,
  "clientId" INTEGER NOT NULL REFERENCES "Clients"("id") ON DELETE CASCADE,
  "userId" INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
  "filename" VARCHAR(255) NOT NULL,
  "filePath" VARCHAR(255) NOT NULL,
  "fileType" VARCHAR(255) DEFAULT 'property' CHECK ("fileType" IN ('property', 'crawled', 'generated')),
  "title" VARCHAR(255),
  "description" TEXT,
  "isNew" BOOLEAN DEFAULT true,
  "isRead" BOOLEAN DEFAULT false,
  "matchScore" INTEGER,
  "metadata" JSON,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

## 🚀 نصب و راه‌اندازی

### 1. اجرای مایگریشن
```bash
cd back
npm run migrate
```

### 2. بررسی نصب
- وارد پنل مدیریت شوید
- به بخش "مدیریت مشتریان" بروید
- یک مشتری جدید اضافه کنید

## 📊 API Endpoints

### مشتریان

#### دریافت لیست مشتریان
```http
GET /api/v1/admin/clients?page=1&limit=10&search=&propertyType=&city=
Authorization: Bearer <token>
```

#### افزودن مشتری جدید
```http
POST /api/v1/admin/clients
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "نام مشتری",
  "phone": "09123456789",
  "propertyType": "sale",
  "area": "100-150",
  "city": "تهران",
  "budget": 500000000,
  "description": "توضیحات اضافی"
}
```

#### ویرایش مشتری
```http
PUT /api/v1/admin/clients/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "نام جدید",
  "phone": "09123456789",
  "propertyType": "rent",
  "area": "80-120",
  "city": "کرج",
  "budget": 300000000,
  "description": "توضیحات جدید"
}
```

#### حذف مشتری
```http
DELETE /api/v1/admin/clients/:id
Authorization: Bearer <token>
```

### فایل‌های مشتری

#### دریافت فایل‌های مشتری
```http
GET /api/v1/admin/clients/:id/files
Authorization: Bearer <token>
```

#### افزودن فایل به مشتری
```http
POST /api/v1/admin/clients/:id/files
Authorization: Bearer <token>
Content-Type: application/json

{
  "filename": "file.json",
  "filePath": "/path/to/file.json",
  "fileType": "crawled",
  "title": "عنوان فایل",
  "description": "توضیحات فایل",
  "matchScore": 85,
  "metadata": {
    "propertyType": "sale",
    "city": "تهران"
  }
}
```

#### علامت‌گذاری فایل به عنوان خوانده شده
```http
PATCH /api/v1/admin/clients/:clientId/files/:fileId/read
Authorization: Bearer <token>
```

#### حذف فایل از مشتری
```http
DELETE /api/v1/admin/clients/:clientId/files/:fileId
Authorization: Bearer <token>
```

### تطبیق‌ها

#### یافتن تطبیق‌های ملک برای مشتری
```http
GET /api/v1/admin/clients/:id/matches
Authorization: Bearer <token>
```

## 🔄 سیستم تطبیق خودکار

### نحوه کارکرد
1. **کراول جدید**: هنگام کراول کردن داده‌های جدید، سیستم به طور خودکار فایل‌ها را با مشتریان تطبیق می‌دهد
2. **محاسبه امتیاز**: بر اساس معیارهای زیر امتیاز تطبیق محاسبه می‌شود:
   - نوع ملک (30 امتیاز)
   - شهر (25 امتیاز)
   - متراژ (20 امتیاز)
   - بودجه (15 امتیاز)
   - محله (10 امتیاز)

### معیارهای تطبیق
```javascript
// مثال محاسبه امتیاز
const matchScore = await ClientFileService.calculateMatchScore(client, {
  propertyType: 'sale',
  city: 'تهران',
  area: '120',
  price: 450000000,
  neighborhood: 'ونک'
});
```

## 🎨 رابط کاربری

### بخش‌های اصلی
1. **لیست مشتریان**: نمایش تمام مشتریان با امکان جستجو و فیلتر
2. **افزودن مشتری**: فرم کامل برای ثبت اطلاعات مشتری
3. **ویرایش مشتری**: امکان ویرایش تمام اطلاعات
4. **فایل‌های مشتری**: نمایش فایل‌های مرتبط با نشانگرهای جدید
5. **تطبیق‌ها**: نمایش ملک‌های تطبیق یافته با نیازهای مشتری

### نشانگرهای بصری
- 🔴 **جدید**: فایل‌های جدید با نشانگر قرمز
- ✅ **خوانده شده**: فایل‌های مطالعه شده
- 🎯 **امتیاز تطبیق**: درصد تطبیق فایل با نیازهای مشتری

## 🔧 تنظیمات و پیکربندی

### تنظیمات تطبیق
```javascript
// در service/clientFileService.js
const MATCH_WEIGHTS = {
  propertyType: 30,
  city: 25,
  area: 20,
  budget: 15,
  neighborhood: 10
};
```

### تنظیمات فایل
```javascript
// انواع فایل
const FILE_TYPES = {
  property: 'ملک',
  crawled: 'کراول شده',
  generated: 'تولید شده'
};
```

## 📈 آمار و گزارش‌گیری

### آمار فایل‌ها
```http
GET /api/v1/admin/clients/:id/files/stats
```

### پاسخ نمونه
```json
{
  "stats": {
    "total": 15,
    "new": 3,
    "read": 12,
    "unread": 3,
    "byType": {
      "crawled": 10,
      "property": 3,
      "generated": 2
    }
  }
}
```

## 🐛 عیب‌یابی

### مشکلات رایج

#### 1. فایل‌ها با مشتریان تطبیق نمی‌یابند
- بررسی کنید که مشتری فعال باشد (`isActive: true`)
- بررسی کنید که اطلاعات مشتری کامل باشد
- لاگ‌های سیستم را بررسی کنید

#### 2. مایگریشن اجرا نمی‌شود
```bash
# بررسی اتصال پایگاه داده
node -e "const { sequelize } = require('./configs/database'); sequelize.authenticate().then(() => console.log('OK')).catch(console.error)"
```

#### 3. فایل‌های جدید نمایش داده نمی‌شوند
- بررسی کنید که `isNew: true` باشد
- بررسی کنید که فایل در مسیر صحیح قرار داشته باشد

## 🔄 به‌روزرسانی‌ها

### نسخه 1.0.0
- ✅ سیستم مدیریت مشتریان
- ✅ تطبیق خودکار فایل‌ها
- ✅ رابط کاربری کامل
- ✅ API کامل

### نسخه‌های آینده
- 📅 سیستم اعلان‌ها
- 📅 گزارش‌گیری پیشرفته
- 📅 تحلیل داده‌ها
- 📅 موبایل اپ

## 📞 پشتیبانی

برای سوالات و مشکلات:
1. بررسی این مستندات
2. بررسی لاگ‌های سیستم
3. تماس با تیم توسعه

---

**توسعه‌دهنده**: تیم Divar Admin  
**آخرین به‌روزرسانی**: 1403/10/17 