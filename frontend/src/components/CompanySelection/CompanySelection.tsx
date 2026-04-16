import "./CompanySelection.css"

// Props
import { Company } from "../../props"
import { CompanySelectionProps } from "../../props"
import { useEffect, useState } from "react"

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Destructure interface to get keys as function parameters
function CompanySelection({ selectedCompany, onSelectCompany }: CompanySelectionProps) {
  const [companies, setCompanies] = useState<Company[]>([])

  // Fetch companies from api
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/companies`)
        const resJson = await res.json()
        setCompanies(resJson)
      } catch (e) {
        console.error('Error fetching companies:', e);
      }
    }

    // useEffect doesn't take async fn as callback
    fetchCompanies()
  }, [])

  return (
    <section className="company-selection component">
      <div className='section-title'>
        <h2>+ COMPANIES</h2>
      </div>
      <div className="cs-container">
        <div className="cs-add-new">
          <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" width="48" height="48">
            {/* Horizonatal bar */}
            <rect x="8" y="22" width="32" height="4" rx="1" fill="#FFFFFF" />
            {/* Vertical bar */}
            <rect x="22" y="8" width="4" height="32" rx="1" fill="#FFFFFF" />
          </svg>
          <svg style={{ display: 'none' }}>
            <defs>
              <filter id="displacementFilter">
                <feTurbulence type="turbulence" baseFrequency="0.01" numOctaves="2" result="turbulence" />
                <feDisplacementMap in="SourceGraphic" in2="displacementMap" xChannelSelector="R" yChannelSelector="G" scale="200" />
              </filter>
            </defs>
          </svg>
        </div>
        <div className="cs-carousel">
          {/* Map saved companies */}
          {companies.map((company) => (
            <div
              key={company.id}
              onClick={() => onSelectCompany?.(company)}
              className={`cs-company-item ${selectedCompany?.id === company.id ? "selected" : ""}`}
            >
              <img className="cs-company-logo" src={company.logo} alt="logo-img" />
              {selectedCompany?.id === company.id ? (
                <h2 className="cs-company-name">{company.name.toUpperCase()}</h2>
              ) : (
                <h2 className="cs-company-name"></h2>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CompanySelection
