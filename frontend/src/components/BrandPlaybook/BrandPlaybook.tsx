import "./BrandPlaybook.css";

function BrandPlaybook() {
  return (
    <section className="brand-playbook component">
      <div className="section-title">
        <h2>+ BRAND PLAYBOOK</h2>
        <p className="random-symbols">////</p>
      </div>
      <div className="pb-container">
        <div className="pb-preview">
          <div className="pb-preview-options">
            <p>o</p>
            <p>o</p>
            <p>o</p>
          </div>
          <div className="pb-summary">
            <div>
              <h1>KNöTRA</h1>
              <h2>FASHION AND APPARELL</h2>
            </div>
            <div>
              <div>
                <p className="category-content">Knötra is a premium handmade clothing brand established in 2024, crafting high-quality knitwear and textile pieces with an artisanal touch. Rooted in the beauty of slow fashion, Knötra blends timeless design with meticulous craftsmanship. Offering warmly textured, thoughtfully made garments for those who value authenticity and enduring style.</p>
              </div>
              <div className="categories">
                <div className="category">
                  <p className="category-title">Tone</p>
                  <p className="category-content">Calm and intentional</p>
                </div>
                <div className="category">
                  <p className="category-title">Color palette</p>
                  <div>
                    <div className="pantone" id="color1"></div>
                    <div className="pantone" id="color2"></div>
                    <div className="pantone" id="color3"></div>
                    <div className="pantone" id="color4"></div>
                    <div className="pantone" id="color5"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="pb-saved-content"></div>
        <div className="pb-upload-container">
          <div className="pb-upload-area"></div>
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
      </div>
    </section >
  )
}

export default BrandPlaybook;
