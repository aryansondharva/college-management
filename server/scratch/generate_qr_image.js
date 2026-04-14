const QRCode = require('qrcode');
const path = require('path');

const downloadUrl = 'https://expo.dev/artifacts/eas/huJF2jD46RYPgJuJjBa2yg.apk';
const outputPath = path.join(__dirname, 'update_qr.png');

QRCode.toFile(outputPath, downloadUrl, {
    color: {
        dark: '#000000',
        light: '#ffffff'
    },
    width: 500,
    margin: 2
}, function (err) {
    if (err) throw err;
    console.log('QR code generated at: ' + outputPath);
});
