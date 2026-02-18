import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Platform } from '../types';
import './ContentCreation.css';

interface ContentCreationProps {
  companyId: number;
}

function ContentCreation({ companyId }: ContentCreationProps) {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const platforms: Platform[] = ['instagram', 'twitter', 'facebook', 'linkedin', 'tiktok'];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setReferenceImages([...referenceImages, ...files]);
  };

  const handleRemoveImage = (index: number) => {
    setReferenceImages(referenceImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('companyId', companyId.toString());
      formData.append('topic', topic.trim());
      formData.append('platform', platform);

      referenceImages.forEach((image, index) => {
        formData.append(`referenceImages`, image);
      });

      const response = await fetch('https://topbox-mvp.onrender.com/api/content/create', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        // Store content data for review page
        sessionStorage.setItem('pendingContent', JSON.stringify({
          ...data,
          topic,
          platform,
          referenceImages: referenceImages.map(f => f.name),
        }));
        navigate('/content/review');
      } else {
        alert('Failed to create content');
      }
    } catch (error) {
      console.error('Error creating content:', error);
      alert('Error creating content');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="content-creation">
      <h1>Create Content</h1>

      <form onSubmit={handleSubmit} className="content-form">
        <div className="form-group">
          <label htmlFor="topic">Post Topic</label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Product launch announcement"
            required
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="platform">Select Platform</label>
          <select
            id="platform"
            value={platform}
            onChange={(e) => setPlatform(e.target.value as Platform)}
            disabled={submitting}
          >
            {platforms.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="referenceImages">Upload Reference/Inspiration Images</label>
          <input
            id="referenceImages"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            disabled={submitting}
          />
          <p className="form-hint">
            You can select multiple images to upload
          </p>
        </div>

        {referenceImages.length > 0 && (
          <div className="image-preview-section">
            <h3>Uploaded Images ({referenceImages.length})</h3>
            <div className="image-grid">
              {referenceImages.map((image, index) => (
                <div key={index} className="image-preview">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Reference ${index + 1}`}
                  />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => handleRemoveImage(index)}
                    disabled={submitting}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-large"
          disabled={!topic.trim() || submitting}
        >
          {submitting ? 'Creating...' : 'Generate Content'}
        </button>
      </form>
    </div>
  );
}

export default ContentCreation;
