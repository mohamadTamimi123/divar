const express = require('express');
const router = express.Router();
const ZarinpalCheckout = require('zarinpal-checkout');
const { Payment, User } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const paymentConfig = require('../config/payment');

// تنظیمات و ایجاد نمونه زرین‌پال (Sandbox در توسعه فعال است)
const zarinpal = ZarinpalCheckout.create(
    paymentConfig.zarinpal.merchantId,
    paymentConfig.zarinpal.sandbox
);

/**
 * @swagger
 * /payment/plans:
 *   get:
 *     summary: دریافت لیست پلن‌های اشتراک
 *     tags: [Payment]
 *     responses:
 *       200:
 *         description: پلن‌های اشتراک با موفقیت دریافت شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "پلن‌های اشتراک با موفقیت دریافت شد"
 *                 plans:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SubscriptionPlan'
 *                 currency:
 *                   type: string
 *                   example: "تومان"
 *       500:
 *         description: خطای سرور
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/plans', async (req, res) => {
    try {
        const plans = Object.values(paymentConfig.subscriptionPlans);
        
        res.json({
            message: 'پلن‌های اشتراک با موفقیت دریافت شد',
            plans,
            currency: paymentConfig.settings.currencySymbol
        });

    } catch (error) {
        console.error('خطا در دریافت پلن‌ها:', error);
        res.status(500).json({ error: 'خطا در دریافت پلن‌ها', detail: error.message });
    }
});

// محاسبه قیمت با تخفیف
function calculatePrice(planId, period, discountCode = null) {
    const plan = paymentConfig.subscriptionPlans[planId];
    if (!plan) {
        throw new Error('پلن نامعتبر است');
    }

    let basePrice = plan.price[period];
    let discountAmount = 0;
    let finalPrice = basePrice;

    // اعمال کد تخفیف
    if (discountCode && paymentConfig.discountCodes[discountCode]) {
        const discount = paymentConfig.discountCodes[discountCode];
        
        // بررسی اعتبار کد تخفیف
        if (new Date() > new Date(discount.validUntil)) {
            throw new Error('کد تخفیف منقضی شده است');
        }

        if (basePrice < discount.minAmount) {
            throw new Error(`حداقل مبلغ برای استفاده از این کد تخفیف ${discount.minAmount.toLocaleString()} تومان است`);
        }

        discountAmount = (basePrice * discount.discount) / 100;
        finalPrice = basePrice - discountAmount;
    }

    // اعمال مالیات
    const taxAmount = (finalPrice * paymentConfig.settings.taxRate) / 100;
    const totalPrice = finalPrice + taxAmount;

    return {
        basePrice,
        discountAmount,
        taxAmount,
        totalPrice: Math.round(totalPrice),
        plan,
        period,
        discountCode
    };
}

/**
 * @swagger
 * /payment/create:
 *   post:
 *     summary: ایجاد درخواست پرداخت
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *               - period
 *             properties:
 *               planId:
 *                 type: string
 *                 enum: [basic, premium, vip]
 *                 description: شناسه پلن اشتراک
 *                 example: "premium"
 *               period:
 *                 type: string
 *                 enum: [monthly, yearly]
 *                 description: دوره اشتراک
 *                 example: "monthly"
 *               discountCode:
 *                 type: string
 *                 description: کد تخفیف (اختیاری)
 *                 example: "WELCOME10"
 *     responses:
 *       200:
 *         description: درخواست پرداخت با موفقیت ایجاد شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "درخواست پرداخت با موفقیت ایجاد شد"
 *                 paymentId:
 *                   type: integer
 *                   example: 1
 *                 authority:
 *                   type: string
 *                   example: "A000000000000000000000000000000000000"
 *                 paymentUrl:
 *                   type: string
 *                   example: "https://www.zarinpal.com/pg/StartPay/A000000000000000000000000000000000000"
 *                 priceDetails:
 *                   type: object
 *       400:
 *         description: خطا در ورودی یا مبلغ نامعتبر
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: عدم احراز هویت
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: خطای سرور
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/create', authenticateToken, async (req, res) => {
    try {
        const { planId, period, discountCode } = req.body;

        // محاسبه قیمت
        const priceDetails = calculatePrice(planId, period, discountCode);

        // بررسی حداقل و حداکثر مبلغ
        if (priceDetails.totalPrice < paymentConfig.settings.minAmount) {
            return res.status(400).json({ error: `حداقل مبلغ پرداخت ${paymentConfig.settings.minAmount.toLocaleString()} تومان است` });
        }

        if (priceDetails.totalPrice > paymentConfig.settings.maxAmount) {
            return res.status(400).json({ error: `حداکثر مبلغ پرداخت ${paymentConfig.settings.maxAmount.toLocaleString()} تومان است` });
        }

        // ایجاد رکورد پرداخت
        const payment = await Payment.create({
            userId: req.user.id,
            amount: priceDetails.totalPrice,
            description: `پرداخت اشتراک ${priceDetails.plan.name} - ${period === 'monthly' ? 'ماهانه' : 'سالانه'}`,
            callbackUrl: paymentConfig.zarinpal.callbackUrl,
            returnUrl: paymentConfig.zarinpal.returnUrl,
            metadata: {
                planId,
                period,
                discountCode,
                priceDetails
            }
        });

        // ایجاد درخواست در زرین‌پال
        const paymentRequest = await zarinpal.PaymentRequest({
            Amount: priceDetails.totalPrice,
            CallbackURL: `${paymentConfig.zarinpal.callbackUrl}?paymentId=${payment.id}`,
            Description: payment.description,
            Email: req.user.email,
            Mobile: req.user.phone,
        });

        if (paymentRequest.Status === 100) {
            // بروزرسانی authority در دیتابیس
            await payment.update({
                authority: paymentRequest.Authority,
                gatewayResponse: paymentRequest
            });

            res.json({
                message: 'درخواست پرداخت با موفقیت ایجاد شد',
                paymentId: payment.id,
                authority: paymentRequest.Authority,
                paymentUrl: `https://www.zarinpal.com/pg/StartPay/${paymentRequest.Authority}`,
                priceDetails
            });
        } else {
            await payment.update({ status: 'failed' });
            throw new Error('خطا در ایجاد درخواست پرداخت');
        }

    } catch (error) {
        console.error('خطا در ایجاد پرداخت:', error);
        res.status(500).json({ error: error.message || 'خطا در ایجاد پرداخت' });
    }
});

/**
 * @swagger
 * /payment/verify:
 *   get:
 *     summary: تایید پرداخت (Callback)
 *     tags: [Payment]
 *     parameters:
 *       - in: query
 *         name: Authority
 *         required: true
 *         schema:
 *           type: string
 *         description: کد مرجع زرین‌پال
 *       - in: query
 *         name: Status
 *         schema:
 *           type: string
 *         description: وضعیت پرداخت
 *       - in: query
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: شناسه پرداخت
 *     responses:
 *       200:
 *         description: پرداخت با موفقیت انجام شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "پرداخت با موفقیت انجام شد"
 *                 refId:
 *                   type: string
 *                   example: "123456789"
 *                 payment:
 *                   $ref: '#/components/schemas/Payment'
 *       400:
 *         description: پرداخت ناموفق یا پارامترهای نامعتبر
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: پرداخت یافت نشد
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: خطای سرور
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/verify', async (req, res) => {
    try {
        const { Authority, Status, paymentId } = req.query;

        if (!Authority || !paymentId) {
            return res.status(400).json({ error: 'پارامترهای نامعتبر' });
        }

        // دریافت اطلاعات پرداخت
        const payment = await Payment.findByPk(paymentId, {
            include: [{ model: User, as: 'user' }]
        });

        if (!payment) {
            return res.status(404).json({ error: 'پرداخت یافت نشد' });
        }

        if (payment.status !== 'pending') {
            return res.status(400).json({ error: 'این پرداخت قبلاً پردازش شده است' });
        }

        // بررسی وضعیت در زرین‌پال
        const verification = await zarinpal.PaymentVerification({
            Amount: payment.amount,
            Authority: Authority,
        });

        if (verification.Status === 100) {
            // پرداخت موفق
            await payment.update({
                status: 'success',
                refId: verification.RefID,
                gatewayResponse: verification
            });

            // اینجا می‌توانید اشتراک کاربر را فعال کنید
            // await activateUserSubscription(payment.userId, payment.metadata);

            // Redirect user to frontend result page
            try {
                const baseReturnUrl = payment.returnUrl || paymentConfig.zarinpal.returnUrl;
                const separator = baseReturnUrl.includes('?') ? '&' : '?';
                const redirectUrl = `${baseReturnUrl}${separator}status=success&paymentId=${encodeURIComponent(payment.id)}&refId=${encodeURIComponent(verification.RefID)}`;
                return res.redirect(302, redirectUrl);
            } catch (e) {
                // Fallback to JSON if redirect fails
                return res.json({
                    message: 'پرداخت با موفقیت انجام شد',
                    refId: verification.RefID,
                    payment: {
                        id: payment.id,
                        amount: payment.amount,
                        status: payment.status,
                        refId: payment.refId
                    }
                });
            }
        } else {
            // پرداخت ناموفق
            await payment.update({
                status: 'failed',
                gatewayResponse: verification
            });

            // Redirect user to frontend with failed status
            try {
                const baseReturnUrl = payment.returnUrl || paymentConfig.zarinpal.returnUrl;
                const separator = baseReturnUrl.includes('?') ? '&' : '?';
                const redirectUrl = `${baseReturnUrl}${separator}status=failed&paymentId=${encodeURIComponent(payment.id)}&authority=${encodeURIComponent(Authority || '')}`;
                return res.redirect(302, redirectUrl);
            } catch (e) {
                return res.status(400).json({
                    error: 'پرداخت ناموفق بود',
                    status: verification.Status
                });
            }
        }

    } catch (error) {
        console.error('خطا در تایید پرداخت:', error);
        res.status(500).json({ error: 'خطا در تایید پرداخت', detail: error.message });
    }
});

/**
 * @swagger
 * /payment/status/{paymentId}:
 *   get:
 *     summary: بررسی وضعیت پرداخت
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: شناسه پرداخت
 *     responses:
 *       200:
 *         description: وضعیت پرداخت دریافت شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "وضعیت پرداخت دریافت شد"
 *                 payment:
 *                   $ref: '#/components/schemas/Payment'
 *       401:
 *         description: عدم احراز هویت
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: پرداخت یافت نشد
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: خطای سرور
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/status/:paymentId', authenticateToken, async (req, res) => {
    try {
        const payment = await Payment.findOne({
            where: { 
                id: req.params.paymentId,
                userId: req.user.id 
            }
        });

        if (!payment) {
            return res.status(404).json({ error: 'پرداخت یافت نشد' });
        }

        res.json({
            message: 'وضعیت پرداخت دریافت شد',
            payment: {
                id: payment.id,
                amount: payment.amount,
                status: payment.status,
                description: payment.description,
                refId: payment.refId,
                createdAt: payment.createdAt,
                updatedAt: payment.updatedAt
            }
        });

    } catch (error) {
        console.error('خطا در دریافت وضعیت پرداخت:', error);
        res.status(500).json({ error: 'خطا در دریافت وضعیت پرداخت', detail: error.message });
    }
});

/**
 * @swagger
 * /payment/history:
 *   get:
 *     summary: لیست پرداخت‌های کاربر
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: شماره صفحه
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: تعداد آیتم در هر صفحه
 *     responses:
 *       200:
 *         description: تاریخچه پرداخت‌ها دریافت شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "تاریخچه پرداخت‌ها دریافت شد"
 *                 payments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Payment'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                     totalItems:
 *                       type: integer
 *                       example: 50
 *                     itemsPerPage:
 *                       type: integer
 *                       example: 10
 *       401:
 *         description: عدم احراز هویت
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: خطای سرور
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows: payments } = await Payment.findAndCountAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            message: 'تاریخچه پرداخت‌ها دریافت شد',
            payments,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems: count,
                itemsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('خطا در دریافت تاریخچه پرداخت‌ها:', error);
        res.status(500).json({ error: 'خطا در دریافت تاریخچه پرداخت‌ها', detail: error.message });
    }
});

/**
 * @swagger
 * /payment/cancel/{paymentId}:
 *   post:
 *     summary: لغو پرداخت
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: شناسه پرداخت
 *     responses:
 *       200:
 *         description: پرداخت با موفقیت لغو شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "پرداخت با موفقیت لغو شد"
 *                 payment:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     status:
 *                       type: string
 *                       example: "cancelled"
 *       401:
 *         description: عدم احراز هویت
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: پرداخت قابل لغو یافت نشد
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: خطای سرور
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/cancel/:paymentId', authenticateToken, async (req, res) => {
    try {
        const payment = await Payment.findOne({
            where: { 
                id: req.params.paymentId,
                userId: req.user.id,
                status: 'pending'
            }
        });

        if (!payment) {
            return res.status(404).json({ error: 'پرداخت قابل لغو یافت نشد' });
        }

        await payment.update({ status: 'cancelled' });

        res.json({
            message: 'پرداخت با موفقیت لغو شد',
            payment: {
                id: payment.id,
                status: payment.status
            }
        });

    } catch (error) {
        console.error('خطا در لغو پرداخت:', error);
        res.status(500).json({ error: 'خطا در لغو پرداخت', detail: error.message });
    }
});

/**
 * @swagger
 * /payment/check-discount:
 *   post:
 *     summary: بررسی کد تخفیف
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - planId
 *               - period
 *             properties:
 *               code:
 *                 type: string
 *                 description: کد تخفیف
 *                 example: "WELCOME10"
 *               planId:
 *                 type: string
 *                 enum: [basic, premium, vip]
 *                 description: شناسه پلن
 *                 example: "premium"
 *               period:
 *                 type: string
 *                 enum: [monthly, yearly]
 *                 description: دوره اشتراک
 *                 example: "monthly"
 *     responses:
 *       200:
 *         description: کد تخفیف معتبر است
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "کد تخفیف معتبر است"
 *                 discount:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "WELCOME10"
 *                     name:
 *                       type: string
 *                       example: "کد خوش‌آمدگویی"
 *                     description:
 *                       type: string
 *                       example: "10% تخفیف برای کاربران جدید"
 *                     discountPercent:
 *                       type: integer
 *                       example: 10
 *                     discountAmount:
 *                       type: integer
 *                       example: 19900
 *                     finalPrice:
 *                       type: integer
 *                       example: 216891
 *                     savings:
 *                       type: integer
 *                       example: 19900
 *       400:
 *         description: کد تخفیف نامعتبر یا منقضی شده
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: خطای سرور
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/check-discount', async (req, res) => {
    try {
        const { code, planId, period } = req.body;

        if (!code || !planId || !period) {
            return res.status(400).json({ error: 'تمام پارامترها الزامی است' });
        }

        const discount = paymentConfig.discountCodes[code];
        if (!discount) {
            return res.status(400).json({ error: 'کد تخفیف نامعتبر است' });
        }

        // بررسی اعتبار کد تخفیف
        if (new Date() > new Date(discount.validUntil)) {
            return res.status(400).json({ error: 'کد تخفیف منقضی شده است' });
        }

        const plan = paymentConfig.subscriptionPlans[planId];
        if (!plan) {
            return res.status(400).json({ error: 'پلن نامعتبر است' });
        }

        const basePrice = plan.price[period];
        if (basePrice < discount.minAmount) {
            return res.status(400).json({ 
                error: `حداقل مبلغ برای استفاده از این کد تخفیف ${discount.minAmount.toLocaleString()} تومان است` 
            });
        }

        const discountAmount = (basePrice * discount.discount) / 100;
        const finalPrice = basePrice - discountAmount;
        const taxAmount = (finalPrice * paymentConfig.settings.taxRate) / 100;
        const totalPrice = finalPrice + taxAmount;

        res.json({
            message: 'کد تخفیف معتبر است',
            discount: {
                code: discount.code,
                name: discount.name,
                description: discount.description,
                discountPercent: discount.discount,
                discountAmount: Math.round(discountAmount),
                finalPrice: Math.round(totalPrice),
                savings: Math.round(discountAmount)
            }
        });

    } catch (error) {
        console.error('خطا در بررسی کد تخفیف:', error);
        res.status(500).json({ error: 'خطا در بررسی کد تخفیف', detail: error.message });
    }
});

module.exports = router; 