const express = require('express');
const https = require('https');
const http = require('http'); // Thêm module HTTP để fallback
const fs = require('fs');

const app = express();
const httpsPort = 443;
const httpPort = 80;

const privateKeyPath = '/etc/letsencrypt/live/alithw.qzz.io/privkey.pem';
const certificatePath = '/etc/letsencrypt/live/alithw.qzz.io/fullchain.pem';

let credentials;
let useHttps = true;
try {
    const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    const certificate = fs.readFileSync(certificatePath, 'utf8');
    credentials = { key: privateKey, cert: certificate };
} catch (err) {
    console.error("Không thể đọc file chứng chỉ SSL. Fallback sang HTTP.");
    useHttps = false;
}

app.use(express.static(__dirname));

app.use((req, res) => {
    res.status(404).sendFile(__dirname + '/404.html');
});

if (useHttps) {
    const httpsServer = https.createServer(credentials, app);
    httpsServer.listen(httpsPort, () => {
        console.log(`Server HTTPS đang chạy tại https://localhost:${httpsPort}`);
    });
} else {
    const httpServer = http.createServer(app);
    httpServer.listen(httpPort, () => {
        console.log(`Server HTTP đang chạy tại http://localhost:${httpPort}`);
    });
}