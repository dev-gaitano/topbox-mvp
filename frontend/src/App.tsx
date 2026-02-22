// App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/next'
import { useState } from 'react';
import CompanySelection from './components/CompanySelection';
import BrandGuidelines from './components/BrandGuidelines';
import ContentCreation from './components/ContentCreation';
import ContentReview from './components/ContentReview';
import Navigation from './components/Navigation';
import NewCompanyForm from './components/NewCompanyForm';
import { Company } from './types';
import './App.css';

function App() {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  return (
    <Router>
      <div className="app">
        <Navigation selectedCompany={selectedCompany} />
        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <CompanySelection
                    selectedCompany={selectedCompany}
                    onSelectCompany={setSelectedCompany}
                  />
                  <br />
                  <br />
                  {selectedCompany && (
                    <>
                      <BrandGuidelines companyId={selectedCompany.id} />
                      <br />
                      <br />
                      <ContentCreation companyId={selectedCompany.id} />
                    </>
                  )}
                </>
              }
            />
            <Route
              path="/companies/new"
              element={<NewCompanyForm onSuccess={setSelectedCompany} />}
            />
            <Route
              path="/content/review"
              element={
                selectedCompany ? (
                  <ContentReview companyId={selectedCompany.id} />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Analytics />
      </div>
    </Router>
  );
}

export default App;
