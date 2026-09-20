import React, { useEffect, useRef, useState } from 'react';
import { Download, Copy, Check, ExternalLink, RefreshCw, Palette, Sparkles, ShieldCheck } from 'lucide-react';
import {
  renderQRToCanvas,
  generateClientCardDataUrl,
  generatePureQRDataUrl,
  downloadDataUrl,
} from '../utils/qrHelper';

const COLOR_PRESETS = [
  { name: 'Midnight Onyx', value: '#0f172a' },
  { name: 'Royal Indigo', value: '#312e81' },
  { name: 'Emerald Forest', value: '#064e3b' },
  { name: 'Deep Burgundy', value: '#881337' },
];

export default function QRCard({ generatedUrl, name, onGenerateAnother }) {
  const canvasRef = useRef(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#0f172a');
  const [isDownloading, setIsDownloading] = useState(false);
  const [exportFormat, setExportFormat] = useState('card'); // 'card' | 'pure'

  // Render client card preview whenever URL, color, or name changes
  useEffect(() => {
    if (canvasRef.current && generatedUrl) {
      renderQRToCanvas(canvasRef.current, generatedUrl, {
        name: name || 'VADEHI',
        darkColor: selectedColor,
        width: 600,
      }).catch((err) => {
        console.error('Failed to render client card:', err);
      });
    }
  }, [generatedUrl, name, selectedColor]);

  // Handle Download (Client Card or Pure QR)
  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const safeName = (name || 'vadehi').toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      if (exportFormat === 'card') {
        const dataUrl = await generateClientCardDataUrl(generatedUrl, {
          name: name || 'VADEHI',
          darkColor: selectedColor,
        });
        downloadDataUrl(dataUrl, `${safeName}-client-card.png`);
      } else {
        const dataUrl = await generatePureQRDataUrl(generatedUrl, {
          darkColor: selectedColor,
        });
        downloadDataUrl(dataUrl, `${safeName}-qr-code.png`);
      }
    } catch (err) {
      console.error('Error downloading QR code:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle Copy Image to Clipboard
  const handleCopyImage = async () => {
    try {
      if (!canvasRef.current) return;
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        try {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          setCopiedImage(true);
          setTimeout(() => setCopiedImage(false), 2000);
        } catch (copyErr) {
          console.warn('Clipboard writeImage not supported:', copyErr);
          handleDownload();
        }
      });
    } catch (err) {
      console.error('Copy image failed:', err);
    }
  };

  // Handle Copy URL
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    <div className="qr-result-section">
      {/* Client Safe Scannability Badge */}
      <div className="client-safe-badge">
        <ShieldCheck size={15} className="safe-icon" />
        <span>100% Scanner-Safe: QR modules are fully unobstructed for guaranteed scanning</span>
      </div>

      {/* Frame displaying the Client Presentation Card */}
      <div className="qr-frame-outer client-card-frame" title="Client Ready QR Card">
        <canvas
          id="qr-canvas-preview"
          ref={canvasRef}
          className="qr-card-canvas"
          role="img"
          aria-label={`QR Card for ${name || 'VADEHI'} pointing to ${generatedUrl}`}
        />
      </div>

      {/* Target URL Information Bar */}
      <div className="encoded-url-badge">
        <ExternalLink size={14} className="url-badge-icon" />
        <span className="encoded-url-text" title={generatedUrl}>
          {generatedUrl}
        </span>
        <button
          type="button"
          className="url-badge-copy-btn"
          onClick={handleCopyUrl}
          title="Copy exact link"
        >
          {copiedUrl ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
          <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Format Switcher & Color Customizer */}
      <div className="customizer-grid">
        <div className="export-format-selector">
          <span className="control-label">Export Style:</span>
          <div className="format-pills">
            <button
              type="button"
              className={`format-pill-btn ${exportFormat === 'card' ? 'active' : ''}`}
              onClick={() => setExportFormat('card')}
            >
              Client Card (with VADEHI)
            </button>
            <button
              type="button"
              className={`format-pill-btn ${exportFormat === 'pure' ? 'active' : ''}`}
              onClick={() => setExportFormat('pure')}
            >
              Square QR Only
            </button>
          </div>
        </div>

        <div className="color-picker-row">
          <span className="color-picker-label">
            <Palette size={14} /> Color
          </span>
          <div className="color-swatches">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                className={`color-swatch-btn ${selectedColor === preset.value ? 'active' : ''}`}
                style={{ backgroundColor: preset.value }}
                onClick={() => setSelectedColor(preset.value)}
                title={preset.name}
                aria-label={`Select ${preset.name}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="actions-container">
        <div className="primary-actions-row">
          <button
            type="button"
            id="btn-download-qr"
            className="btn-action-primary"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            <Download size={18} />
            <span>
              {isDownloading
                ? 'Generating PNG...'
                : exportFormat === 'card'
                ? 'Download Client Card'
                : 'Download QR Code'}
            </span>
          </button>

          <button
            type="button"
            id="btn-copy-qr-image"
            className="btn-action-secondary"
            onClick={handleCopyImage}
            title="Copy image to clipboard"
          >
            {copiedImage ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
            <span>{copiedImage ? 'Card Copied!' : 'Copy Image'}</span>
          </button>
        </div>

        {/* Generate Another QR Button */}
        <button
          type="button"
          id="btn-generate-another"
          className="btn-reset-another"
          onClick={onGenerateAnother}
        >
          <RefreshCw size={15} />
          <span>Generate Another QR</span>
        </button>
      </div>
    </div>
  );
}
