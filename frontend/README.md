# Frontend - Content Management System

A React + TypeScript frontend application for managing content creation with brand guidelines.

## Features

- **Company Management**: Select existing companies or create new ones
- **Brand Guidelines**: Upload or generate brand guidelines
- **Content Creation**: Create content posts with topics, platform selection, and reference images
- **Content Review**: Review and edit generated content prompts and captions

## Tech Stack

- React 18
- TypeScript
- React Router DOM
- Vanilla CSS
- Vite

## Getting Started

### Installation

```bash
npm install
```

### Development

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

### Brand Guidelines
- `POST /api/brand-guidelines/upload` - Upload brand guidelines file
- `POST /api/brand-guidelines/generate` - Generate brand guidelines
- `POST /api/brand-guidelines/save` - Save generated guidelines

### Content
- `POST /api/content/create` - Create new content post
- `GET /api/content/latest` - Get latest content for a company
- `POST /api/content/save` - Save content with prompt and caption

## Project Structure

```
src/
├── components/          # React components
│   ├── CompanySelection.tsx
│   ├── BrandGuidelines.tsx
│   ├── ContentCreation.tsx
│   ├── ContentReview.tsx
│   └── Navigation.tsx
├── types/              # TypeScript type definitions
│   └── index.ts
├── App.tsx             # Main app component with routing
├── main.tsx            # Entry point
└── index.css           # Global styles
```

## Notes

- The app uses React Router for navigation
- API calls are configured to proxy to `http://localhost:5000` (Flask backend)
- Selected company state is managed at the App level
- Content data is temporarily stored in sessionStorage for review
