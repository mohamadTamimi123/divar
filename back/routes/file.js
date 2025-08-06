const express = require('express');
const router = express.Router();
const { Property, SaleDetail, RentDetail, City, Neighborhood } = require('../models');
const { Op } = require('sequelize');

/**
 * @swagger
 * /files:
 *   get:
 *     summary: دریافت لیست ملک‌ها
 *     tags: [Properties]
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
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [sale, rent, land, partnership]
 *         description: نوع ملک
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: نام شهر
 *       - in: query
 *         name: neighborhood
 *         schema:
 *           type: string
 *         description: نام محله (می‌تواند چندین محله با کاما جدا شود)
 *     responses:
 *       200:
 *         description: لیست ملک‌ها با موفقیت دریافت شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "لیست ملک‌ها با موفقیت دریافت شد"
 *                 properties:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Property'
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
 *       500:
 *         description: خطای سرور
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, type, city, neighborhood } = req.query;
        const offset = (page - 1) * limit;

        // ساخت فیلترها
        const whereClause = {};
        if (type) whereClause.type = type;

        // ساخت include array
        const includes = [
            {
                model: SaleDetail,
                as: 'saleDetail',
                required: false
            },
            {
                model: RentDetail,
                as: 'rentDetail',
                required: false
            },
            {
                model: City,
                as: 'city',
                required: false
            },
            {
                model: Neighborhood,
                as: 'neighborhood',
                required: false
            }
        ];

        // اضافه کردن فیلترهای شهر و محله
        if (city) {
            includes[2].where = { name: city };
            includes[2].required = true;
        }
        if (neighborhood) {
            // Handle multiple neighborhoods separated by comma
            const neighborhoods = neighborhood.split(',').map(n => n.trim());
            if (neighborhoods.length > 1) {
                includes[3].where = { name: { [Op.in]: neighborhoods } };
            } else {
                includes[3].where = { name: neighborhood };
            }
            includes[3].required = true;
        }

        const { count, rows: properties } = await Property.findAndCountAll({
            where: whereClause,
            include: includes,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            message: 'لیست ملک‌ها با موفقیت دریافت شد',
            properties,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems: count,
                itemsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('خطا در دریافت لیست ملک‌ها:', error);
        res.status(500).json({ error: 'خطا در دریافت لیست ملک‌ها', detail: error.message });
    }
});

/**
 * @swagger
 * /files/cities:
 *   get:
 *     summary: دریافت لیست شهرها
 *     tags: [Properties]
 *     responses:
 *       200:
 *         description: لیست شهرها با موفقیت دریافت شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "لیست شهرها با موفقیت دریافت شد"
 *                 cities:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["تهران", "اصفهان", "مشهد", "شیراز"]
 *       500:
 *         description: خطای سرور
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/cities', async (req, res) => {
    try {
        const cities = await City.findAll({ attributes: ['name'] });
        return res.json(cities.map(c => c.name));
    } catch (error) {
        return res.status(500).json({ error: 'خطا در دریافت شهرها', detail: error.message });
    }
});

/**
 * @swagger
 * /files/neighborhoods:
 *   get:
 *     summary: دریافت لیست محله‌ها برای شهر مشخص
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: نام شهر
 *     responses:
 *       200:
 *         description: لیست محله‌ها با موفقیت دریافت شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "لیست محله‌ها با موفقیت دریافت شد"
 *                 neighborhoods:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["شمال تهران", "مرکز تهران", "غرب تهران"]
 *       500:
 *         description: خطای سرور
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/neighborhoods', async (req, res) => {
    try {
        const { city } = req.query;
        
        if (!city) {
            return res.status(400).json({ error: 'نام شهر الزامی است' });
        }

        const cityRecord = await City.findOne({ where: { name: city } });
        
        if (!cityRecord) {
            return res.status(404).json({ error: 'شهر یافت نشد' });
        }

        const neighborhoods = await Neighborhood.findAll({
            where: { cityId: cityRecord.id },
            attributes: ['name'],
            order: [['name', 'ASC']]
        });

        return res.json(neighborhoods.map(n => n.name));
    } catch (error) {
        return res.status(500).json({ error: 'خطا در دریافت محله‌ها', detail: error.message });
    }
});

module.exports = router;
