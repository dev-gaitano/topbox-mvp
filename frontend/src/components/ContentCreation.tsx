import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Platform } from '../types';
import './ContentCreation.css';

interface ContentCreationProps {
  companyId: number;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📸',
  twitter: '🐦',
  facebook: '📘',
  linkedin: '💼',
  tiktok: '🎵',
};

function ContentCreation({ companyId }: ContentCreationProps) {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const platforms: Platform[] = ['instagram', 'twitter', 'facebook', 'linkedin', 'tiktok'];

  const addFiles = (files: File[]) => {
    const images = files.filter(f => f.type.startsWith('image/'));
    setReferenceImages(prev => [...prev, ...images]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files || []));
  };

  const handleRemoveImage = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const safeJson = async (res: Response) => {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Non-JSON response from ${res.url} (${res.status}): ${text.slice(0, 200)}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    try {
      setSubmitting(true);

      // Step 1: Upload images to Cloudinary
      setStatus('Uploading images…');
      const formData = new FormData();
      formData.append('companyId', companyId.toString());
      referenceImages.forEach(image => formData.append('referenceImages', image));

      const uploadRes = await fetch(`${API_BASE}/api/content/upload_images`, {
        method: 'POST',
        body: formData,
      });
      const uploadData = await safeJson(uploadRes);
      if (!uploadRes.ok) throw new Error(uploadData.message || 'Failed to upload images');

      // Step 2: Analyze uploaded images
      setStatus('Analyzing images…');
      const analyzeRes = await fetch(`${API_BASE}/api/content/analyze_images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: uploadData.urls }),
      });
      const analyzeData = await safeJson(analyzeRes);
      if (!analyzeRes.ok) throw new Error(analyzeData.message || 'Failed to analyze images');

      // Step 3: Generate prompt and caption
      setStatus('Generating prompt…');
      const createRes = await fetch(`${API_BASE}/api/content/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          topic: topic.trim(),
          platform,
          analyses: analyzeData.analyses,
        }),
      });
      const createData = await safeJson(createRes);
      if (!createRes.ok) throw new Error(createData.message || 'Failed to generate content');

      if (!createData.prompt || !createData.caption) {
        alert('Warning: Some generated content may be missing. Please review before saving.');
      }

      sessionStorage.setItem('pendingContent', JSON.stringify({
        ...createData,
        topic,
        platform,
        referenceImageUrls: uploadData.urls,
      }));
      navigate('/content/review');

    } catch (error) {
      console.error('Content creation error:', error);
      alert(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSubmitting(false);
      setStatus('');
    }
  };

  return (
    <div className="cc-wrapper">
      <h2 className="cc-title">Create Content</h2>

      <form onSubmit={handleSubmit} className="cc-form">
        {/* Left column */}
        <div className="cc-left">
          <div className="cc-field form-group">
            <label htmlFor="topic">Post Topic</label>
            <input
              className="cc-input"
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g., Product launch announcement"
              required
              disabled={submitting}
            />
          </div>

          <div className="cc-field form-group">
            <label htmlFor="platform">Select Platform</label>
            <select
              className="cc-input cc-select"
              value={platform}
              onChange={e => setPlatform(e.target.value as Platform)}
              disabled={submitting}
            >
              {platforms.map(p => (
                <option key={p} value={p}>
                  {PLATFORM_ICONS[p]} {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            id="cc-btn"
            className="btn btn-primary"
            disabled={!topic.trim() || submitting}
          >
            {submitting ? (
              <span className="cc-btn-inner">
                <span className="cc-spinner" />
                {status}
              </span>
            ) : 'Generate Prompt'}
          </button>
        </div>

        {/* Right column — image upload */}
        <div
          className={`cc-upload-panel ${dragging ? 'dragging' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            disabled={submitting}
            style={{ display: 'none' }}
          />

          {referenceImages.length === 0 ? (
            <div className="cc-upload-empty">
              <span className="cc-upload-icon">↑</span>
              <span className="cc-upload-label">Upload reference</span>
              <span className="cc-upload-hint">drag & drop or click</span>
            </div>
          ) : (
            <div className="cc-image-grid">
              {referenceImages.map((image, index) => (
                <div key={index} className="cc-image-thumb">
                  <img src={URL.createObjectURL(image)} alt={`Reference ${index + 1}`} />
                  <button
                    type="button"
                    className="cc-remove-btn"
                    onClick={e => { e.stopPropagation(); handleRemoveImage(index); }}
                    disabled={submitting}
                  >
                    ×
                  </button>
                </div>
              ))}
              <div className="cc-add-more">
                <span>+</span>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export default ContentCreation;
