/**
 * QR Code Generator Utility
 * --------------------------
 * Uses 'qrcode' package to generate base64 PNG Data URLs
 * for any given text (e.g., book._id).
 */

import QRCode from "qrcode";

/**
 * @param {string} text - The text to encode into QR code.
 * @returns {Promise<string>} Base64 Data URL of generated QR code.
 */
export const generateQRCode = async (text) => {
  try {
    const qrDataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: "H",
      type: "image/png",
      width: 300,
    });
    return qrDataUrl;
  } catch (error) {
    console.error("QR generation failed:", error);
    throw new Error("Failed to generate QR code");
  }
};
