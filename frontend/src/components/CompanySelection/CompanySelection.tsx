import "./CompanySelection.css"

function CompanySelection() {
  const companies = [
    {
      id: 1,
      name: "React",
      logo: "https://res.cloudinary.com/diwkfbsgv/image/upload/v1775547583/logo-00_hwbp2y.jpg"
    },
    {
      id: 2,
      name: "Medi",
      logo: "https://res.cloudinary.com/diwkfbsgv/image/upload/v1775547584/logo-02_godffk.jpg"
    },
    {
      id: 3,
      name: "Nixta",
      logo: "https://res.cloudinary.com/diwkfbsgv/image/upload/v1775546445/logo-04_jk3niz.jpg"
    },
    {
      id: 4,
      name: "Niche",
      logo: "https://res.cloudinary.com/diwkfbsgv/image/upload/v1775547583/logo-01_ibxa7x.jpg"
    },
    {
      id: 5,
      name: "Knötra",
      logo: "https://res.cloudinary.com/diwkfbsgv/image/upload/v1775547583/logo-05_v5rq5f.jpg"
    },
    {
      id: 6,
      name: "Brew bean",
      logo: "https://res.cloudinary.com/diwkfbsgv/image/upload/v1775547583/logo-06_ukevib.jpg"
    },
    {
      id: 7,
      name: "White circle",
      logo: "https://res.cloudinary.com/diwkfbsgv/image/upload/v1775547583/logo-07_tcwnsu.jpg"
    },
    {
      id: 8,
      name: "Pushy",
      logo: "https://res.cloudinary.com/diwkfbsgv/image/upload/v1775547588/logo-10_rqooqc.jpg"
    },
    {
      id: 9,
      name: "Filomena",
      logo: "https://res.cloudinary.com/diwkfbsgv/image/upload/v1775547586/logo-09_zihzoz.jpg"
    },
    {
      id: 10,
      name: "Legacy",
      logo: "https://res.cloudinary.com/diwkfbsgv/image/upload/v1775547584/logo-08_xtry5a.jpg"
    },
    {
      id: 11,
      name: "Taup studio",
      logo: "https://res.cloudinary.com/diwkfbsgv/image/upload/v1775548625/logo-11_kks8ca.jpg"
    },
    {
      id: 12,
      name: "Swoop",
      logo: "https://res.cloudinary.com/diwkfbsgv/image/upload/v1775547583/logo-03_rxioom.jpg"
    },
  ]


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
        </div>
        <div className="cs-carousel">
          {companies.map((company) => (
            <div className="cs-company-item">
              <img className="cs-company-logo" src={company.logo} alt="logo-img" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CompanySelection
