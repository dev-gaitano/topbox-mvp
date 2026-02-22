# TopBox Studio Content Management System

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
python3 -m venv venv
```

```bash
source venv/bin/activate
```

```bash
pip install -r requirements.txt
```

```bash
python3 main.py
```

- API calls are configured to proxy to `http://localhost:5000`

```bash
cd frontend
npm install
```

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build

```bash
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
- `POST /api/content/save` - Save content with prompt and caption

## Project Structure

```
.
├── .git/                               # Git metadata
├── brandAgent.py                       # Brand-related logic
├── contentAgent.py                     # Content-related logic
├── databaseConnection.py               # Database connection and setup
├── main.py                             # Backend entry point
├── requirements.txt                    # Python dependencies
├── schema.sql                          # Database schema
├── Dockerfile                          # Container build instructions
├── README.md                           # Project documentation
├── frontend/                           # React frontend
│   ├── index.html                      # HTML entry point
│   ├── package.json                    # Frontend config and scripts
│   ├── package-lock.json               # Locked dependency versions
│   ├── tsconfig.json                   # TypeScript config
│   ├── tsconfig.node.json              # TypeScript config for tooling
│   ├── vite.config.ts                  # Vite configuration
│   └── src/                            # Frontend source code
│       ├── components/                 # Reusable React components
│       │   ├── CompanySelection.tsx    # Company selection UI
│       │   ├── BrandGuidelines.tsx     # Brand rules UI
│       │   ├── ContentCreation.tsx     # Content creation UI
│       │   ├── ContentReview.tsx       # Content review UI
│       │   └── Navigation.tsx          # App navigation
│       ├── types/                      # Shared TypeScript types
│       │   └── index.ts                # Type exports
│       ├── App.tsx                     # Main app component
│       ├── main.tsx                    # React entry point
│       └── index.css                   # Global styles
```

## Notes

- The app uses React Router for navigation
- Selected company state is managed at the App level
- Content data is temporarily stored in sessionStorage for review
