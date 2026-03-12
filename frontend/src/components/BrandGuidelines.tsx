import './BrandGuidelines.css';

import { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Import company ID from props
interface BrandGuidelinesProps {
  companyId: number;
}

function BrandGuidelines({ companyId }: BrandGuidelinesProps) {
  const [uploadMode, setUploadMode] = useState<'upload' | 'generate' | 'view'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [generatedProfile, setGeneratedProfile] = useState<any | null>(null);
  const [uploadedAnalysis, setUploadedAnalysis] = useState<any | null>(null);
  const [uploadedProfile, setUploadedProfile] = useState<any | null>(null);
  const [viewedContent, setViewedContent] = useState<string | null | undefined>(undefined);
  const [viewedProfile, setViewedProfile] = useState<any | null>(null);

  const getColors = (profile: any): string[] => {
    if (!profile) return [];
    return Array.isArray(profile.color_palette)
      ? profile.color_palette
      : Array.isArray(profile.generated_profile?.color_palette)
        ? profile.generated_profile.color_palette
        : [];
  };

  const ColorPaletteBar = ({ profile }: { profile: any }) => {
    const colors = getColors(profile);
    if (!colors.length) return null;
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 16px',
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: '#fafafa',
          borderRadius: '4px 4px 0 0',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: '#555', whiteSpace: 'nowrap', fontFamily: 'sans-serif' }}>
          Brand Colors
        </span>
        {colors.map((hex, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              title={hex}
              style={{
                width: 20,
                height: 20,
                backgroundColor: hex,
                borderRadius: 3,
                border: '1px solid rgba(0,0,0,0.15)',
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 11, color: '#666', fontFamily: 'monospace' }}>{hex}</span>
          </div>
        ))}
      </div>
    );
  };

  const handleViewMode = async () => {
    setUploadMode('view');
    setViewedContent(undefined); // reset to loading state
    setViewedProfile(null);
    try {
      const res = await fetch(`${API_BASE}/api/brand-guidelines/${companyId}`);
      const data = await res.json();
      setViewedContent(data.content ?? null);
      setViewedProfile(data.profile ?? null);
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
      setUploadedAnalysis(null);
      setUploadedProfile(null);
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('companyId', companyId.toString());

      const response = await fetch('/api/brand-guidelines/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUploadedAnalysis(data.analysis ?? null);
        setUploadedProfile(data.profile ?? null);
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
          setGeneratedProfile(data.profile ?? null);
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
    <div className="bg-wrapper">
      <h1>Brand Guidelines</h1>

      <div className="bg-mode-selector">
        <button
          className={`bg-mode-btn ${uploadMode === 'upload' ? 'active' : ''}`}
          onClick={() => setUploadMode('upload')}
        >
          Upload Guidelines
        </button>
        <button
          className={`bg-mode-btn ${uploadMode === 'generate' ? 'active' : ''}`}
          onClick={() => setUploadMode('generate')}
        >
          Generate Guidelines
        </button>
        <button
          className={`bg-mode-btn ${uploadMode === 'view' ? 'active' : ''}`}
          onClick={handleViewMode}
        >
          View Guidelines
        </button>
      </div>

      {uploadMode === 'upload' ? (
        <div className="bg-upload-section">
          <form onSubmit={handleUpload} className="upload-form">
            <div className="form-group">
              <label htmlFor="fileUpload">Upload Brand Guidelines File</label>
              <div className="bg-upload-row">
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
                <p className="bg-file-info">Selected: {uploadedFile.name}</p>
              )}
            </div>
          </form>
          {uploadedAnalysis && (
            <div className="bg-upload-analysis" style={{ marginTop: 24 }}>
              <h3>Uploaded File Analysis</h3>
              <div
                className="bg-content-preview"
                style={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  maxHeight: '500px',
                  overflowY: 'auto',
                  border: '1px solid #e0e0e0',
                }}
              >
                {uploadedProfile && <ColorPaletteBar profile={uploadedProfile} />}
                <pre style={{
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  margin: 0,
                  padding: '16px',
                }}>
                  {JSON.stringify(uploadedAnalysis, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      ) : uploadMode === 'view' ? (
        <div className="bg-view-section">
          {viewedContent === undefined ? (
            <p>Loading...</p>
          ) : viewedContent === null ? (
            <p>No brand guidelines have been saved for this company yet.</p>
          ) : (
            <div>
              <div className="bg-content-preview" style={{ backgroundColor: '#f5f5f5', borderRadius: '4px', maxHeight: '500px', overflowY: 'auto', border: '1px solid #e0e0e0' }}>
                {viewedProfile && <ColorPaletteBar profile={viewedProfile} />}
                <textarea
                  value={viewedContent || ''}
                  onChange={(e) => setViewedContent(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '300px',
                    border: 'none',
                    outline: 'none',
                    resize: 'vertical',
                    backgroundColor: 'transparent',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                    padding: '16px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <button
                className="btn btn-secondary"
                style={{ marginTop: 12 }}
                onClick={async () => {
                  if (!viewedContent) {
                    alert('Nothing to save.');
                    return;
                  }
                  try {
                    const response = await fetch(`${API_BASE}/api/brand-guidelines/save`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        companyId,
                        content: viewedContent,
                      }),
                    });
                    if (response.ok) {
                      alert('Brand guidelines saved!');
                    } else {
                      const data = await response.json().catch(() => null);
                      alert(`Failed to save guidelines: ${data?.message || response.statusText}`);
                    }
                  } catch (error) {
                    console.error('Error saving guidelines:', error);
                    alert('Error saving guidelines');
                  }
                }}
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-generate-section">
          <form onSubmit={handleGenerate} className="bg-generate-form">
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
            <div className="bg-generated-content">
              <h3>Generated Brand Guidelines</h3>
              <div className="bg-content-preview" style={{ backgroundColor: '#f5f5f5', borderRadius: '4px', maxHeight: '500px', overflowY: 'auto', border: '1px solid #e0e0e0' }}>
                {generatedProfile && <ColorPaletteBar profile={generatedProfile} />}
                <textarea
                  value={generatedContent}
                  onChange={(e) => setGeneratedContent(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '300px',
                    border: 'none',
                    outline: 'none',
                    resize: 'vertical',
                    backgroundColor: 'transparent',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                    padding: '16px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <button
                className="btn btn-secondary"
                onClick={async () => {
                  if (!generatedContent) {
                    alert('Nothing to save.');
                    return;
                  }
                  try {
                    const response = await fetch(`${API_BASE}/api/brand-guidelines/save`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        companyId,
                        content: generatedContent,
                      }),
                    });
                    if (response.ok) {
                      alert('Brand guidelines saved!');
                    } else {
                      const data = await response.json().catch(() => null);
                      alert(`Failed to save guidelines: ${data?.message || response.statusText}`);
                    }
                  } catch (error) {
                    console.error('Error saving guidelines:', error);
                    alert('Error saving guidelines');
                  }
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
