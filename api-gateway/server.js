const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

// Configuration des routes proxy
const authServiceProxy = createProxyMiddleware({
    target: 'http://localhost:8100',
    changeOrigin: true,
    pathRewrite: {
        '^/auth': ''
    }
});

const cinemaServiceProxy = createProxyMiddleware({
    target: 'http://localhost:8200',
    changeOrigin: true,
    pathRewrite: {
        '^/cinema': ''
    }
});

const publicServiceProxy = createProxyMiddleware({
    target: 'http://localhost:8300',
    changeOrigin: true,
    pathRewrite: {
        '^/public': ''
    }
});

// Routes
app.use('/auth', authServiceProxy);
app.use('/cinema', cinemaServiceProxy);
app.use('/public', publicServiceProxy);

// Route de santé
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'API Gateway is running' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`API Gateway running on port ${PORT}`);
}); 