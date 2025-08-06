const express = require('express');
const router = express.Router();
const { User, Property, SaleDetail, RentDetail, City, Neighborhood, Client, ClientFile, sequelize } = require('../models');
const { authenticateToken, requireAdmin, requireSuperAdmin } = require('../middleware/auth');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// 📌 دریافت لیست کاربران با فیلتر و صفحه‌بندی (ادمین + سوپر ادمین)
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            search = '', 
            role = '', 
            isActive = '',
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;
        
        // ساخت فیلترها
        const whereClause = {};
        
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
                { phone: { [Op.iLike]: `%${search}%` } }
            ];
        }
        
        if (role) {
            whereClause.role = role;
        }
        
        if (isActive !== '') {
            whereClause.isActive = isActive === 'true';
        }

        // دریافت کاربران
        const { count, rows: users } = await User.findAndCountAll({
            where: whereClause,
            attributes: { exclude: ['password'] },
            order: [[sortBy, sortOrder]],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            message: 'لیست کاربران با موفقیت دریافت شد',
            users,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems: count,
                itemsPerPage: parseInt(limit),
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.error('خطا در دریافت لیست کاربران:', error);
        res.status(500).json({ error: 'خطا در دریافت لیست کاربران', detail: error.message });
    }
});

// 📌 دریافت اطلاعات یک کاربر خاص
router.get('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ error: 'کاربر یافت نشد' });
        }

        res.json({
            message: 'اطلاعات کاربر با موفقیت دریافت شد',
            user
        });

    } catch (error) {
        console.error('خطا در دریافت اطلاعات کاربر:', error);
        res.status(500).json({ error: 'خطا در دریافت اطلاعات کاربر', detail: error.message });
    }
});

// 📌 ایجاد کاربر جدید (فقط سوپر ادمین)
router.post('/users', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
        const { name, email, password, phone, role = 'user' } = req.body;

        // بررسی وجود کاربر با این ایمیل
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'کاربری با این ایمیل قبلاً ثبت شده است' });
        }

        // بررسی نقش معتبر
        const validRoles = ['user', 'admin', 'super_admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: 'نقش نامعتبر است' });
        }

        // هش کردن پسورد
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);

        // ایجاد کاربر جدید
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            role
        });

        res.status(201).json({
            message: 'کاربر با موفقیت ایجاد شد',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isActive: user.isActive,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('خطا در ایجاد کاربر:', error);
        res.status(500).json({ error: 'خطا در ایجاد کاربر', detail: error.message });
    }
});

// 📌 ویرایش اطلاعات کاربر (فقط سوپر ادمین)
router.put('/users/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
        const { name, email, phone, role } = req.body;
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'کاربر یافت نشد' });
        }

        // بررسی نقش معتبر
        if (role && !['user', 'admin', 'super_admin'].includes(role)) {
            return res.status(400).json({ error: 'نقش نامعتبر است' });
        }

        // بررسی تکراری نبودن ایمیل
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ error: 'کاربری با این ایمیل قبلاً ثبت شده است' });
            }
        }

        // بروزرسانی اطلاعات
        await user.update({
            name: name || user.name,
            email: email || user.email,
            phone: phone || user.phone,
            role: role || user.role
        });

        res.json({
            message: 'اطلاعات کاربر با موفقیت بروزرسانی شد',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isActive: user.isActive,
                updatedAt: user.updatedAt
            }
        });

    } catch (error) {
        console.error('خطا در ویرایش کاربر:', error);
        res.status(500).json({ error: 'خطا در ویرایش کاربر', detail: error.message });
    }
});

// 📌 تغییر پسورد کاربر (فقط سوپر ادمین)
router.patch('/users/:id/password', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
        const { password } = req.body;
        const { id } = req.params;

        if (!password) {
            return res.status(400).json({ error: 'رمز عبور جدید الزامی است' });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'کاربر یافت نشد' });
        }

        // هش کردن پسورد جدید
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);

        await user.update({ password: hashedPassword });

        res.json({
            message: 'رمز عبور کاربر با موفقیت تغییر یافت'
        });

    } catch (error) {
        console.error('خطا در تغییر رمز عبور:', error);
        res.status(500).json({ error: 'خطا در تغییر رمز عبور', detail: error.message });
    }
});

// 📌 تغییر نقش کاربر (فقط سوپر ادمین)
router.patch('/users/:id/role', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        const { id } = req.params;

        // بررسی نقش معتبر
        const validRoles = ['user', 'admin', 'super_admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: 'نقش نامعتبر است' });
        }

        // بررسی اینکه کاربر خودش را تغییر ندهد
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ error: 'نمی‌توانید نقش خودتان را تغییر دهید' });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'کاربر یافت نشد' });
        }

        await user.update({ role });

        res.json({
            message: 'نقش کاربر با موفقیت تغییر یافت',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive
            }
        });

    } catch (error) {
        console.error('خطا در تغییر نقش کاربر:', error);
        res.status(500).json({ error: 'خطا در تغییر نقش کاربر', detail: error.message });
    }
});

// 📌 فعال/غیرفعال کردن کاربر (ادمین + سوپر ادمین)
router.patch('/users/:id/status', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { isActive } = req.body;
        const { id } = req.params;

        // بررسی اینکه کاربر خودش را غیرفعال نکند
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ error: 'نمی‌توانید وضعیت خودتان را تغییر دهید' });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'کاربر یافت نشد' });
        }

        // فقط سوپر ادمین می‌تواند ادمین را غیرفعال کند
        if (user.role === 'admin' && req.user.role !== 'super_admin') {
            return res.status(403).json({ error: 'فقط سوپر ادمین می‌تواند ادمین را غیرفعال کند' });
        }

        await user.update({ isActive });

        res.json({
            message: `کاربر ${isActive ? 'فعال' : 'غیرفعال'} شد`,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive
            }
        });

    } catch (error) {
        console.error('خطا در تغییر وضعیت کاربر:', error);
        res.status(500).json({ error: 'خطا در تغییر وضعیت کاربر', detail: error.message });
    }
});

// 📌 عملیات گروهی (فقط سوپر ادمین)
router.post('/users/bulk-action', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
        const { action, userIds } = req.body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ error: 'لیست کاربران الزامی است' });
        }

        // بررسی اینکه کاربر خودش را شامل نباشد
        if (userIds.includes(req.user.id)) {
            return res.status(400).json({ error: 'نمی‌توانید خودتان را در عملیات گروهی قرار دهید' });
        }

        let message = '';
        let updatedCount = 0;

        switch (action) {
            case 'activate':
                await User.update(
                    { isActive: true },
                    { where: { id: userIds } }
                );
                message = 'کاربران با موفقیت فعال شدند';
                updatedCount = userIds.length;
                break;

            case 'deactivate':
                await User.update(
                    { isActive: false },
                    { where: { id: userIds } }
                );
                message = 'کاربران با موفقیت غیرفعال شدند';
                updatedCount = userIds.length;
                break;

            case 'delete':
                await User.destroy({ where: { id: userIds } });
                message = 'کاربران با موفقیت حذف شدند';
                updatedCount = userIds.length;
                break;

            default:
                return res.status(400).json({ error: 'عملیات نامعتبر است' });
        }

        res.json({
            message,
            updatedCount
        });

    } catch (error) {
        console.error('خطا در عملیات گروهی:', error);
        res.status(500).json({ error: 'خطا در عملیات گروهی', detail: error.message });
    }
});

// 📌 حذف کاربر (فقط سوپر ادمین)
router.delete('/users/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // بررسی اینکه کاربر خودش را حذف نکند
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ error: 'نمی‌توانید خودتان را حذف کنید' });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'کاربر یافت نشد' });
        }

        await user.destroy();

        res.json({
            message: 'کاربر با موفقیت حذف شد'
        });

    } catch (error) {
        console.error('خطا در حذف کاربر:', error);
        res.status(500).json({ error: 'خطا در حذف کاربر', detail: error.message });
    }
});

// 📌 آمار کلی (ادمین + سوپر ادمین)
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const totalUsers = await User.count();
        const activeUsers = await User.count({ where: { isActive: true } });
        const adminUsers = await User.count({ where: { role: 'admin' } });
        const superAdminUsers = await User.count({ where: { role: 'super_admin' } });
        const regularUsers = await User.count({ where: { role: 'user' } });

        // آمار ملک‌ها
        const totalProperties = await Property.count();
        const saleProperties = await Property.count({ where: { type: 'sale' } });
        const rentProperties = await Property.count({ where: { type: 'rent' } });

        // آمار کاربران جدید در 30 روز گذشته
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const newUsersThisMonth = await User.count({
            where: {
                createdAt: {
                    [Op.gte]: thirtyDaysAgo
                }
            }
        });

        res.json({
            message: 'آمار با موفقیت دریافت شد',
            stats: {
                totalUsers,
                activeUsers,
                inactiveUsers: totalUsers - activeUsers,
                adminUsers,
                superAdminUsers,
                regularUsers,
                newUsersThisMonth,
                totalProperties,
                saleProperties,
                rentProperties,
                userDistribution: {
                    regular: regularUsers,
                    admin: adminUsers,
                    superAdmin: superAdminUsers
                }
            }
        });

    } catch (error) {
        console.error('خطا در دریافت آمار:', error);
        res.status(500).json({ error: 'خطا در دریافت آمار', detail: error.message });
    }
});

// 📌 دریافت نقش‌های موجود
router.get('/roles', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const roles = [
            { value: 'user', label: 'مشترک', description: 'کاربران عادی سیستم' },
            { value: 'admin', label: 'ادمین', description: 'مدیران سیستم' },
            { value: 'super_admin', label: 'سوپر ادمین', description: 'مدیران ارشد سیستم' }
        ];

        res.json({
            message: 'نقش‌های موجود با موفقیت دریافت شد',
            roles
        });

    } catch (error) {
        console.error('خطا در دریافت نقش‌ها:', error);
        res.status(500).json({ error: 'خطا در دریافت نقش‌ها', detail: error.message });
    }
});

// ==================== 📋 مدیریت ملک‌ها ====================

// 📌 دریافت لیست ملک‌ها با فیلتر و صفحه‌بندی (ادمین + سوپر ادمین)
router.get('/properties', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            search = '', 
            type = '', 
            city = '',
            neighborhood = '',
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;
        
        // ساخت فیلترها
        const whereClause = {};
        
        if (search) {
            whereClause[Op.or] = [
                { title: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } }
            ];
        }
        
        if (type) {
            whereClause.type = type;
        }

        // ساخت include برای join با جداول مرتبط
        const include = [
            {
                model: City,
                as: 'city',
                attributes: ['id', 'name'],
                where: city ? { name: { [Op.iLike]: `%${city}%` } } : undefined
            },
            {
                model: Neighborhood,
                as: 'neighborhood',
                attributes: ['id', 'name'],
                where: neighborhood ? { name: { [Op.iLike]: `%${neighborhood}%` } } : undefined
            },
            {
                model: SaleDetail,
                as: 'saleDetail',
                required: type === 'sale' ? true : false
            },
            {
                model: RentDetail,
                as: 'rentDetail',
                required: type === 'rent' ? true : false
            }
        ];

        // حذف where های undefined
        include.forEach(item => {
            if (item.where && Object.keys(item.where).length === 0) {
                delete item.where;
            }
        });

        // دریافت ملک‌ها
        const { count, rows: properties } = await Property.findAndCountAll({
            where: whereClause,
            include: include,
            order: [[sortBy, sortOrder]],
            limit: parseInt(limit),
            offset: parseInt(offset),
            distinct: true
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            message: 'لیست ملک‌ها با موفقیت دریافت شد',
            properties,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems: count,
                itemsPerPage: parseInt(limit),
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.error('خطا در دریافت لیست ملک‌ها:', error);
        res.status(500).json({ error: 'خطا در دریافت لیست ملک‌ها', detail: error.message });
    }
});

// 📌 دریافت اطلاعات یک ملک خاص
router.get('/properties/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const property = await Property.findByPk(req.params.id, {
            include: [
                {
                    model: City,
                    as: 'city',
                    attributes: ['id', 'name']
                },
                {
                    model: Neighborhood,
                    as: 'neighborhood',
                    attributes: ['id', 'name']
                },
                {
                    model: SaleDetail,
                    as: 'saleDetail'
                },
                {
                    model: RentDetail,
                    as: 'rentDetail'
                }
            ]
        });

        if (!property) {
            return res.status(404).json({ error: 'ملک یافت نشد' });
        }

        res.json({
            message: 'اطلاعات ملک با موفقیت دریافت شد',
            property
        });

    } catch (error) {
        console.error('خطا در دریافت اطلاعات ملک:', error);
        res.status(500).json({ error: 'خطا در دریافت اطلاعات ملک', detail: error.message });
    }
});

// 📌 حذف ملک (ادمین + سوپر ادمین)
router.delete('/properties/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const property = await Property.findByPk(id);
        if (!property) {
            return res.status(404).json({ error: 'ملک یافت نشد' });
        }

        await property.destroy();

        res.json({
            message: 'ملک با موفقیت حذف شد'
        });

    } catch (error) {
        console.error('خطا در حذف ملک:', error);
        res.status(500).json({ error: 'خطا در حذف ملک', detail: error.message });
    }
});

// 📌 دریافت لیست شهرها برای فیلتر
router.get('/cities', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const cities = await City.findAll({
            attributes: ['id', 'name'],
            order: [['name', 'ASC']]
        });

        res.json({
            message: 'لیست شهرها با موفقیت دریافت شد',
            cities
        });

    } catch (error) {
        console.error('خطا در دریافت لیست شهرها:', error);
        res.status(500).json({ error: 'خطا در دریافت لیست شهرها', detail: error.message });
    }
});

// 📌 دریافت لیست محله‌ها برای فیلتر
router.get('/neighborhoods', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const neighborhoods = await Neighborhood.findAll({
            attributes: ['id', 'name'],
            order: [['name', 'ASC']]
        });

        res.json({
            message: 'لیست محله‌ها با موفقیت دریافت شد',
            neighborhoods
        });

    } catch (error) {
        console.error('خطا در دریافت لیست محله‌ها:', error);
        res.status(500).json({ error: 'خطا در دریافت لیست محله‌ها', detail: error.message });
    }
});

// ==================== CLIENT MANAGEMENT ROUTES ====================

// 📌 دریافت لیست مشتریان با فیلتر و صفحه‌بندی
router.get('/clients', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            search = '', 
            propertyType = '', 
            city = '',
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;
        
        // ساخت فیلترها
        const whereClause = {};
        
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { phone: { [Op.iLike]: `%${search}%` } },
                { city: { [Op.iLike]: `%${search}%` } }
            ];
        }
        
        if (propertyType) {
            whereClause.propertyType = propertyType;
        }
        
        if (city) {
            whereClause.city = { [Op.iLike]: `%${city}%` };
        }

        // دریافت مشتریان
        const { count, rows: clients } = await Client.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email']
                }
            ],
            order: [[sortBy, sortOrder]],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            message: 'لیست مشتریان با موفقیت دریافت شد',
            clients,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems: count,
                itemsPerPage: parseInt(limit),
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.error('خطا در دریافت لیست مشتریان:', error);
        res.status(500).json({ error: 'خطا در دریافت لیست مشتریان', detail: error.message });
    }
});

// 📌 دریافت اطلاعات یک مشتری خاص
router.get('/clients/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const client = await Client.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email']
                }
            ]
        });

        if (!client) {
            return res.status(404).json({ error: 'مشتری یافت نشد' });
        }

        res.json({
            message: 'اطلاعات مشتری با موفقیت دریافت شد',
            client
        });

    } catch (error) {
        console.error('خطا در دریافت اطلاعات مشتری:', error);
        res.status(500).json({ error: 'خطا در دریافت اطلاعات مشتری', detail: error.message });
    }
});

// 📌 ایجاد مشتری جدید
router.post('/clients', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { name, phone, propertyType, area, city, budget, description } = req.body;

        // بررسی فیلدهای ضروری
        if (!name || !phone || !propertyType || !area || !city) {
            return res.status(400).json({ error: 'تمام فیلدهای ضروری باید پر شوند' });
        }

        // بررسی وجود مشتری با این شماره تلفن
        const existingClient = await Client.findOne({ 
            where: { 
                phone,
                userId: req.user.id 
            } 
        });
        
        if (existingClient) {
            return res.status(400).json({ error: 'مشتری با این شماره تلفن قبلاً ثبت شده است' });
        }

        const client = await Client.create({
            userId: req.user.id,
            name,
            phone,
            propertyType,
            area,
            city,
            budget: budget ? parseInt(budget) : null,
            description
        });

        res.status(201).json({
            message: 'مشتری با موفقیت اضافه شد',
            client
        });

    } catch (error) {
        console.error('خطا در ایجاد مشتری:', error);
        res.status(500).json({ error: 'خطا در ایجاد مشتری', detail: error.message });
    }
});

// 📌 ویرایش مشتری
router.put('/clients/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, propertyType, area, city, budget, description, isActive } = req.body;

        const client = await Client.findOne({
            where: { 
                id,
                userId: req.user.id 
            }
        });

        if (!client) {
            return res.status(404).json({ error: 'مشتری یافت نشد' });
        }

        // بررسی وجود مشتری دیگر با این شماره تلفن
        if (phone && phone !== client.phone) {
            const existingClient = await Client.findOne({ 
                where: { 
                    phone,
                    userId: req.user.id,
                    id: { [Op.ne]: id }
                } 
            });
            
            if (existingClient) {
                return res.status(400).json({ error: 'مشتری با این شماره تلفن قبلاً ثبت شده است' });
            }
        }

        await client.update({
            name,
            phone,
            propertyType,
            area,
            city,
            budget: budget ? parseInt(budget) : null,
            description,
            isActive: isActive !== undefined ? isActive : client.isActive
        });

        res.json({
            message: 'مشتری با موفقیت ویرایش شد',
            client
        });

    } catch (error) {
        console.error('خطا در ویرایش مشتری:', error);
        res.status(500).json({ error: 'خطا در ویرایش مشتری', detail: error.message });
    }
});

// 📌 حذف مشتری
router.delete('/clients/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const client = await Client.findOne({
            where: { 
                id,
                userId: req.user.id 
            }
        });

        if (!client) {
            return res.status(404).json({ error: 'مشتری یافت نشد' });
        }

        await client.destroy();

        res.json({
            message: 'مشتری با موفقیت حذف شد'
        });

    } catch (error) {
        console.error('خطا در حذف مشتری:', error);
        res.status(500).json({ error: 'خطا در حذف مشتری', detail: error.message });
    }
});

// 📌 دریافت فایل‌های مرتبط با مشتری
router.get('/clients/:id/files', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const client = await Client.findOne({
            where: { 
                id,
                userId: req.user.id 
            }
        });

        if (!client) {
            return res.status(404).json({ error: 'مشتری یافت نشد' });
        }

        // دریافت فایل‌های مرتبط با مشتری
        const clientFiles = await ClientFile.findAll({
            where: { 
                clientId: id,
                userId: req.user.id 
            },
            order: [['createdAt', 'DESC']]
        });

        // تبدیل فایل‌ها به فرمت مناسب
        const files = clientFiles.map(file => ({
            id: file.id,
            filename: file.filename,
            filePath: file.filePath,
            fileType: file.fileType,
            title: file.title || file.filename,
            description: file.description,
            isNew: file.isNew,
            isRead: file.isRead,
            matchScore: file.matchScore,
            createdAt: file.createdAt,
            updatedAt: file.updatedAt
        }));

        res.json({
            message: 'فایل‌های مشتری با موفقیت دریافت شد',
            files,
            client
        });

    } catch (error) {
        console.error('خطا در دریافت فایل‌های مشتری:', error);
        res.status(500).json({ error: 'خطا در دریافت فایل‌های مشتری', detail: error.message });
    }
});

// 📌 افزودن فایل به مشتری
router.post('/clients/:id/files', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { filename, filePath, fileType, title, description, matchScore, metadata } = req.body;

        const client = await Client.findOne({
            where: { 
                id,
                userId: req.user.id 
            }
        });

        if (!client) {
            return res.status(404).json({ error: 'مشتری یافت نشد' });
        }

        // بررسی وجود فایل
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'فایل یافت نشد' });
        }

        const clientFile = await ClientFile.create({
            clientId: id,
            userId: req.user.id,
            filename,
            filePath,
            fileType: fileType || 'property',
            title: title || filename,
            description,
            matchScore,
            metadata,
            isNew: true,
            isRead: false
        });

        res.status(201).json({
            message: 'فایل با موفقیت به مشتری اضافه شد',
            file: clientFile
        });

    } catch (error) {
        console.error('خطا در افزودن فایل به مشتری:', error);
        res.status(500).json({ error: 'خطا در افزودن فایل به مشتری', detail: error.message });
    }
});

// 📌 علامت‌گذاری فایل به عنوان خوانده شده
router.patch('/clients/:clientId/files/:fileId/read', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { clientId, fileId } = req.params;

        const clientFile = await ClientFile.findOne({
            where: { 
                id: fileId,
                clientId,
                userId: req.user.id 
            }
        });

        if (!clientFile) {
            return res.status(404).json({ error: 'فایل یافت نشد' });
        }

        await clientFile.update({
            isRead: true,
            isNew: false
        });

        res.json({
            message: 'فایل با موفقیت علامت‌گذاری شد',
            file: clientFile
        });

    } catch (error) {
        console.error('خطا در علامت‌گذاری فایل:', error);
        res.status(500).json({ error: 'خطا در علامت‌گذاری فایل', detail: error.message });
    }
});

// 📌 حذف فایل از مشتری
router.delete('/clients/:clientId/files/:fileId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { clientId, fileId } = req.params;

        const clientFile = await ClientFile.findOne({
            where: { 
                id: fileId,
                clientId,
                userId: req.user.id 
            }
        });

        if (!clientFile) {
            return res.status(404).json({ error: 'فایل یافت نشد' });
        }

        await clientFile.destroy();

        res.json({
            message: 'فایل با موفقیت حذف شد'
        });

    } catch (error) {
        console.error('خطا در حذف فایل:', error);
        res.status(500).json({ error: 'خطا در حذف فایل', detail: error.message });
    }
});

// 📌 دریافت آمار فایل‌های جدید برای مشتری
router.get('/clients/:id/files/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const client = await Client.findOne({
            where: { 
                id,
                userId: req.user.id 
            }
        });

        if (!client) {
            return res.status(404).json({ error: 'مشتری یافت نشد' });
        }

        const stats = await ClientFile.findAll({
            where: { 
                clientId: id,
                userId: req.user.id 
            },
            attributes: [
                'isNew',
                'isRead',
                'fileType',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['isNew', 'isRead', 'fileType']
        });

        const formattedStats = {
            total: 0,
            new: 0,
            read: 0,
            unread: 0,
            byType: {}
        };

        stats.forEach(stat => {
            const count = parseInt(stat.getDataValue('count'));
            formattedStats.total += count;
            
            if (stat.isNew) {
                formattedStats.new += count;
            }
            
            if (stat.isRead) {
                formattedStats.read += count;
            } else {
                formattedStats.unread += count;
            }
            
            const fileType = stat.fileType;
            if (!formattedStats.byType[fileType]) {
                formattedStats.byType[fileType] = 0;
            }
            formattedStats.byType[fileType] += count;
        });

        res.json({
            message: 'آمار فایل‌های مشتری با موفقیت دریافت شد',
            stats: formattedStats
        });

    } catch (error) {
        console.error('خطا در دریافت آمار فایل‌ها:', error);
        res.status(500).json({ error: 'خطا در دریافت آمار فایل‌ها', detail: error.message });
    }
});

// 📌 یافتن تطبیق‌های ملک برای مشتری
router.get('/clients/:id/matches', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const client = await Client.findOne({
            where: { 
                id,
                userId: req.user.id 
            }
        });

        if (!client) {
            return res.status(404).json({ error: 'مشتری یافت نشد' });
        }

        // ساخت فیلترهای تطبیق بر اساس نیازهای مشتری
        const whereClause = {
            type: client.propertyType
        };

        // فیلتر بر اساس شهر
        if (client.city) {
            whereClause['$city.name$'] = { [Op.iLike]: `%${client.city}%` };
        }

        // فیلتر بر اساس متراژ (اگر قابل تجزیه باشد)
        if (client.area) {
            const areaRange = parseAreaRange(client.area);
            if (areaRange) {
                whereClause.metraj = {
                    [Op.between]: [areaRange.min, areaRange.max]
                };
            }
        }

        const matches = await Property.findAll({
            where: whereClause,
            include: [
                {
                    model: City,
                    as: 'city',
                    attributes: ['id', 'name']
                },
                {
                    model: Neighborhood,
                    as: 'neighborhood',
                    attributes: ['id', 'name']
                },
                {
                    model: SaleDetail,
                    as: 'saleDetail'
                },
                {
                    model: RentDetail,
                    as: 'rentDetail'
                }
            ],
            limit: 50,
            order: [['createdAt', 'DESC']]
        });

        res.json({
            message: 'تطبیق‌های یافت شده با موفقیت دریافت شد',
            matches,
            client
        });

    } catch (error) {
        console.error('خطا در یافتن تطبیق‌ها:', error);
        res.status(500).json({ error: 'خطا در یافتن تطبیق‌ها', detail: error.message });
    }
});

// 📌 عملیات گروهی روی مشتریان
router.post('/clients/bulk', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { action, clientIds } = req.body;

        if (!clientIds || !Array.isArray(clientIds) || clientIds.length === 0) {
            return res.status(400).json({ error: 'لیست مشتریان نامعتبر است' });
        }

        const clients = await Client.findAll({
            where: { 
                id: { [Op.in]: clientIds },
                userId: req.user.id 
            }
        });

        if (clients.length === 0) {
            return res.status(404).json({ error: 'هیچ مشتری‌ای یافت نشد' });
        }

        switch (action) {
            case 'activate':
                await Promise.all(clients.map(client => client.update({ isActive: true })));
                break;
            case 'deactivate':
                await Promise.all(clients.map(client => client.update({ isActive: false })));
                break;
            case 'delete':
                await Promise.all(clients.map(client => client.destroy()));
                break;
            default:
                return res.status(400).json({ error: 'عملیات نامعتبر است' });
        }

        res.json({
            message: `عملیات ${action} با موفقیت روی ${clients.length} مشتری انجام شد`
        });

    } catch (error) {
        console.error('خطا در انجام عملیات گروهی:', error);
        res.status(500).json({ error: 'خطا در انجام عملیات گروهی', detail: error.message });
    }
});

// تابع کمکی برای تجزیه محدوده متراژ
function parseAreaRange(areaString) {
    if (!areaString) return null;
    
    const match = areaString.match(/(\d+)\s*-\s*(\d+)/);
    if (match) {
        return {
            min: parseInt(match[1]),
            max: parseInt(match[2])
        };
    }
    
    const singleMatch = areaString.match(/(\d+)/);
    if (singleMatch) {
        const value = parseInt(singleMatch[1]);
        return {
            min: Math.max(0, value - 20),
            max: value + 20
        };
    }
    
    return null;
}

module.exports = router; 