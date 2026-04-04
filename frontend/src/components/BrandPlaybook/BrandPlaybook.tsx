import './BrandPlaybook.css';

function BrandPlaybook() {
  return (
    <section className="brand-playbook component">
      <div className="section-title">
        <h2>+ BRAND PLAYBOOK</h2>
        <p className="random-symbols">////</p>
      </div>
      <div className="pb-container">
        <div className="pb-upload-container">
          <div className="upload-area"></div>
          <div className="btn-primary">
            <p>Upload guidelines</p>
            <svg className="arrow-outwards" xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#D9D9D9">
              <path d="m250-223-65-65 397-397H225v-91h512v511h-92v-355L250-223Z" />
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
        </div>
        <div className="pb-preview"></div>
      </div>
    </section>
  )
}

export default BrandPlaybook;
