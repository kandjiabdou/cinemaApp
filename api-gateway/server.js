const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const promClient = require('prom-client');

const app = express();
const PORT = 8000;

// Configuration des métriques Prometheus
const register = promClient.register;
promClient.collectDefaultMetrics({ register });

// Métriques personnalisées
const httpRequestsTotal = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
});

const httpRequestDuration = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route'],
    buckets: [0.1, 0.5, 1, 2, 5]
});

const activeConnections = new promClient.Gauge({
    name: 'active_connections',
    help: 'Number of active connections'
});

register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestDuration);
register.registerMetric(activeConnections);

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

// Middleware pour collecter les métriques
app.use((req, res, next) => {
    const start = Date.now();
    activeConnections.inc();
    
    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const route = req.route ? req.route.path : req.path;
        
        httpRequestsTotal.inc({
            method: req.method,
            route: route,
            status_code: res.statusCode
        });
        
        httpRequestDuration.observe({
            method: req.method,
            route: route
        }, duration);
        
        activeConnections.dec();
    });
    
    next();
});

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

// Configuration des routes proxy avec adaptation Docker/Local
const isDocker = process.env.NODE_ENV === 'production';
const authServiceURL = isDocker ? 'http://auth-service:8100' : 'http://localhost:8100';
const cinemaServiceURL = isDocker ? 'http://cinema-service:8200' : 'http://localhost:8200';
const publicServiceURL = isDocker ? 'http://public-service:8300' : 'http://localhost:8300';

console.log('Proxy targets:', {
    auth: authServiceURL,
    cinema: cinemaServiceURL,
    public: publicServiceURL
});

const authServiceProxy = createProxyMiddleware({
    ...proxyOptions,
    target: authServiceURL,
    pathRewrite: {
        '^/auth': ''
    }
});

const cinemaServiceProxy = createProxyMiddleware({
    ...proxyOptions,
    target: cinemaServiceURL,
    pathRewrite: {
        '^/cinema': ''
    }
});

const publicServiceProxy = createProxyMiddleware({
    ...proxyOptions,
    target: publicServiceURL,
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

// Endpoint pour les métriques Prometheus
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
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