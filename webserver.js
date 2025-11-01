const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');

// Khởi tạo Express app
const app = express();
const httpsPort = 3000;
const httpPort = 3001;

// Đường dẫn SSL
const sslConfig = {
    privateKeyPath: '/etc/letsencrypt/live/alithw.qzz.io/privkey.pem',
    certificatePath: '/etc/letsencrypt/live/alithw.qzz.io/fullchain.pem'
};

// Middleware bảo mật
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "https:", "data:"],
            scriptSrc: ["'self'", "'unsafe-inline'"]
        }
    }
}));

// Middleware nén dữ liệu
app.use(compression());

// Phục vụ tệp tĩnh với cache
app.use(express.static(__dirname, {
    maxAge: '1d',
    etag: true
}));

// Xử lý CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Xử lý lỗi 404
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '404.html'));
});

// Xử lý lỗi chung
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Đã xảy ra lỗi!');
});

// Khởi động server
async function startServer() {
    try {
        // Thử khởi động HTTPS
        try {
            const privateKey = fs.readFileSync(sslConfig.privateKeyPath, 'utf8');
            const certificate = fs.readFileSync(sslConfig.certificatePath, 'utf8');
            const credentials = { key: privateKey, cert: certificate };

            const httpsServer = https.createServer(credentials, app);
            httpsServer.listen(httpsPort, () => {
                console.log(`🚀 Server HTTPS đang chạy tại https://localhost:${httpsPort}`);
            });
        } catch (sslError) {
            console.warn("⚠️ Không thể khởi động HTTPS, chuyển sang HTTP...");
            console.error(sslError.message);
            
            // Fallback sang HTTP
            const httpServer = http.createServer(app);
            httpServer.listen(httpPort, () => {
                console.log(`🚀 Server HTTP đang chạy tại http://localhost:${httpPort}`);
            });
        }
    } catch (error) {
        console.error("❌ Lỗi khởi động server:", error.message);
        process.exit(1);
    }
}

startServer();