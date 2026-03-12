// App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react'
import { useState, useEffect } from 'react';
import CompanySelection from './components/CompanySelection';
import BrandGuidelines from './components/BrandGuidelines';
import ContentCreation from './components/ContentCreation';
import ContentList from './components/ContentList';
import ContentReview from './components/ContentReview';
import Navigation from './components/Navigation';
import NewCompanyForm from './components/NewCompanyForm';
import { Company } from './types';
import './App.css';

function App() {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [pendingContent, setPendingContent] = useState<any | null>(null)

  useEffect(() => {
    setPendingContent(null);
  }, [selectedCompany])

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
                      <ContentCreation companyId={selectedCompany.id} onGenerated={setPendingContent} />
                      {pendingContent && (
                        <>
                          <br />
                          <ContentReview
                            companyId={selectedCompany.id}
                            pendingContent={pendingContent}
                            onClose={() => setPendingContent(null)}
                          />
                        </>
                      )}
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
              path="/content"
              element={
                selectedCompany ? (
                  <ContentList companyId={selectedCompany.id} companyName={selectedCompany.name} />
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
