import { useState, useEffect } from 'react';
import { Company } from '../types';
import './CompanySelection.css';

interface CompanySelectionProps {
  selectedCompany: Company | null;
  onSelectCompany: (company: Company) => void;
}

function CompanySelection({ selectedCompany, onSelectCompany }: CompanySelectionProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://topbox-mvp.onrender.com/api/companies');
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      } else {
        console.error('Failed to fetch companies');
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;

    try {
      setCreating(true);
      const response = await fetch('https://topbox-mvp.onrender.com/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCompanyName.trim() }),
      });

      if (response.ok) {
        const newCompany = await response.json();
        setCompanies([...companies, newCompany]);
        setNewCompanyName('');
        setShowCreateForm(false);
        onSelectCompany(newCompany);
      } else {
        console.error('Failed to create company');
      }
    } catch (error) {
      console.error('Error creating company:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleSelectCompany = (company: Company) => {
    onSelectCompany(company);
  };

  return (
    <div className="company-selection">
      <div className="company-selection-header">
        <h1>Select Company</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : '+ Create New Company'}
        </button>
      </div>

      {showCreateForm && (
        <div className="create-company-form">
          <form onSubmit={handleCreateCompany}>
            <div className="form-group">
              <label htmlFor="companyName">Company Name</label>
              <input
                id="companyName"
                type="text"
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                placeholder="Enter company name"
                required
                disabled={creating}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? 'Creating...' : 'Create Company'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading companies...</div>
      ) : companies.length === 0 ? (
        <div className="empty-state">
          <p>No companies found. Create your first company to get started.</p>
        </div>
      ) : (
        <div className="company-list">
          {companies.map((company) => (
            <div
              key={company.id}
              className={`company-card ${selectedCompany?.id === company.id ? 'selected' : ''
                }`}
              onClick={() => handleSelectCompany(company)}
            >
              <h3>{company.name}</h3>
              {company.createdAt && (
                <p className="company-date">
                  Created: {new Date(company.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CompanySelection;
