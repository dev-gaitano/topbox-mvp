import { useState } from 'react';
import './BrandGuidelines.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface BrandGuidelinesProps {
  companyId: number;
}

function BrandGuidelines({ companyId }: BrandGuidelinesProps) {
  const [uploadMode, setUploadMode] = useState<'upload' | 'generate' | 'view'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [viewedContent, setViewedContent] = useState<string | null>(null);

  const handleViewMode = async () => {
    setUploadMode('view');
    setViewedContent(null); // reset to loading state
    try {
      const res = await fetch(`${API_BASE}/api/brand-guidelines/${companyId}`);
      const data = await res.json();
      setViewedContent(data.content ?? null);
    } catch {
      setViewedContent(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFile) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('companyId', companyId.toString());

      const response = await fetch('/api/brand-guidelines/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Brand guidelines uploaded successfully!');
        setUploadedFile(null);
      } else {
        const data = await response.json();
        console.error('Upload error:', data);
        alert(`Failed to upload: ${data.message} — ${data.error}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setGenerating(true);

      const companyRes = await fetch(`${API_BASE}/api/companies/${companyId}`);
      const companyData = await companyRes.json();

      const response = await fetch(`${API_BASE}/api/brand-guidelines/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId,
          questionnaire: {
            company_name: companyData.name,
            industry: companyData.industry,
            description: companyData.description,
            target_audience: companyData.target_audience,
            unique_value: companyData.unique_value,
            main_competitors: companyData.main_competitors,
            brand_personality: companyData.brand_personality,
            brand_tone: companyData.brand_tone,
            monthly_budget: companyData.monthly_budget,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Generated guidelines response:', data);
        const content = data.content || data.guidelines || '';
        if (content) {
          setGeneratedContent(content);
          alert('Brand guidelines generated successfully!');
        } else {
          console.error('No content in response:', data);
          alert('Guidelines generated but no content received');
        }
      } else {
        const text = await response.text();
        let message = 'Unknown error';
        try {
          const errorData = JSON.parse(text);
          message = errorData.message || message;
        } catch {
          message = text || `HTTP ${response.status}`;
        }
        alert(`Failed to generate guidelines: ${message}`);
      }
    } catch (error) {
      console.error('Error generating guidelines:', error);
      alert('Error generating guidelines');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="brand-guidelines">
      <h1>Brand Guidelines</h1>

      <div className="mode-selector">
        <button
          className={`mode-btn ${uploadMode === 'upload' ? 'active' : ''}`}
          onClick={() => setUploadMode('upload')}
        >
          Upload Guidelines
        </button>
        <button
          className={`mode-btn ${uploadMode === 'generate' ? 'active' : ''}`}
          onClick={() => setUploadMode('generate')}
        >
          Generate Guidelines
        </button>
        <button
          className={`mode-btn ${uploadMode === 'view' ? 'active' : ''}`}
          onClick={handleViewMode}
        >
          View Guidelines
        </button>
      </div>

      {uploadMode === 'upload' ? (
        <div className="upload-section">
          <form onSubmit={handleUpload} className="upload-form">
            <div className="form-group">
              <label htmlFor="fileUpload">Upload Brand Guidelines File</label>
              <div className="upload-row">
                <input
                  id="fileUpload"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                <button
                  type="submit"
                  className="bg-save-btn btn btn-primary"
                  disabled={!uploadedFile || uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload Guidelines'}
                </button>
              </div>
              {uploadedFile && (
                <p className="file-info">Selected: {uploadedFile.name}</p>
              )}
            </div>
          </form>
        </div>
      ) : uploadMode === 'view' ? (
        <div className="view-section">
          {viewedContent === undefined ? (
            <p>Loading...</p>
          ) : viewedContent === null ? (
            <p>No brand guidelines have been saved for this company yet.</p>
          ) : (
            <div className="content-preview" style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '4px', maxHeight: '500px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '14px', lineHeight: '1.6' }}>
              {viewedContent}
            </div>
          )}
        </div>
      ) : (
        <div className="generate-section">
          <form onSubmit={handleGenerate} className="generate-form">
            <div className="form-group">
              <p>
                Click the button to auto-generate brand guidelines for this company.
              </p>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={generating}
            >
              {generating ? 'Generating...' : 'Generate Guidelines'}
            </button>
          </form>

          {generatedContent && (
            <div className="generated-content">
              <h3>Generated Brand Guidelines</h3>
              <div className="content-preview" style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '4px', maxHeight: '500px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '14px', lineHeight: '1.6' }}>
                {generatedContent}
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  fetch(`${API_BASE}/api/brand-guidelines/save`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      companyId,
                      content: generatedContent,
                    }),
                  }).then(() => {
                    alert('Brand guidelines saved!');
                  });
                }}
              >
                Save Guidelines
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BrandGuidelines;
