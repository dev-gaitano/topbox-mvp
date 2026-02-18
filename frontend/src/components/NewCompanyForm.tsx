import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NewCompanyForm.css";

const BRAND_PERSONALITIES = [
  "Professional", "Friendly", "Creative", "Bold",
  "Authentic", "Playful", "Elegant", "Minimalist",
  "Innovative", "Trustworthy", "Energetic", "Sophisticated"
];

const PLATFORMS = [
  { id: "instagram", label: "Instagram", icon: "📸" },
  { id: "twitter", label: "Twitter / X", icon: "🐦" },
  { id: "facebook", label: "Facebook", icon: "📘" },
  { id: "linkedin", label: "LinkedIn", icon: "💼" },
  { id: "tiktok", label: "TikTok", icon: "🎵" },
  { id: "youtube", label: "YouTube", icon: "▶️" },
];

const INDUSTRIES = [
  "Technology", "Fashion & Apparel", "Food & Beverage", "Health & Wellness",
  "Finance", "Real Estate", "Education", "Entertainment",
  "Retail", "Travel & Hospitality", "Beauty & Cosmetics", "Other"
];

const STEPS = ["Business", "Audience", "Brand Voice", "Platforms"];

const API_BASE = "http://localhost:5000";

export default function NewCompanyForm({ onSuccess }) {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    businessName: "",
    industry: "",
    email: "",
    brandDescription: "",
    targetAudience: "",
    budget: "",
    brandPersonality: [],
    tone: "",
    competitors: "",
    uniqueValue: "",
    platforms: [],
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const toggleMulti = (field, value) =>
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value],
    }));

  const canNext = () => {
    if (step === 0) return form.businessName.trim() && form.industry && form.email.trim();
    if (step === 1) return form.brandDescription.trim() && form.targetAudience.trim();
    if (step === 2) return form.brandPersonality.length > 0;
    if (step === 3) return form.platforms.length > 0;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Create company in DB
      const companyRes = await fetch(`${API_BASE}/api/companies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: form.businessName,
          industry: form.industry,
          email: form.email,
          budget: form.budget,
          brandDescription: form.brandDescription,
          targetAudience: form.targetAudience,
          competitors: form.competitors,
          uniqueValue: form.uniqueValue,
          brandPersonality: form.brandPersonality,
          tone: form.tone,
          platforms: form.platforms
        }),
      });
      const company = await companyRes.json();
      if (!company.id) throw new Error(company.message || "Failed to create company");

      // 2. Generate brand guidelines
      const guidelinesRes = await fetch(`${API_BASE}/api/brand-guidelines/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: company.id,
          businessName: form.businessName,
          industry: form.industry,
          targetAudience: form.targetAudience,
          brandDescription: form.brandDescription,
          tone: [...form.brandPersonality, form.tone].filter(Boolean).join(", "),
          competitors: form.competitors,
          uniqueValue: form.uniqueValue,
        }),
      });
      const guidelines = await guidelinesRes.json();
      if (!guidelines.success && !guidelines.guidelines)
        throw new Error(guidelines.message || "Failed to generate guidelines");

      // 3. Bubble the new company up to App, then go to home
      onSuccess?.(company);
      navigate("/");

    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ncf-page">
      <div className="ncf-card">

        {/* Header */}
        <div className="ncf-header">
          <h1 className="ncf-title">New Company</h1>
          <p className="ncf-subtitle">Tell us about your brand so we can craft the perfect identity.</p>
        </div>

        {/* Stepper */}
        <div className="ncf-stepper">
          {STEPS.map((label, i) => (
            <div key={i} className="ncf-step-wrap">
              <div className={`ncf-step-dot ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`ncf-step-label ${i === step ? "active" : ""}`}>{label}</span>
              {i < STEPS.length - 1 && (
                <div className={`ncf-step-line ${i < step ? "done" : ""}`} />
              )}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="ncf-body">
          <div className="ncf-fields">

            {/* Step 0 — Business */}
            {step === 0 && (
              <>
                <Field label="Business Name" required>
                  <input
                    className="ncf-input"
                    placeholder="e.g. Nairobi Coffee Co."
                    value={form.businessName}
                    onChange={e => update("businessName", e.target.value)}
                  />
                </Field>
                <Field label="Industry" required>
                  <select
                    className="ncf-select"
                    value={form.industry}
                    onChange={e => update("industry", e.target.value)}
                  >
                    <option value="">Select an industry…</option>
                    {INDUSTRIES.map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Contact Email" required>
                  <input
                    className="ncf-input"
                    type="email"
                    placeholder="hello@yourbrand.com"
                    value={form.email}
                    onChange={e => update("email", e.target.value)}
                  />
                </Field>
                <Field label="Monthly Budget (KES)">
                  <input
                    className="ncf-input"
                    type="number"
                    placeholder="e.g. 50000"
                    value={form.budget}
                    onChange={e => update("budget", e.target.value)}
                  />
                </Field>
              </>
            )}

            {/* Step 1 — Audience */}
            {step === 1 && (
              <>
                <Field label="Describe Your Business" required hint="What do you do and what makes you special?">
                  <textarea
                    className="ncf-textarea"
                    rows={4}
                    placeholder="We're a specialty coffee shop focused on ethically sourced beans and creating a warm community space…"
                    value={form.brandDescription}
                    onChange={e => update("brandDescription", e.target.value)}
                  />
                </Field>
                <Field label="Target Audience" required hint="Who are your ideal customers?">
                  <textarea
                    className="ncf-textarea"
                    rows={3}
                    placeholder="Young professionals aged 25–40 who value quality and sustainability…"
                    value={form.targetAudience}
                    onChange={e => update("targetAudience", e.target.value)}
                  />
                </Field>
                <Field label="Unique Value Proposition">
                  <input
                    className="ncf-input"
                    placeholder="What do you offer that competitors don't?"
                    value={form.uniqueValue}
                    onChange={e => update("uniqueValue", e.target.value)}
                  />
                </Field>
                <Field label="Main Competitors">
                  <input
                    className="ncf-input"
                    placeholder="e.g. Java House, Artcaffe"
                    value={form.competitors}
                    onChange={e => update("competitors", e.target.value)}
                  />
                </Field>
              </>
            )}

            {/* Step 2 — Brand Voice */}
            {step === 2 && (
              <>
                <Field label="Brand Personality" required hint="Select all that apply.">
                  <div className="ncf-chip-grid">
                    {BRAND_PERSONALITIES.map(p => (
                      <button
                        key={p}
                        type="button"
                        className={`ncf-chip ${form.brandPersonality.includes(p) ? "active" : ""}`}
                        onClick={() => toggleMulti("brandPersonality", p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Brand Tone / Voice" hint="Describe the voice in your own words.">
                  <input
                    className="ncf-input"
                    placeholder="e.g. Warm and conversational, never corporate"
                    value={form.tone}
                    onChange={e => update("tone", e.target.value)}
                  />
                </Field>
              </>
            )}

            {/* Step 3 — Platforms */}
            {step === 3 && (
              <Field label="Social Media Platforms" required hint="Where do you want to focus your content?">
                <div className="ncf-platform-grid">
                  {PLATFORMS.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      className={`ncf-platform-card ${form.platforms.includes(p.id) ? "active" : ""}`}
                      onClick={() => toggleMulti("platforms", p.id)}
                    >
                      <span className="ncf-platform-icon">{p.icon}</span>
                      <span className="ncf-platform-label">{p.label}</span>
                      {form.platforms.includes(p.id) && (
                        <span className="ncf-platform-check">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </Field>
            )}

          </div>
        </div>

        {/* Error */}
        {error && <div className="ncf-error-box">{error}</div>}

        {/* Navigation */}
        <div className="ncf-nav">
          {step > 0 && (
            <button className="ncf-btn-secondary" onClick={() => setStep(s => s - 1)}>
              ← Back
            </button>
          )}
          <div className="ncf-nav-spacer" />
          {step < STEPS.length - 1 ? (
            <button
              className="ncf-btn-primary"
              disabled={!canNext()}
              onClick={() => setStep(s => s + 1)}
            >
              Continue →
            </button>
          ) : (
            <button
              className="ncf-btn-primary"
              disabled={!canNext() || loading}
              onClick={handleSubmit}
            >
              {loading ? (
                <span className="ncf-loading-inner">
                  <span className="ncf-spinner" />
                  Creating…
                </span>
              ) : "Create Company ✦"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

function Field({ label, required, hint, children }) {
  return (
    <div className="ncf-field">
      <label className="ncf-label">
        {label}{required && <span className="ncf-required"> *</span>}
      </label>
      {hint && <p className="ncf-hint">{hint}</p>}
      {children}
    </div>
  );
}
