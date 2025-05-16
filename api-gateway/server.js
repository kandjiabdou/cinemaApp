const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = 8000;

// Configuration CORS détaillée
const corsOptions = {
    origin: 'http://localhost:3000', // URL du frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Configuration commune pour les proxies
const proxyOptions = {
    changeOrigin: true,
    secure: false,
    timeout: 10000, // 10 secondes de timeout
    proxyTimeout: 10000,
    onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.status(500).json({
            error: 'Proxy Error',
            message: 'Erreur de connexion au service'
        });
    },
    onProxyReq: (proxyReq, req, res) => {
        // Log des requêtes sortantes
        console.log(`Proxy Request: ${req.method} ${req.url}`);
        if (req.body && (req.method === 'POST' || req.method === 'PUT')) {
            const bodyData = JSON.stringify(req.body);
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            proxyReq.write(bodyData);
        }
    },
    onProxyRes: (proxyRes, req, res) => {
        // Log des réponses
        console.log(`Proxy Response: ${proxyRes.statusCode} ${req.method} ${req.url}`);
    }
};

// Configuration des routes proxy
const authServiceProxy = createProxyMiddleware({
    ...proxyOptions,
    target: 'http://localhost:8100',
    pathRewrite: {
        '^/auth': ''
    }
});

const cinemaServiceProxy = createProxyMiddleware({
    ...proxyOptions,
    target: 'http://localhost:8200',
    pathRewrite: {
        '^/cinema': ''
    }
});

const publicServiceProxy = createProxyMiddleware({
    ...proxyOptions,
    target: 'http://localhost:8300',
    pathRewrite: {
        '^/public': ''
    }
});

// Middleware de logging des requêtes entrantes
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - Incoming Request: ${req.method} ${req.url}`);
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log('Request Body:', req.body);
    }
    next();
});

// Routes
app.use('/auth', authServiceProxy);
app.use('/cinema', cinemaServiceProxy);
app.use('/public', publicServiceProxy);

// Route de santé
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'API Gateway is running' });
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
    console.error('API Gateway Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`API Gateway running on port ${PORT}`);
}); 