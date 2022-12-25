var CryptoJS = require("crypto-js");
if (!require('../Src/SecurityCheck')()) {
    console.log("Ikaw ay nangongopya !");
    process.exit(0)
}
/**
 * I-encrypt ang text gamit ang CryptoJS library at ibalik ang naka-encrypt na text bilang Base64 string.
 * @param Data - Ang data na ie-encrypt.
 * @returns Isang string ng mga character na kumakatawan sa naka-encrypt na data.
 */
module.exports.Encrypt = function Encrypt(Data) {
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(Data));
};

/**
 * I-decrypt ang data gamit ang CryptoJS library, at ibalik ang na-decrypt na data bilang isang string.
 * @param Data - Ang data na ide-decrypt.
 * @returns Ang na-decrypt na data.
 */

module.exports.Decrypt = function Decrypt(Data) {
    return CryptoJS.enc.Base64.parse(Data).toString(CryptoJS.enc.Utf8);
};
