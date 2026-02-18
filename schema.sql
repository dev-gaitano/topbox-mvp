DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS brand_guidelines CASCADE;
DROP TABLE IF EXISTS content_posts CASCADE;
DROP TABLE IF EXISTS form_responses CASCADE;

CREATE TABLE IF NOT EXISTS companies (
	id SERIAL PRIMARY KEY,
	name TEXT NOT NULL,
	industry TEXT DEFAULT '',
	email VARCHAR(255) UNIQUE,
	monthly_budget INT DEFAULT 0,
	description TEXT DEFAULT '',
	target_audience TEXT DEFAULT '',
	unique_value TEXT DEFAULT '',
	main_competitors JSONB DEFAULT '[]',
	brand_personality JSONB DEFAULT '[]',
	brand_tone TEXT DEFAULT '',
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

CREATE TABLE IF NOT EXISTS form_responses (
	id SERIAL PRIMARY KEY,
	email TEXT NOT NULL,
	business_name TEXT NOT NULL,
	industry TEXT NOT NULL,
	description TEXT NOT NULL,
	target_audience TEXT,
	brand_personality JSONB NOT NULL DEFAULT '[]',
	budget TEXT,
	platforms JSONB NOT NULL DEFAULT '[]',
	submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast lookups by email (e.g. deduplication, profile fetch)
CREATE INDEX IF NOT EXISTS idx_form_responses_email
    ON form_responses (email);

-- Fast sorting by submission time
CREATE INDEX IF NOT EXISTS idx_form_responses_submitted_at
    ON form_responses (submitted_at DESC);
