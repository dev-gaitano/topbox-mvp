import './SingleContentCreation.css'

function SingleContentCreation() {
  return (
    <div className="single-content-creation">
      <div className="upload-area"></div>
      <div className="scc-left">
        <div className="scc-inputs">
          <input className="input-primary" />
          <div className="scc-options">
            <select className="dropdown-primary"></select>
            <select className="dropdown-primary"></select>
          </div>
        </div>
        <div className="btn-primary">
          <p>Generate content</p>
          <svg className="arrow-outwards" xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#D9D9D9">
            <path d="m250-223-65-65 397-397H225v-91h512v511h-92v-355L250-223Z" />
          </svg>
          <svg style={{ display: 'none' }}>
            <defs>
              <filter id="displacementFilter">
                <feTurbulence type="turbulence" baseFrequency="0.01" numOctaves="2" result="turbulence" />
                <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="200" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  )
}

export default SingleContentCreation
