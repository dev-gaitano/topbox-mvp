import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Company } from '../types';
import './CompanySelection.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface CompanySelectionProps {
  selectedCompany: Company | null;
  onSelectCompany: (company: Company) => void;
}

function CompanySelection({ selectedCompany, onSelectCompany }: CompanySelectionProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/companies`);
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      } else {
        console.error('Failed to fetch companies');
        console.log(response)
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cs-wrapper">
      <div className="cs-header">
        <h1>Select Company</h1>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/companies/new')}
        >
          + Create New Company
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading companies...</div>
      ) : companies.length === 0 ? (
        <div className="empty-state">
          <p>No companies found. Create your first company to get started.</p>
        </div>
      ) : (
        <div className="cs-list">
          {companies.map((company) => (
            <div
              key={company.id}
              className={`cs-card ${selectedCompany?.id === company.id ? "selected" : ""}`}
              onClick={() => onSelectCompany(company)}
            >
              <h3>{company.name}</h3>
              <h4>{company.industry}</h4>
              {company.createdAt && (
                <p className="cs-date">
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
