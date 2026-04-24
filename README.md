<div align="center">
    <img src="https://res.cloudinary.com/diwkfbsgv/image/upload/v1775206748/logo_u4sz9t.svg" alt="banner_img">
    <h1>TopBox Studio</h1>
</div>

<br />

TopBox is an AI powered content management system that helps teams create, organize, update, and publish digital content across multiple platforms.

## Tech stack

- React + TypeScript + CSS + Vite Front-end
- Python + Flask Back-end API
- PostreSQL Database

## Features

- **Company Management**: Select existing companies or create new ones
- **Brand Guidelines**: Upload or generate brand guidelines
- **Content Creation**: Create content posts with topics, platform selection, and reference images
- **Content Review**: Review and edit generated content prompts and captions

## Getting Started

### Installation

```bash
# Setup backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 main.py
```

- API calls are configured to proxy to `http://localhost:5000`

```bash
# Setup frontend
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:3000`

### Build

```bash
cd frontend
npm run build
```

## API Endpoints

The frontend expects the following Flask backend endpoints:

### Companies
- `GET /api/companies` - Fetch all companies
- `POST /api/companies` - Create a new company
- `GET /api/companies/<int:company_id>` - Fetch selected company

### Brand Guidelines
- `POST /api/brand-guidelines/upload` - Upload brand guidelines file
- `POST /api/brand-guidelines/generate` - Generate brand guidelines
- `POST /api/brand-guidelines/save` - Save generated guidelines
- `GET /api/brand-guidelines/<int:company_id>` - Get brand guidelines for selected company

### Content
- `POST /api/content/create` - Create new content post
- `GET /api/content/latest` - Get latest content for a company
- `GET /api/content/list` - Get latest 20 content for a company
- `POST /api/content/save` - Save content with prompt and caption

## Project Structure

```
.
├── .git/                               # Git metadata
├── README.md                           # Project documentation
├── backend/                            # Flask Backend
│   ├── main.py                         # API entry point
│   ├── databaseConnection.py           # Database connection and setup
│   ├── requirements.txt                # Python deps
│   ├── schema.sql                      # DB schema
│   ├── Dockerfile                      # Backend container config
│   ├── .env                            # Secrets (local)
│   ├── credentials.json                # Google API key (local)
│   └── agents/                         # AI Agent logic
│       ├── agentSetup.py               # Shared AI config
│       ├── brandAgent.py               # Brand analysis agent
│       ├── contentAgent.py             # Content creation agent
│       └── responseModels.py           # Pydantic models
├── frontend/                           # React Frontend
│   ├── index.html                      # HTML entry point
│   ├── package.json                    # Frontend config and scripts
│   ├── package-lock.json               # Locked dependency versions
│   ├── tsconfig.json                   # TypeScript config
│   ├── tsconfig.node.json              # TypeScript config for tooling
│   ├── vite.config.ts                  # Vite config
│   └── src/                            # Frontend source
│       ├── components/                 # React components
│       ├── types/                      # Type definitions
│       ├── App.tsx                     # Main component
│       └── main.tsx                    # Entry point
```

## Notes

- Selected company state is managed at "Main.tsx"
