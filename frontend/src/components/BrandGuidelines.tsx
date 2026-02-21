import { useState } from 'react';
import './BrandGuidelines.css';

interface BrandGuidelinesProps {
  companyId: number;
}

function BrandGuidelines({ companyId }: BrandGuidelinesProps) {
  const [uploadMode, setUploadMode] = useState<'upload' | 'generate' | 'view'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');

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
        alert('Failed to upload brand guidelines');
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

    const defaultPrompt = `Please generate comprehensive brand guidelines for company ${companyId}.`;

    try {
      setGenerating(true);
      const response = await fetch('/api/brand-guidelines/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId,
          prompt: defaultPrompt,
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
        const errorData = await response.json();
        console.error('API error:', errorData);
        alert(`Failed to generate guidelines: ${errorData.message || 'Unknown error'}`);
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
          onClick={() => setUploadMode('view')}
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
                  fetch('/api/brand-guidelines/save', {
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
