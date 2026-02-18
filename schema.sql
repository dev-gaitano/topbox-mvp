CREATE TABLE IF NOT EXISTS companies (
id SERIAL PRIMARY KEY,
name TEXT NOT NULL,
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS brand_guidelines (
id SERIAL PRIMARY KEY,
company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
content TEXT,
file_filename TEXT,
file_path TEXT,
uploaded_at TIMESTAMPTZ,
generated_at TIMESTAMPTZ,
saved_at TIMESTAMPTZ,
UNIQUE (company_id)
);

CREATE TABLE IF NOT EXISTS content_posts (
id SERIAL PRIMARY KEY,
company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
topic TEXT NOT NULL,
platform TEXT NOT NULL,
reference_image_urls JSONB,
prompt TEXT,
caption TEXT,
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at TIMESTAMPTZ
);
