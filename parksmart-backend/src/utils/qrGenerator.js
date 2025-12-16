const QRCode = require('qrcode');
const crypto = require('crypto');

/**
 * Generate QR code for reservation
 * @param {Object} data - Data to encode in QR code
 * @returns {Promise<String>} Base64 encoded QR code
 */
const generateQRCode = async (data) => {
    try {
        // Create a unique hash for security
        const hash = crypto
            .createHash('sha256')
            .update(JSON.stringify(data))
            .digest('hex')
            .substring(0, 16);

        const qrData = {
            ...data,
            hash,
        };

        // Generate QR code as base64
        const qrCodeBase64 = await QRCode.toDataURL(JSON.stringify(qrData), {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 300,
            margin: 2,
        });

        return qrCodeBase64;
    } catch (error) {
        throw new Error(`QR Code generation failed: ${error.message}`);
    }
};

/**
 * Verify QR code data
 * @param {String} qrDataString - QR code data as string
 * @returns {Object} Parsed and verified data
 */
const verifyQRCode = (qrDataString) => {
    try {
        const data = JSON.parse(qrDataString);

        // Recreate hash to verify integrity
        const { hash, ...originalData } = data;
        const expectedHash = crypto
            .createHash('sha256')
            .update(JSON.stringify(originalData))
            .digest('hex')
            .substring(0, 16);

        if (hash !== expectedHash) {
            throw new Error('QR code has been tampered with');
        }

        return originalData;
    } catch (error) {
        throw new Error(`QR Code verification failed: ${error.message}`);
    }
};

module.exports = {
    generateQRCode,
    verifyQRCode,
};
