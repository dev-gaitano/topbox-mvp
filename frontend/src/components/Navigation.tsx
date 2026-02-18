import { Link, useLocation } from 'react-router-dom';
import { Company } from '../types';
import './Navigation.css';

interface NavigationProps {
  selectedCompany: Company | null;
}

function Navigation({ selectedCompany }: NavigationProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          Content Manager
        </Link>
        {selectedCompany && (
          <div className="nav-company">
            <span className="nav-company-label">Company:</span>
            <span className="nav-company-name">{selectedCompany.name}</span>
          </div>
        )}
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            Companies
          </Link>
          {selectedCompany && (
            <>
              <Link 
                to="/brand-guidelines" 
                className={`nav-link ${isActive('/brand-guidelines') ? 'active' : ''}`}
              >
                Brand Guidelines
              </Link>
              <Link 
                to="/content" 
                className={`nav-link ${isActive('/content') ? 'active' : ''}`}
              >
                Content
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
