import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ContentReview.css';

interface ContentReviewProps {
  companyId: number;
  pendingContent: any;
  onClose: () => void
}

interface ContentData {
  id?: number;
  topic: string;
  platform: string;
  prompt?: string;
  caption?: string;
  referenceImages?: string[];
  results?: { platform: string; caption: string; prompt: string }[];
}

function ContentReview({ companyId, pendingContent }: ContentReviewProps) {
  const navigate = useNavigate();
  const [contentData, setContentData] = useState<ContentData | null>(null);
  const [editingPrompt, setEditingPrompt] = useState(false);
  const [editingCaption, setEditingCaption] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [caption, setCaption] = useState('');
  const [saving, setSaving] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>(
    contentData?.results?.[0]?.platform ?? contentData?.platform ?? ''
  )

  useEffect(() => {
    setContentData(pendingContent);
    const firstResult = pendingContent.results?.[0];
    setSelectedPlatform(firstResult?.platform ?? pendingContent.platform ?? '');
    setPrompt(firstResult?.prompt ?? pendingContent.prompt ?? '');
    setCaption(firstResult?.caption ?? pendingContent.caption ?? '');
  }, [pendingContent]);

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
          platform: selectedPlatform,
          prompt,
          caption,
        }),
      });

      if (response.ok) {
        alert('Content saved successfully!');
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

  const handleCopyPrompt = async () => {
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedPrompt(true)
      setTimeout(() => setCopiedPrompt(false), 2000)
    } catch (error) {
      console.error('Error copying prompt to clipboard:', error);
    }
  };

  const handleCopyCaption = async () => {
    if (!caption) return;
    try {
      await navigator.clipboard.writeText(caption);
      setCopiedCaption(true)
      setTimeout(() => setCopiedCaption(false), 2000)
    } catch (error) {
      console.error('Error copying caption to clipboard:', error);
    }
  };

  if (!contentData) {
    return (
      <div className="cr-wrapper">
        <div className="loading">Loading content...</div>
      </div>
    );
  }

  return (
    <div className="cr-wrapper">
      <div className="cr-review-section">
        <div className="cr-content-info">
          <div className="cr-info-item">
            <span className="cr-info-value">{contentData.topic}</span>
          </div>
          <div className="cr-info-item">
            <span className="cr-info-value">
              <div className="cr-platform">
                <span className="cr-info-label">Platform:</span>
                <select
                  className="cr-platform-select"
                  value={selectedPlatform}
                  onChange={(e) => {
                    const platform = e.target.value;
                    setSelectedPlatform(platform);
                    const match = contentData.results?.find((r) => r.platform === platform);
                    if (match) {
                      setPrompt(match.prompt);
                      setCaption(match.caption);
                    }
                  }}
                >
                  {(contentData.results ?? [{ platform: contentData.platform }]).map((r) => (
                    <option key={r.platform} value={r.platform}>
                      {r.platform.charAt(0).toUpperCase() + r.platform.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </span>
          </div>
        </div>

        <div className="cr-content-editor">
          <div className="cr-editor-section">
            <div className="cr-editor-header">
              <h3>Content Prompt</h3>
              <div className="cr-editor-actions">
                <button
                  className="btn btn-secondary btn-small"
                  onClick={() => setEditingPrompt(!editingPrompt)}
                >
                  {editingPrompt ? 'Cancel' : 'Edit'}
                </button>
                <button
                  className="btn btn-secondary btn-small"
                  type="button"
                  onClick={handleCopyPrompt}
                  disabled={!prompt}
                >
                  {copiedPrompt ? 'Copied ✓' : 'Copy'}
                </button>
              </div>
            </div>
            {editingPrompt ? (
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="cr-editor-textarea"
                rows={8}
                placeholder="Enter content prompt..."
              />
            ) : (
              <div className="cr-content-display" style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '4px', minHeight: '100px', lineHeight: '1.6' }}>
                {prompt || <span className="cr-placeholder">No prompt generated</span>}
              </div>
            )}
            <button id="cr-generate-img-btn" className="btn btn-primary">Generate Image</button>
          </div>

          <div className="cr-editor-section">
            <div className="cr-editor-header">
              <h3>Caption</h3>
              <div className="cr-editor-actions">
                <button
                  className="btn btn-secondary btn-small"
                  onClick={() => setEditingCaption(!editingCaption)}
                >
                  {editingCaption ? 'Cancel' : 'Edit'}
                </button>
                <button
                  className="btn btn-secondary btn-small"
                  type="button"
                  onClick={handleCopyCaption}
                  disabled={!caption}
                >
                  {copiedCaption ? 'Copied ✓' : 'Copy'}
                </button>
              </div>
            </div>
            {editingCaption ? (
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="cr-editor-textarea"
                rows={6}
                placeholder="Enter caption..."
              />
            ) : (
              <div className="cr-content-display" style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '4px', minHeight: '80px', lineHeight: '1.6' }}>
                {caption || <span className="cr-placeholder">No caption generated</span>}
              </div>
            )}
          </div>
        </div>

        <div className="cr-action-buttons">
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
