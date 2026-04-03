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
          <button className="btn-primary"></button>
        </div>
        <div className="pb-preview"></div>
      </div>
    </section>
  )
}

export default BrandPlaybook
