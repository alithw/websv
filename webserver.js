const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');

const app = express();
const port = 3000;

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

app.use(compression());

app.use(express.static(__dirname, {
    maxAge: '1d',
    etag: true
}));

// GIỮ LẠI: Xử lý CORS.
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, '404.html'), (err) => {
        if (err) {
            res.send("404: Page Not Found");
        }
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(port, () => {
    console.log(`🚀 Server HTTP đang lắng nghe trên cổng ${port}, sẵn sàng nhận yêu cầu từ Nginx.`);
});