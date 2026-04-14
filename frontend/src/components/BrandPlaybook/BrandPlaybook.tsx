import "./BrandPlaybook.css";

// Props
import { CompanySelectionProps } from "../../props";

// Modules
import { useState, useEffect } from "react";

function BrandPlaybook({ selectedCompany }: CompanySelectionProps) {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  if (!selectedCompany) {
    return (
      <section className="brand-playbook component">
        <div className="section-title">
          <h2>+ BRAND PLAYBOOK</h2>
          <p className="random-symbols">////</p>
        </div>
        <div className="pb-container">
          {screenWidth <= 1100 ? (
            <div className="pb-summary" style={{ width: "100%" }}>
              <p style={{ width: "100%", padding: "2rem" }}>Select a company to view its playbook.</p>
            </div>
          ) : (
            <div className="pb-preview">
              <div className="pb-preview-options">
                <svg style={{ display: 'none' }}>
                  <defs>
                    <filter id="displacementFilter">
                      <feTurbulence type="turbulence" baseFrequency="0.01" numOctaves="2" result="turbulence" />
                      <feDisplacementMap in="SourceGraphic" in2="displacementMap" xChannelSelector="R" yChannelSelector="G" scale="200" />
                    </filter>
                  </defs>
                </svg>
              </div>
              <div className="pb-summary"></div>
            </div>
          )}
          <div className="pb-saved-content"></div>
          <div className="pb-upload-container">
            <div className="pb-upload-area">
              <div className="pb-inner-border"></div>
            </div>
            <div className="btn-primary">
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
            <svg style={{ display: 'none' }}>
              <defs>
                <filter id="displacementFilter">
                  <feTurbulence type="turbulence" baseFrequency="0.01" numOctaves="2" result="turbulence" />
                  <feDisplacementMap in="SourceGraphic" in2="displacementMap" xChannelSelector="R" yChannelSelector="G" scale="200" />
                </filter>
              </defs>
            </svg>
          </div>
          <div className="pb-summary">
            <div className="pb-summary-header">
              <h1>{selectedCompany.name}</h1>
              <h2>{selectedCompany.industry.toUpperCase()}</h2>
            </div>
            <div>
              <div className="pb-description">
                <p className="category-content">{selectedCompany.description}</p>
              </div>
              <div className="categories">
                <div className="category">
                  <p className="category-title">Tone</p>
                  <p className="category-content tone-content">{selectedCompany.tone}</p>
                </div>
                <div className="category">
                  <p className="category-title">Color palette</p>
                  <div className="pantones">
                    {selectedCompany.color_palette.map((color, index) => (
                      <div
                        key={index}
                        className="pantone"
                        style={{ backgroundColor: color }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="pb-saved-content">
          <svg style={{ display: 'none' }}>
            <defs>
              <filter id="displacementFilter">
                <feTurbulence type="turbulence" baseFrequency="0.01" numOctaves="2" result="turbulence" />
                <feDisplacementMap in="SourceGraphic" in2="displacementMap" xChannelSelector="R" yChannelSelector="G" scale="200" />
              </filter>
            </defs>
          </svg>
        </div>
        <div className="pb-upload-container">
          <div className="pb-upload-area">
            <div className="pb-inner-border"></div>
          </div>
          <div className="btn-primary">
            {screenWidth <= 1280 ? (
              <p>Upload</p>
            ) : (
              <p>Upload guidelines</p>
            )}
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
