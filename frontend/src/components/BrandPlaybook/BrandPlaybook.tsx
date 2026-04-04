import './BrandPlaybook.css';
import ButtonPrimary from '../ui/ButtonPrimary';

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
          <ButtonPrimary />
        </div>
        <div className="pb-preview"></div>
      </div>
    </section>
  )
}

export default BrandPlaybook;
