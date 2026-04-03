import './CompanySelection.css'

function CompanySelection() {
  return (
    <section className="company-selection component">
      <h2>+ COMPANIES</h2>
      <div className="cs-container">
        <div className="cs-add-new">
          <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" width="80" height="80">
            {/* Horizonatal bar */}
            <rect x="8" y="22" width="32" height="4" rx="1" fill="#FFFFFF" />
            {/* Vertical bar */}
            <rect x="22" y="8" width="4" height="32" rx="1" fill="#FFFFFF" />
          </svg>
        </div>
      </div>
    </section>
  )
}

export default CompanySelection
