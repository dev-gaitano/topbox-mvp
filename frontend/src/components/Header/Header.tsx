import "./Header.css"

function Header() {
  return (
    <header className="section header-section">
      <div className="brand-container">
        <p className="random-symbols">&gt; |</p>
        <img className="logo-img" src="https://res.cloudinary.com/diwkfbsgv/image/upload/v1775206748/logo_u4sz9t.svg" />
      </div>
      <div className="user-profile">
        <div className="user-content">
          <div className="user-details">
            <p className="user-role">Admin</p>
            <p className="user-name">April Baker</p>
          </div>
          <div className="pfp-wrapper">
            <img src="https://res.cloudinary.com/diwkfbsgv/image/upload/v1775313572/pfp-02_ouryex.jpg" alt="pfp" />
          </div>
        </div>

        <svg style={{ display: 'none' }}>
          <defs>
            <filter id="displacementFilter">
              <feTurbulence type="turbulence" baseFrequency="0.01" numOctaves="2" result="turbulence" />
              <feDisplacementMap in="SourceGraphic" in2="displacementMap" scale="200" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>
      </div>
    </header>
  )
}

export default Header
