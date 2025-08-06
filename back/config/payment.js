// config/payment.js
module.exports = {
    // تنظیمات زرین‌پال
    zarinpal: {
        merchantId: process.env.ZARINPAL_MERCHANT_ID || 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        sandbox: process.env.NODE_ENV !== 'production', // در محیط توسعه sandbox فعال است
        callbackUrl: process.env.PAYMENT_CALLBACK_URL || 'http://localhost:5001/api/v1/payment/verify',
        returnUrl: process.env.PAYMENT_RETURN_URL || 'http://localhost:3000/payment/result',
    },

    // پلن‌های اشتراک با قیمت‌های داینامیک
    subscriptionPlans: {
        basic: {
            id: 'basic',
            name: 'اشتراک پایه',
            description: 'دسترسی به امکانات پایه',
            features: [
                'مشاهده آگهی‌ها',
                'جستجوی پایه',
                'مشاهده جزئیات ملک'
            ],
            price: {
                monthly: 99000, // 99 هزار تومان
                yearly: 990000, // 990 هزار تومان (10% تخفیف)
            },
            duration: {
                monthly: 30, // 30 روز
                yearly: 365, // 365 روز
            }
        },
        premium: {
            id: 'premium',
            name: 'اشتراک ویژه',
            description: 'دسترسی کامل به تمام امکانات',
            features: [
                'تمام امکانات اشتراک پایه',
                'جستجوی پیشرفته',
                'فیلترهای پیشرفته',
                'مقایسه ملک‌ها',
                'ذخیره آگهی‌های مورد علاقه',
                'دریافت اعلان‌های جدید',
                'پشتیبانی ویژه'
            ],
            price: {
                monthly: 199000, // 199 هزار تومان
                yearly: 1990000, // 1 میلیون و 990 هزار تومان (10% تخفیف)
            },
            duration: {
                monthly: 30,
                yearly: 365,
            }
        },
        vip: {
            id: 'vip',
            name: 'اشتراک VIP',
            description: 'دسترسی کامل + امکانات ویژه',
            features: [
                'تمام امکانات اشتراک ویژه',
                'دسترسی زودهنگام به آگهی‌های جدید',
                'مشاوره رایگان',
                'امکان آپلود آگهی',
                'پشتیبانی 24/7',
                'تخفیف ویژه در خدمات'
            ],
            price: {
                monthly: 399000, // 399 هزار تومان
                yearly: 3990000, // 3 میلیون و 990 هزار تومان (10% تخفیف)
            },
            duration: {
                monthly: 30,
                yearly: 365,
            }
        }
    },

    // کدهای تخفیف
    discountCodes: {
        'WELCOME10': {
            code: 'WELCOME10',
            name: 'کد خوش‌آمدگویی',
            description: '10% تخفیف برای کاربران جدید',
            discount: 10, // درصد تخفیف
            type: 'percentage',
            maxUsage: 1, // حداکثر تعداد استفاده
            validUntil: '2024-12-31', // تاریخ انقضا
            minAmount: 50000, // حداقل مبلغ سفارش
        },
        'SUMMER20': {
            code: 'SUMMER20',
            name: 'تخفیف تابستانه',
            description: '20% تخفیف در فصل تابستان',
            discount: 20,
            type: 'percentage',
            maxUsage: 100,
            validUntil: '2024-09-30',
            minAmount: 100000,
        }
    },

    // تنظیمات عمومی
    settings: {
        currency: 'IRR', // ریال ایران
        currencySymbol: 'تومان',
        taxRate: 9, // درصد مالیات
        minAmount: 10000, // حداقل مبلغ پرداخت
        maxAmount: 10000000, // حداکثر مبلغ پرداخت
    }
}; 