import { useState } from 'react';
import './BrandGuidelines.css';

interface BrandGuidelinesProps {
  companyId: number;
}

function BrandGuidelines({ companyId }: BrandGuidelinesProps) {
  const [uploadMode, setUploadMode] = useState<'upload' | 'generate'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [prompt, setPrompt] = useState('');

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

      const response = await fetch('https://topbox-mvp.onrender.com/api/brand-guidelines/upload', {
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
    if (!prompt.trim()) return;

    try {
      setGenerating(true);
      const response = await fetch('/api/brand-guidelines/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId,
          prompt: prompt.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedContent(data.content || data.guidelines || '');
        alert('Brand guidelines generated successfully!');
      } else {
        alert('Failed to generate brand guidelines');
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
      </div>

      {uploadMode === 'upload' ? (
        <div className="upload-section">
          <form onSubmit={handleUpload} className="upload-form">
            <div className="form-group">
              <label htmlFor="fileUpload">Upload Brand Guidelines File</label>
              <input
                id="fileUpload"
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
                disabled={uploading}
              />
              {uploadedFile && (
                <p className="file-info">Selected: {uploadedFile.name}</p>
              )}
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!uploadedFile || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Guidelines'}
            </button>
          </form>
        </div>
      ) : (
        <div className="generate-section">
          <form onSubmit={handleGenerate} className="generate-form">
            <div className="form-group">
              <label htmlFor="prompt">Describe your brand guidelines</label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Our brand uses a modern minimalist style with blue (#2563eb) and white colors. We prefer clean typography and professional imagery..."
                rows={6}
                disabled={generating}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!prompt.trim() || generating}
            >
              {generating ? 'Generating...' : 'Generate Guidelines'}
            </button>
          </form>

          {generatedContent && (
            <div className="generated-content">
              <h3>Generated Brand Guidelines</h3>
              <div className="content-preview">
                <pre>{generatedContent}</pre>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  // Save generated content
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
