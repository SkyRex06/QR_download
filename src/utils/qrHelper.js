import QRCode from 'qrcode';

/**
 * Validates and normalizes an input URL string.
 * Automatically adds 'https://' if the user omitted the protocol.
 * @param {string} input 
 * @returns {{ isValid: boolean, normalizedUrl: string, error: string | null }}
 */
export function validateAndNormalizeUrl(input) {
  const trimmed = (input || '').trim();

  if (!trimmed) {
    return {
      isValid: false,
      normalizedUrl: '',
      error: 'Please enter or paste a link to generate a QR code.',
    };
  }

  let candidate = trimmed;

  if (!/^https?:\/\//i.test(candidate)) {
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(candidate)) {
      return {
        isValid: false,
        normalizedUrl: '',
        error: 'Only standard web links (http:// or https://) are supported.',
      };
    }

    const domainPattern = /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+(:\d+)?(\/.*)?$/;
    if (domainPattern.test(candidate)) {
      candidate = `https://${candidate}`;
    } else {
      return {
        isValid: false,
        normalizedUrl: '',
        error: 'Please enter a valid link (e.g., https://example.com).',
      };
    }
  }

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return {
        isValid: false,
        normalizedUrl: '',
        error: 'Please enter a valid web link starting with http:// or https://',
      };
    }

    if (!parsed.hostname || (parsed.hostname !== 'localhost' && !parsed.hostname.includes('.'))) {
      return {
        isValid: false,
        normalizedUrl: '',
        error: 'Please enter a valid domain name (e.g., example.com).',
      };
    }

    return {
      isValid: true,
      normalizedUrl: parsed.href,
      error: null,
    };
  } catch (err) {
    return {
      isValid: false,
      normalizedUrl: '',
      error: 'The entered URL is not formatted correctly.',
    };
  }
}

/**
 * Renders pure QR code to an offscreen canvas at high resolution.
 * Matrix is 100% unobstructed for maximum scanning reliability.
 */
async function createPureQRCanvas(text, size, darkColor, lightColor) {
  const canvas = document.createElement('canvas');
  await QRCode.toCanvas(canvas, text, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: size,
    color: {
      dark: darkColor || '#0f172a',
      light: lightColor || '#ffffff',
    },
  });
  return canvas;
}

/**
 * Renders the Client Presentation Card on a canvas element.
 * Features:
 * - Luxury header with name (e.g. VADEHI) in premium typography
 * - Completely untouched, 100% scannable QR code in center (never covers any QR modules)
 * - Clean URL and scan instruction badge at bottom
 *
 * @param {HTMLCanvasElement} targetCanvas 
 * @param {string} url 
 * @param {object} options 
 */
export async function renderClientCardToCanvas(targetCanvas, url, options = {}) {
  const name = (options.name || 'VADEHI').trim();
  const darkColor = options.darkColor || '#0f172a';
  const cardWidth = options.width || 1200;
  
  // Aspect ratio for an executive client presentation card
  const cardHeight = Math.floor(cardWidth * 1.34);
  
  targetCanvas.width = cardWidth;
  targetCanvas.height = cardHeight;
  const ctx = targetCanvas.getContext('2d');

  // 1. Draw Card Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, cardWidth, cardHeight);

  // Subtle outer luxury frame border
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.08)';
  ctx.lineWidth = Math.max(2, cardWidth * 0.003);
  ctx.strokeRect(
    cardWidth * 0.03,
    cardWidth * 0.03,
    cardWidth * 0.94,
    cardHeight - cardWidth * 0.06
  );

  // 2. Render Header with VADEHI in premium typography
  const formattedName = name.toUpperCase().split('').join(' ');
  const titleY = cardWidth * 0.13;

  ctx.save();
  ctx.fillStyle = darkColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Luxury brand title
  const titleFontSize = Math.floor(cardWidth * 0.058);
  ctx.font = `800 ${titleFontSize}px 'Montserrat', 'Outfit', sans-serif`;
  ctx.fillText(formattedName, cardWidth / 2, titleY);

  // Decorative subtle accent line with diamond dot
  const lineY = titleY + cardWidth * 0.045;
  const lineHalfWidth = cardWidth * 0.18;
  const cx = cardWidth / 2;

  ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(cx - lineHalfWidth, lineY);
  ctx.lineTo(cx - 15, lineY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx + 15, lineY);
  ctx.lineTo(cx + lineHalfWidth, lineY);
  ctx.stroke();

  // Center diamond accent
  ctx.fillStyle = '#6366f1';
  ctx.beginPath();
  ctx.arc(cx, lineY, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Subtitle "SCAN TO VISIT"
  ctx.font = `600 ${Math.floor(cardWidth * 0.024)}px 'Outfit', sans-serif`;
  ctx.fillStyle = '#64748b';
  ctx.fillText('SCAN TO VISIT LINK', cx, lineY + cardWidth * 0.04);
  ctx.restore();

  // 3. Render 100% Clean QR Code (No modules blocked)
  const qrSize = Math.floor(cardWidth * 0.72);
  const qrX = (cardWidth - qrSize) / 2;
  const qrY = cardWidth * 0.26;

  const qrCanvas = await createPureQRCanvas(url, qrSize, darkColor, '#ffffff');

  // Draw QR code with subtle soft shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.06)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 6;
  ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);
  ctx.restore();

  // 4. Render Footer Badge & Target URL
  const footerY = qrY + qrSize + cardWidth * 0.05;
  
  // Truncate URL gracefully if too long
  let displayUrl = url.replace(/^https?:\/\/(www\.)?/, '');
  if (displayUrl.length > 36) {
    displayUrl = displayUrl.substring(0, 34) + '...';
  }

  // Draw bottom pill
  const pillHeight = cardWidth * 0.058;
  const pillWidth = Math.min(cardWidth * 0.75, cardWidth * 0.65);
  const pillX = (cardWidth - pillWidth) / 2;
  const pillY = footerY;
  const pillRadius = pillHeight / 2;

  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.04)';
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillWidth, pillHeight, pillRadius);
  ctx.fill();
  ctx.stroke();

  // URL text
  ctx.fillStyle = '#1e293b';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `600 ${Math.floor(cardWidth * 0.027)}px 'JetBrains Mono', monospace`;
  ctx.fillText(displayUrl, cx, pillY + pillHeight / 2);
  ctx.restore();
}

/**
 * Renders high resolution preview onto the visible canvas.
 */
export async function renderQRToCanvas(canvas, text, options = {}) {
  return renderClientCardToCanvas(canvas, text, options);
}

/**
 * Generates high-resolution PNG data URL for the Client Card.
 * @param {string} text 
 * @param {object} options 
 * @returns {Promise<string>}
 */
export async function generateClientCardDataUrl(text, options = {}) {
  const offscreen = document.createElement('canvas');
  await renderClientCardToCanvas(offscreen, text, {
    ...options,
    width: 1400, // Ultra-high resolution 1400px wide
  });
  return offscreen.toDataURL('image/png');
}

/**
 * Generates high-resolution PNG data URL for pure square QR code.
 * @param {string} text 
 * @param {object} options 
 * @returns {Promise<string>}
 */
export async function generatePureQRDataUrl(text, options = {}) {
  const canvas = await createPureQRCanvas(text, 1400, options.darkColor, '#ffffff');
  return canvas.toDataURL('image/png');
}

/**
 * Downloads a data URL as an image file.
 * @param {string} dataUrl 
 * @param {string} filename 
 */
export function downloadDataUrl(dataUrl, filename = 'vadehi-qr.png') {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
