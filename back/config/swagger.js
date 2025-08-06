const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Real Estate API Documentation',
            version: '1.0.0',
            description: 'API documentation for Real Estate Management System',
            contact: {
                name: 'API Support',
                email: 'support@realestate.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:5001/api/v1',
                description: 'Development server'
            },
            {
                url: 'https://api.realestate.com/api/v1',
                description: 'Production server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'علی احمدی' },
                        email: { type: 'string', format: 'email', example: 'ali@example.com' },
                        phone: { type: 'string', example: '09123456789' },
                        role: { type: 'string', enum: ['user', 'admin', 'super_admin'], example: 'user' },
                        isActive: { type: 'boolean', example: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Property: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        title: { type: 'string', example: 'آپارتمان 75 متری' },
                        metraj: { type: 'string', example: '75 متر' },
                        city: { type: 'string', example: 'تهران' },
                        neighborhood: { type: 'string', example: 'شمال تهران' },
                        location: { type: 'string', example: 'خیابان ولیعصر' },
                        type: { type: 'string', enum: ['sale', 'rent', 'land', 'partnership'], example: 'sale' },
                        coverImage: { type: 'string', example: 'public/images/property_1/img_1.jpg' },
                        locationImage: { type: 'string', example: 'https://api.divar.ir/v8/mapimage?encrypted_data=...' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                SaleDetail: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        propertyId: { type: 'integer', example: 1 },
                        buildYear: { type: 'string', example: '1395' },
                        rooms: { type: 'string', example: '2 خوابه' },
                        totalPrice: { type: 'string', example: '2,500,000,000 تومان' },
                        pricePerMeter: { type: 'string', example: '33,333,333 تومان' },
                        elevator: { type: 'boolean', example: true },
                        parking: { type: 'boolean', example: true },
                        storage: { type: 'boolean', example: false },
                        description: { type: 'string', example: 'آپارتمان زیبا و مدرن' },
                        imageLinks: { type: 'array', items: { type: 'string' } },
                        localImages: { type: 'array', items: { type: 'string' } }
                    }
                },
                RentDetail: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        propertyId: { type: 'integer', example: 1 },
                        buildYear: { type: 'string', example: '1395' },
                        rooms: { type: 'string', example: '2 خوابه' },
                        deposit: { type: 'string', example: '500,000,000 تومان' },
                        rent: { type: 'string', example: '8,000,000 تومان' },
                        elevator: { type: 'boolean', example: true },
                        parking: { type: 'boolean', example: true },
                        storage: { type: 'boolean', example: false },
                        description: { type: 'string', example: 'آپارتمان اجاره‌ای' },
                        imageLinks: { type: 'array', items: { type: 'string' } },
                        localImages: { type: 'array', items: { type: 'string' } }
                    }
                },
                Payment: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        userId: { type: 'integer', example: 1 },
                        amount: { type: 'integer', example: 199000 },
                        description: { type: 'string', example: 'پرداخت اشتراک ویژه - ماهانه' },
                        gateway: { type: 'string', example: 'zarinpal' },
                        authority: { type: 'string', example: 'A000000000000000000000000000000000000' },
                        refId: { type: 'string', example: '123456789' },
                        status: { type: 'string', enum: ['pending', 'success', 'failed', 'cancelled'], example: 'success' },
                        callbackUrl: { type: 'string', example: 'http://localhost:5001/api/v1/payment/verify' },
                        returnUrl: { type: 'string', example: 'http://localhost:3000/payment/result' },
                        metadata: { type: 'object' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Client: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        userId: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'احمد محمدی' },
                        phone: { type: 'string', example: '09123456789' },
                        propertyType: { type: 'string', enum: ['sale', 'rent', 'land', 'partnership'], example: 'sale' },
                        area: { type: 'string', example: '100-150' },
                        city: { type: 'string', example: 'تهران' },
                        budget: { type: 'integer', example: 500000000 },
                        description: { type: 'string', example: 'آپارتمان 2 خوابه در شمال تهران' },
                        isActive: { type: 'boolean', example: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                SubscriptionPlan: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'premium' },
                        name: { type: 'string', example: 'اشتراک ویژه' },
                        description: { type: 'string', example: 'دسترسی کامل به تمام امکانات' },
                        features: { type: 'array', items: { type: 'string' } },
                        price: {
                            type: 'object',
                            properties: {
                                monthly: { type: 'integer', example: 199000 },
                                yearly: { type: 'integer', example: 1990000 }
                            }
                        },
                        duration: {
                            type: 'object',
                            properties: {
                                monthly: { type: 'integer', example: 30 },
                                yearly: { type: 'integer', example: 365 }
                            }
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: { type: 'string', example: 'خطا در پردازش درخواست' },
                        detail: { type: 'string', example: 'جزئیات خطا' }
                    }
                },
                Success: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'عملیات با موفقیت انجام شد' },
                        data: { type: 'object' }
                    }
                }
            }
        },
        tags: [
            {
                name: 'Authentication',
                description: 'عملیات احراز هویت و مدیریت کاربران'
            },
            {
                name: 'Properties',
                description: 'مدیریت ملک‌ها و آگهی‌ها'
            },
            {
                name: 'Admin',
                description: 'مدیریت کاربران و سیستم (فقط ادمین)'
            },
            {
                name: 'Payment',
                description: 'پرداخت و اشتراک'
            },
            {
                name: 'Clients',
                description: 'مدیریت مشتریان و تطبیق ملک‌ها'
            }
        ]
    },
    apis: [
        './routes/*.js',
        './models/*.js'
    ]
};

const specs = swaggerJsdoc(options);

module.exports = specs; 