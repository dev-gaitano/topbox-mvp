import './Footer.css'

function Footer() {
  return (
    <footer className="section footer-section">
      <div className='section-title'>
        <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" width="48" height="48">
          {/* Horizonatal bar */}
          <rect x="8" y="21" width="32" height="6" rx="1" fill="#FFFFFF" />
          {/* Vertical bar */}
          <rect x="21" y="8" width="6" height="32" rx="1" fill="#FFFFFF" />
        </svg>
        <h1>TOPBOX STUDIOS</h1>
      </div>
      <p>STAY AHEAD</p>
    </footer>
  )
}

export default Footer
