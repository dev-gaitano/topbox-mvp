import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ContentReview.css';

interface ContentReviewProps {
  companyId: number;
}

interface ContentData {
  id?: number;
  topic: string;
  platform: string;
  prompt?: string;
  caption?: string;
  referenceImages?: string[];
}

function ContentReview({ companyId }: ContentReviewProps) {
  const navigate = useNavigate();
  const [contentData, setContentData] = useState<ContentData | null>(null);
  const [editingPrompt, setEditingPrompt] = useState(false);
  const [editingCaption, setEditingCaption] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [caption, setCaption] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load content data from session storage or fetch from API
    const stored = sessionStorage.getItem('pendingContent');
    if (stored) {
      const data = JSON.parse(stored);
      setContentData(data);
      setPrompt(data.prompt || '');
      setCaption(data.caption || '');
    } else {
      // If no stored data, fetch from API
      fetchContentData();
    }
  }, []);

  const fetchContentData = async () => {
    try {
      const response = await fetch(`/api/content/latest?companyId=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setContentData(data);
        setPrompt(data.prompt || '');
        setCaption(data.caption || '');
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  const handleSave = async () => {
    if (!contentData) return;

    try {
      setSaving(true);
      const response = await fetch('/api/content/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: contentData.id,
          companyId,
          topic: contentData.topic,
          platform: contentData.platform,
          prompt,
          caption,
        }),
      });

      if (response.ok) {
        alert('Content saved successfully!');
        sessionStorage.removeItem('pendingContent');
        navigate('/content');
      } else {
        alert('Failed to save content');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Error saving content');
    } finally {
      setSaving(false);
    }
  };

  if (!contentData) {
    return (
      <div className="content-review">
        <div className="loading">Loading content...</div>
      </div>
    );
  }

  return (
    <div className="content-review">
      <h1>Review Generated Content</h1>

      <div className="review-section">
        <div className="content-info">
          <div className="info-item">
            <span className="info-label">Topic:</span>
            <span className="info-value">{contentData.topic}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Platform:</span>
            <span className="info-value">
              {contentData.platform.charAt(0).toUpperCase() + contentData.platform.slice(1)}
            </span>
          </div>
        </div>

        <div className="content-editor">
          <div className="editor-section">
            <div className="editor-header">
              <h3>Content Prompt</h3>
              <button
                className="btn btn-secondary btn-small"
                onClick={() => setEditingPrompt(!editingPrompt)}
              >
                {editingPrompt ? 'Cancel' : 'Edit'}
              </button>
            </div>
            {editingPrompt ? (
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="editor-textarea"
                rows={8}
                placeholder="Enter content prompt..."
              />
            ) : (
              <div className="content-display">
                {prompt || <span className="placeholder">No prompt generated</span>}
              </div>
            )}
          </div>

          <div className="editor-section">
            <div className="editor-header">
              <h3>Caption</h3>
              <button
                className="btn btn-secondary btn-small"
                onClick={() => setEditingCaption(!editingCaption)}
              >
                {editingCaption ? 'Cancel' : 'Edit'}
              </button>
            </div>
            {editingCaption ? (
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="editor-textarea"
                rows={6}
                placeholder="Enter caption..."
              />
            ) : (
              <div className="content-display">
                {caption || <span className="placeholder">No caption generated</span>}
              </div>
            )}
          </div>
        </div>

        <div className="action-buttons">
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/content')}
          >
            Back to Create
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Confirm & Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ContentReview;
