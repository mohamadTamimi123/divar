const express = require('express');
const app = express();
const port = 5001;
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

const sequelize = require('./configs/database');

const fileRouter = require('./routes/file');
const rentFileRouter = require('./routes/rentFile');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const paymentRouter = require('./routes/payment');
const crawlerRouter = require('./routes/crawler');

app.use(cors());
app.use(express.json()); // برای پردازش JSON در request body

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Real Estate API Documentation',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
        docExpansion: 'list',
        filter: true,
        showRequestHeaders: true,
        tryItOutEnabled: true
    }
}));

app.use('/api/v1/files', fileRouter);
app.use('/api/v1/rent-files', rentFileRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/payment', paymentRouter);
app.use('/api/v1/crawler', crawlerRouter);

// Static files
app.use('/public/images', express.static(path.join(__dirname, '/public/images')));
app.use('/admin', express.static(path.join(__dirname, '/public/admin')));
app.use('/', express.static(path.join(__dirname, '/public')));

// Admin panel route
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin/index.html'));
});

app.get('/admin/crawler', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin/crawler.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

sequelize.authenticate()
    .then(() => console.log('✅ Database connection established.'))
    .catch(err => console.error('❌ Database connection failed:', err));

app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
    console.log(`🏢 Admin Panel: http://localhost:${port}/admin`);
});
