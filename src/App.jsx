import React, { useState, useRef, useEffect } from 'react';
import { QrCode, Sun, Moon, ShieldCheck, Zap, Smartphone, CheckCircle } from 'lucide-react';
import URLInput from './components/URLInput';
import QRCard from './components/QRCard';
import { validateAndNormalizeUrl } from './utils/qrHelper';

export default function App() {
  const [inputUrl, setInputUrl] = useState('');
  const [name, setName] = useState('VADEHI');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [generatedName, setGeneratedName] = useState('VADEHI');
  const [error, setError] = useState('');
  const [theme, setTheme] = useState('dark');
  const inputRef = useRef(null);

  // Sync theme attribute with document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Handle QR Generation
  const handleGenerate = () => {
    const { isValid, normalizedUrl, error: validationError } = validateAndNormalizeUrl(inputUrl);

    if (!isValid) {
      setError(validationError);
      if (inputRef.current) {
        inputRef.current.focus();
      }
      return;
    }

    setError('');
    setGeneratedUrl(normalizedUrl);
    setGeneratedName(name.trim() || 'VADEHI');
  };

  // Reset to generate another QR code
  const handleGenerateAnother = () => {
    setInputUrl('');
    setGeneratedUrl('');
    setError('');
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 50);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <header className="top-nav">
        <div className="brand-badge">
          <div className="brand-logo-icon">
            <QrCode size={20} />
          </div>
          <div className="brand-title">
            <span className="vadehi-logo-text">VADEHI</span>
          </div>
          <span className="brand-tag">Client QR Studio</span>
        </div>

        <div className="nav-actions">
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle color theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Main Centered Generator Section */}
      <main className="main-content">
        <section className="hero-header">
          <div className="hero-pill">
            <span className="hero-pill-dot" /> 100% Client-Safe &bull; Scannable from Any Phone
          </div>
          <h1 className="vadehi-hero-title">
            <span className="gradient-text">VADEHI</span> QR Studio
          </h1>
          <p className="hero-subtitle">
            Create elegant, client-ready QR cards in luxury typography. The QR code remains completely unobstructed to guarantee flawless scanning on any device.
          </p>
        </section>

        {/* Central Generator Card */}
        <div className="generator-card">
          <URLInput
            inputUrl={inputUrl}
            setInputUrl={(val) => {
              setInputUrl(val);
              if (error) setError('');
            }}
            name={name}
            setName={setName}
            onGenerate={handleGenerate}
            error={error}
            inputRef={inputRef}
          />

          {/* Prominent QR Code Result */}
          {generatedUrl && (
            <QRCard
              generatedUrl={generatedUrl}
              name={generatedName}
              onGenerateAnother={handleGenerateAnother}
            />
          )}
        </div>

        {/* Client Trust Badges */}
        <div className="features-strip">
          <div className="feature-item">
            <ShieldCheck size={16} className="feature-icon" />
            <span>Zero Obstructed Modules (100% Scannable)</span>
          </div>
          <div className="feature-item">
            <CheckCircle size={16} className="feature-icon" />
            <span>Executive Presentation Card for Clients</span>
          </div>
          <div className="feature-item">
            <Zap size={16} className="feature-icon" />
            <span>Ultra-Crisp 1400px Print-Ready PNG</span>
          </div>
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="app-footer">
        <p>
          <strong>VADEHI</strong> &bull; Professional Client QR Studio &bull; Direct Link Encoding &bull; 100% Browser-Based
        </p>
      </footer>
    </div>
  );
}
