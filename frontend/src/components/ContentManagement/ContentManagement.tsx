import "./ContentManagement.css"
import SingleContentCreation from "./SingleContentCreation"

function ContentManagement() {
  return (
    <section className="content-management component">
      <div className="section-title">
        <h2>+ CONTENT MANAGEMENT</h2>
        <p className="random-symbols">+-------</p>
      </div>
      <div className="cm-container">
        <div className="cm-saved-content"></div>
        <div className="cm-content">
          <div className="cm-selector">
            <button className="btn-secondary">
              <p>Single content creation</p>
            </button>
            <button className="btn-secondary inactive">
              <p>Rollout content creation</p>
            </button>
          </div>
          <SingleContentCreation />
        </div>
      </div>
    </section>
  )
}

export default ContentManagement
