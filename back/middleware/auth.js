const jwt = require('jsonwebtoken');
const { User } = require('../models');

// JWT Secret Key (همان کلید در auth.js)
const JWT_SECRET = 'your-secret-key-here';

// Middleware برای احراز هویت
const authenticateToken = async (req, res, next) => {
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

        if (!user.isActive) {
            return res.status(401).json({ error: 'حساب کاربری غیرفعال است' });
        }

        req.user = user;
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'توکن نامعتبر است' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'توکن منقضی شده است' });
        }
        
        console.error('خطا در احراز هویت:', error);
        res.status(500).json({ error: 'خطا در احراز هویت' });
    }
};

// Middleware برای بررسی نقش کاربر
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'کاربر احراز هویت نشده است' });
        }

        // تبدیل آرایه به آرایه اگر رشته باشد
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: 'دسترسی غیرمجاز',
                message: `این عملیات فقط برای نقش‌های ${allowedRoles.join(', ')} مجاز است`
            });
        }

        next();
    };
};

// Middleware های آماده برای نقش‌های مختلف
const requireUser = requireRole('user');
const requireAdmin = requireRole(['admin', 'super_admin']);
const requireSuperAdmin = requireRole('super_admin');

// Middleware برای بررسی مالکیت (کاربر فقط می‌تواند داده‌های خودش را ببیند)
const requireOwnership = (modelName, idField = 'userId') => {
    return async (req, res, next) => {
        try {
            const itemId = req.params.id || req.body[idField];
            
            if (!itemId) {
                return res.status(400).json({ error: 'شناسه مورد نیاز است' });
            }

            // سوپر ادمین و ادمین همه چیز را می‌بینند
            if (req.user.role === 'super_admin' || req.user.role === 'admin') {
                return next();
            }

            // کاربر عادی فقط داده‌های خودش را می‌بیند
            const item = await req.app.locals.models[modelName].findByPk(itemId);
            
            if (!item) {
                return res.status(404).json({ error: 'مورد یافت نشد' });
            }

            if (item[idField] !== req.user.id) {
                return res.status(403).json({ error: 'دسترسی غیرمجاز' });
            }

            next();

        } catch (error) {
            console.error('خطا در بررسی مالکیت:', error);
            res.status(500).json({ error: 'خطا در بررسی دسترسی' });
        }
    };
};

module.exports = {
    authenticateToken,
    requireRole,
    requireUser,
    requireAdmin,
    requireSuperAdmin,
    requireOwnership
}; 