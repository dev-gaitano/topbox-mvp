import './ContentManagement.css'
import SingleContentCreation from './SingleContentCreation'

function ContentManagement() {
  return (
    <section className="content-management component">
      <div className="section-title">
        <h2>+ CONTENT MANAGEMENT</h2>
        <p className="random-symbols">+-------</p>
      </div>
      <div className="cm-container">
        <div className="cm-selector">
          <button className="btn-secondary"></button>
        </div>
        <SingleContentCreation />
      </div>
    </section>
  )
}

export default ContentManagement
