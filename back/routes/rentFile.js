const express = require('express');
const router = express.Router();
const { Property, RentDetail, City, Neighborhood } = require('../models');

// 📌 Read all Properties with RentDetail
router.get('/', async (req, res) => {
    try {
        const properties = await Property.findAll({
            include: [
                { model: RentDetail, as: 'rentDetail', required: true },
                { model: City, as: 'city', attributes: ['name'] },
                { model: Neighborhood, as: 'neighborhood', attributes: ['name'] },
            ]
        });
        // فقط نام شهر و محله را نمایش بده و cityId/neighborhoodId را حذف کن
        const result = properties.map(p => {
            const obj = p.toJSON();
            obj.city = obj.city ? obj.city.name : null;
            obj.neighborhood = obj.neighborhood ? obj.neighborhood.name : null;
            delete obj.cityId;
            delete obj.neighborhoodId;
            return obj;
        });
        return res.json(result);
    } catch (error) {
        return res.status(500).json({ error: 'خطا در دریافت ملک‌های اجاره‌ای', detail: error.message });
    }
});

module.exports = router;
