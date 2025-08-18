const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User, Payment } = require('../models');
const paymentConfig = require('../config/payment');
const { authenticateToken } = require('../middleware/auth');

// JWT Secret Key
const JWT_SECRET = 'your-secret-key-here';

/**
 * @swagger
 * /auth/subscription-status:
 *   get:
 *     summary: بررسی وضعیت اشتراک کاربر
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: وضعیت اشتراک دریافت شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hasActiveSubscription:
 *                   type: boolean
 *                   description: آیا کاربر اشتراک فعال دارد
 *                 subscriptionDetails:
 *                   type: object
 *                   description: جزئیات اشتراک (در صورت وجود)
 *       401:
 *         description: توکن نامعتبر یا منقضی شده
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
router.get('/subscription-status', authenticateToken, async (req, res) => {
    try {
        // Check for active subscription payments
        const activePayment = await Payment.findOne({
            where: {
                userId: req.user.id,
                status: 'success',
                description: {
                    [Op.like]: '%اشتراک%'
                }
            },
            order: [['createdAt', 'DESC']]
        });

        if (!activePayment) {
            return res.json({
                hasActiveSubscription: false,
                subscriptionDetails: null
            });
        }

        // Check if subscription is still valid (30 days for monthly, 365 days for yearly)
        const paymentDate = new Date(activePayment.createdAt);
        const now = new Date();
        const daysSincePayment = Math.floor((now - paymentDate) / (1000 * 60 * 60 * 24));

        // Determine subscription duration based on payment description
        let subscriptionDuration = 30; // Default to monthly
        if (activePayment.description.includes('سالانه')) {
            subscriptionDuration = 365;
        }

        const isActive = daysSincePayment < subscriptionDuration;

        // Extract metadata if exists
        const meta = activePayment.metadata || {};
        const planId = meta.planId || null;
        const period = meta.period || (subscriptionDuration === 365 ? 'yearly' : 'monthly');
        const plan = planId ? paymentConfig.subscriptionPlans[planId] : null;

        res.json({
            hasActiveSubscription: isActive,
            subscriptionDetails: isActive ? {
                paymentId: activePayment.id,
                amount: activePayment.amount,
                description: activePayment.description,
                createdAt: activePayment.createdAt,
                expiresAt: new Date(paymentDate.getTime() + (subscriptionDuration * 24 * 60 * 60 * 1000)),
                daysRemaining: subscriptionDuration - daysSincePayment,
                planId: planId,
                planName: plan ? plan.name : null,
                period: period
            } : null
        });

    } catch (error) {
        console.error('خطا در بررسی وضعیت اشتراک:', error);
        res.status(500).json({ error: 'خطا در بررسی وضعیت اشتراک', detail: error.message });
    }
});

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: ثبت‌نام کاربر جدید
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - password
 *             properties:
 *               phone:
 *                 type: string
 *                 description: شماره تلفن (با پیشوند +98)
 *                 example: "+989123456789"
 *               password:
 *                 type: string
 *                 description: رمز عبور
 *                 example: "123456"
 *     responses:
 *       201:
 *         description: کاربر با موفقیت ثبت شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "کاربر با موفقیت ثبت شد"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: JWT token
 *       400:
 *         description: خطا در ورودی یا کاربر تکراری
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
router.post('/register', async (req, res) => {
    try {
        const { phone, password } = req.body;

        // Validation
        if (!phone || !password) {
            return res.status(400).json({ error: 'شماره تلفن و رمز عبور الزامی است' });
        }

        // Phone number validation (should be +98 + 10 digits starting with 9)
        if (!phone.startsWith('+98') || phone.length !== 13 || !phone.slice(3).startsWith('9')) {
            return res.status(400).json({ error: 'شماره تلفن باید با فرمت +989xxxxxxxxx باشد' });
        }

        // Password validation
        if (password.length < 6) {
            return res.status(400).json({ error: 'رمز عبور باید حداقل 6 کاراکتر باشد' });
        }

        // بررسی وجود کاربر با این شماره تلفن
        const existingUser = await User.findOne({ where: { phone } });
        if (existingUser) {
            return res.status(400).json({ error: 'کاربری با این شماره تلفن قبلاً ثبت شده است' });
        }

        // هش کردن پسورد
        const hashedPassword = await bcrypt.hash(password, 10);

        // ایجاد کاربر جدید
        const user = await User.create({
            phone,
            password: hashedPassword,
            name: `کاربر ${phone.slice(-4)}`, // نام پیش‌فرض بر اساس 4 رقم آخر
            email: null, // ایمیل اختیاری است
            role: 'user' // نقش پیش‌فرض
        });

        // تولید JWT توکن
        const token = jwt.sign(
            { userId: user.id, phone: user.phone, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // حذف پسورد از خروجی
        const userResponse = {
            id: user.id,
            name: user.name,
            phone: user.phone,
            role: user.role,
        };

        res.status(201).json({
            message: 'کاربر با موفقیت ثبت شد',
            user: userResponse,
            token
        });

    } catch (error) {
        console.error('خطا در ثبت‌نام:', error);
        res.status(500).json({ error: 'خطا در ثبت‌نام کاربر', detail: error.message });
    }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: ورود کاربر
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - password
 *             properties:
 *               phone:
 *                 type: string
 *                 description: شماره تلفن (با پیشوند +98)
 *                 example: "+989123456789"
 *               password:
 *                 type: string
 *                 description: رمز عبور
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: ورود موفقیت‌آمیز
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "ورود موفقیت‌آمیز"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: JWT token
 *       401:
 *         description: شماره تلفن یا رمز عبور اشتباه
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
router.post('/login', async (req, res) => {
    try {
        const { phone, password } = req.body;

        // Validation
        if (!phone || !password) {
            return res.status(400).json({ error: 'شماره تلفن و رمز عبور الزامی است' });
        }

        // Phone number validation (should be +98 + 10 digits starting with 9)
        if (!phone.startsWith('+98') || phone.length !== 13 || !phone.slice(3).startsWith('9')) {
            return res.status(400).json({ error: 'شماره تلفن باید با فرمت +989xxxxxxxxx باشد' });
        }

        // پیدا کردن کاربر
        const user = await User.findOne({ where: { phone } });
        if (!user) {
            return res.status(401).json({ error: 'شماره تلفن یا رمز عبور اشتباه است' });
        }

        // بررسی فعال بودن کاربر
        if (!user.isActive) {
            return res.status(401).json({ error: 'حساب کاربری غیرفعال است' });
        }

        // بررسی پسورد
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'شماره تلفن یا رمز عبور اشتباه است' });
        }

        // تولید JWT توکن
        const token = jwt.sign(
            { userId: user.id, phone: user.phone, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // حذف پسورد از خروجی
        const userResponse = {
            id: user.id,
            name: user.name,
            phone: user.phone,
            role: user.role,
        };

        res.json({
            message: 'ورود موفقیت‌آمیز',
            user: userResponse,
            token
        });

    } catch (error) {
        console.error('خطا در ورود:', error);
        res.status(500).json({ error: 'خطا در ورود', detail: error.message });
    }
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: دریافت اطلاعات کاربر فعلی
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: اطلاعات کاربر دریافت شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: توکن نامعتبر یا منقضی شده
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: کاربر یافت نشد
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
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'توکن ارائه نشده است' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findByPk(decoded.userId, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ error: 'کاربر یافت نشد' });
        }

        res.json({ user });

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'توکن نامعتبر است' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'توکن منقضی شده است' });
        }
        
        console.error('خطا در دریافت اطلاعات کاربر:', error);
        res.status(500).json({ error: 'خطا در دریافت اطلاعات کاربر' });
    }
});

module.exports = router; 