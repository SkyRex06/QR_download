import React from 'react';
import { Link2, X, Clipboard, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export default function URLInput({
  inputUrl,
  setInputUrl,
  name,
  setName,
  onGenerate,
  error,
  inputRef,
  isLoading,
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onGenerate();
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputUrl(text);
        if (inputRef && inputRef.current) {
          inputRef.current.focus();
        }
      }
    } catch (err) {
      if (inputRef && inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleClear = () => {
    setInputUrl('');
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="input-section">
      {/* Destination Link Field */}
      <div className="input-label-row">
        <label htmlFor="url-input" className="input-label">
          <Link2 size={16} /> Client Destination URL
        </label>
        {!inputUrl && (
          <button
            type="button"
            className="paste-pill-btn"
            onClick={handlePaste}
            title="Paste link from clipboard"
          >
            <Clipboard size={12} /> Paste Link
          </button>
        )}
      </div>

      <div className={`url-input-wrapper ${error ? 'has-error' : ''}`}>
        <div className="input-icon-prefix">
          <Link2 size={18} />
        </div>

        <input
          id="url-input"
          ref={inputRef}
          type="text"
          className="url-input-field"
          placeholder="Enter or paste client link here (e.g. https://client.com)..."
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck="false"
        />

        <div className="input-quick-actions">
          {inputUrl && (
            <button
              type="button"
              className="input-action-btn"
              onClick={handleClear}
              title="Clear input"
              aria-label="Clear URL input"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Name / Brand Field (Set to VADEHI) */}
      <div className="name-input-container">
        <div className="input-label-row">
          <label htmlFor="name-input" className="input-label">
            <Sparkles size={15} color="#818cf8" /> Brand / Client Name on Card
          </label>
          <span className="name-badge-hint">Styled in Luxury Typography</span>
        </div>

        <div className="name-input-wrapper">
          <input
            id="name-input"
            type="text"
            className="url-input-field name-field"
            placeholder="e.g. VADEHI"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={25}
          />
          {name !== 'VADEHI' && (
            <button
              type="button"
              className="reset-name-btn"
              onClick={() => setName('VADEHI')}
              title="Reset name to VADEHI"
            >
              Reset to "VADEHI"
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="error-banner" role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <button
        type="button"
        id="btn-generate-qr"
        className="btn-generate"
        onClick={onGenerate}
        disabled={isLoading}
      >
        <span>Generate Client QR Card</span>
        <ArrowRight size={18} />
      </button>

      {/* Quick Suggestion links */}
      <div className="sample-links-bar">
        <span className="sample-links-title">Quick demo link:</span>
        <button
          type="button"
          className="sample-link-chip"
          onClick={() => setInputUrl('https://clientwebsite.com')}
        >
          clientwebsite.com
        </button>
        <button
          type="button"
          className="sample-link-chip"
          onClick={() => setInputUrl('https://instagram.com/client')}
        >
          instagram.com
        </button>
        <button
          type="button"
          className="sample-link-chip"
          onClick={() => setInputUrl('https://github.com')}
        >
          github.com
        </button>
      </div>
    </div>
  );
}
