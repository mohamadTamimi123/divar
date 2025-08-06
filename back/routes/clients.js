const express = require('express');
const router = express.Router();
const { Client, Property, SaleDetail, RentDetail, City, Neighborhood, ClientFile } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { Op } = require('sequelize');

/**
 * @swagger
 * /api/v1/clients:
 *   get:
 *     summary: دریافت لیست مشتریان کاربر
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: لیست مشتریان با موفقیت دریافت شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 clients:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Client'
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const clients = await Client.findAll({
            where: { 
                userId: req.user.id,
                isActive: true 
            },
            order: [['createdAt', 'DESC']]
        });

        res.json({
            message: 'لیست مشتریان با موفقیت دریافت شد',
            clients
        });
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ error: 'خطا در دریافت مشتریان' });
    }
});

/**
 * @swagger
 * /api/v1/clients:
 *   post:
 *     summary: افزودن مشتری جدید
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *               - propertyType
 *               - area
 *               - city
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               propertyType:
 *                 type: string
 *                 enum: [sale, rent, land, partnership]
 *               area:
 *                 type: string
 *               city:
 *                 type: string
 *               budget:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: مشتری با موفقیت اضافه شد
 *       400:
 *         description: خطا در ورودی
 */
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { name, phone, propertyType, area, city, budget, description } = req.body;

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
        console.error('Error creating client:', error);
        res.status(500).json({ error: 'خطا در ایجاد مشتری' });
    }
});

/**
 * @swagger
 * /api/v1/clients/{id}:
 *   get:
 *     summary: دریافت اطلاعات یک مشتری خاص
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: اطلاعات مشتری با موفقیت دریافت شد
 *       404:
 *         description: مشتری یافت نشد
 */
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const client = await Client.findOne({
            where: { 
                id: req.params.id,
                userId: req.user.id 
            }
        });

        if (!client) {
            return res.status(404).json({ error: 'مشتری یافت نشد' });
        }

        res.json({
            message: 'اطلاعات مشتری با موفقیت دریافت شد',
            client
        });
    } catch (error) {
        console.error('Error fetching client:', error);
        res.status(500).json({ error: 'خطا در دریافت اطلاعات مشتری' });
    }
});

/**
 * @swagger
 * /api/v1/clients/{id}:
 *   put:
 *     summary: ویرایش مشتری
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Client'
 *     responses:
 *       200:
 *         description: مشتری با موفقیت ویرایش شد
 *       404:
 *         description: مشتری یافت نشد
 */
router.put('/:id', authenticateToken, async (req, res) => {
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
        console.error('Error updating client:', error);
        res.status(500).json({ error: 'خطا در ویرایش مشتری' });
    }
});

/**
 * @swagger
 * /api/v1/clients/{id}:
 *   delete:
 *     summary: حذف مشتری
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: مشتری با موفقیت حذف شد
 *       404:
 *         description: مشتری یافت نشد
 */
router.delete('/:id', authenticateToken, async (req, res) => {
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
        console.error('Error deleting client:', error);
        res.status(500).json({ error: 'خطا در حذف مشتری' });
    }
});

/**
 * @swagger
 * /api/v1/clients/{id}/files:
 *   get:
 *     summary: دریافت فایل‌های مرتبط با مشتری
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: فایل‌های مشتری با موفقیت دریافت شد
 *       404:
 *         description: مشتری یافت نشد
 */
router.get('/:id/files', authenticateToken, async (req, res) => {
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

/**
 * @swagger
 * /api/v1/clients/{id}/matches:
 *   get:
 *     summary: یافتن تطبیق‌های ملک برای مشتری
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: تطبیق‌های یافت شده با موفقیت دریافت شد
 *       404:
 *         description: مشتری یافت نشد
 */
router.get('/:id/matches', authenticateToken, async (req, res) => {
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