import './SingleContentCreation.css'
import ButtonPrimary from '../ui/ButtonPrimary'

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
        <ButtonPrimary />
      </div>
    </div>
  )
}

export default SingleContentCreation
