import { useEffect, useState } from 'react';
import './ContentList.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface ContentPost {
  id: number;
  companyId: number;
  topic: string;
  platform: string;
  referenceImageUrls: string[];
  prompt: string;
  caption: string;
  createdAt: string | null;
  updatedAt: string | null;
}

interface ContentListProps {
  companyId: number;
  companyName: string;
}

const PLATFORM_LABELS: Record<string, { label: string; color: string }> = {
  instagram: { label: 'Instagram', color: '#C13584' },
  twitter: { label: 'Twitter / X', color: '#1DA1F2' },
  x: { label: 'Twitter / X', color: '#1DA1F2' },
  linkedin: { label: 'LinkedIn', color: '#0077B5' },
  facebook: { label: 'Facebook', color: '#1877F2' },
  tiktok: { label: 'TikTok', color: '#010101' },
};

function getPlatformMeta(platform: string) {
  const key = platform.toLowerCase();
  return PLATFORM_LABELS[key] ?? { label: platform, color: 'var(--gold)' };
}

function formatDate(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function truncate(text: string, max: number) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max).trimEnd() + '…' : text;
}

export default function ContentList({ companyId, companyName }: ContentListProps) {
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/api/content/list?companyId=${companyId}&limit=50`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setPosts(data.posts);
        } else {
          setError(data.message || 'Failed to load content.');
        }
      })
      .catch(() => setError('Network error – could not reach the server.'))
      .finally(() => setLoading(false));
  }, [companyId]);

  const toggleExpand = (id: number) =>
    setExpanded((prev) => (prev === id ? null : id));

  return (
    <div className="cl-wrapper">
      <div className="cl-header">
        <div>
          <h1 className="cl-title">Content Library</h1>
          <p className="cl-subtitle">{companyName}</p>
        </div>
        <div className="cl-count">
          {!loading && !error && (
            <span>{posts.length} {posts.length === 1 ? 'post' : 'posts'}</span>
          )}
        </div>
      </div>

      {loading && (
        <div className="cl-state">
          <div className="cl-spinner" />
          <p>Loading content…</p>
        </div>
      )}

      {error && !loading && (
        <div className="cl-state cl-state--error">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="cl-state cl-state--empty">
          <div className="cl-empty-icon">✦</div>
          <p>No saved content yet.</p>
          <p className="cl-empty-hint">Create and save posts from the home page.</p>
        </div>
      )}

      {!loading && !error && posts.length > 0 && (
        <ul className="cl-list">
          {posts.map((post) => {
            const meta = getPlatformMeta(post.platform);
            const isOpen = expanded === post.id;
            return (
              <li key={post.id} className={`cl-card ${isOpen ? 'cl-card--open' : ''}`}>
                <button
                  className="cl-card-header"
                  onClick={() => toggleExpand(post.id)}
                  aria-expanded={isOpen}
                >
                  <div className="cl-card-left">
                    <span
                      className="cl-platform-badge"
                      style={{ '--badge-color': meta.color } as React.CSSProperties}
                    >
                      {meta.label}
                    </span>
                    <span className="cl-topic">{post.topic}</span>
                  </div>
                  <div className="cl-card-right">
                    <span className="cl-date">{formatDate(post.createdAt)}</span>
                    <span className={`cl-chevron ${isOpen ? 'cl-chevron--open' : ''}`}>›</span>
                  </div>
                </button>

                {/* Caption preview (always visible) */}
                {!isOpen && post.caption && (
                  <p className="cl-caption-preview">{truncate(post.caption, 140)}</p>
                )}

                {/* Expanded detail */}
                {isOpen && (
                  <div className="cl-card-body">
                    {post.referenceImageUrls.length > 0 && (
                      <div className="cl-images">
                        {post.referenceImageUrls.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                            <img src={url} alt={`Reference ${i + 1}`} className="cl-thumb" />
                          </a>
                        ))}
                      </div>
                    )}

                    {post.caption && (
                      <div className="cl-section">
                        <h4 className="cl-section-label">Caption</h4>
                        <p className="cl-caption-full">{post.caption}</p>
                      </div>
                    )}

                    {post.prompt && (
                      <div className="cl-section">
                        <h4 className="cl-section-label">Image Prompt</h4>
                        <p className="cl-prompt">{post.prompt}</p>
                      </div>
                    )}

                    <p className="cl-meta-line">
                      Saved {formatDate(post.createdAt)}
                      {post.updatedAt && post.updatedAt !== post.createdAt
                        ? ` · Updated ${formatDate(post.updatedAt)}`
                        : ''}
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
