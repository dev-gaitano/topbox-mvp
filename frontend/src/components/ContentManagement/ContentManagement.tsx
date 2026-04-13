import "./ContentManagement.css"
import SingleContentCreation from "./SingleContentCreation"
import RolloutContentCreation from "./RolloutContentCreation"
import { useState } from "react"

function ContentManagement() {
  const [contentCreationMode, setContentCreationMode] = useState(0)

  // true(1) represents Rollout Content Creation mode
  // false(0) represents Single Content Creation mode
  function handleContentCreationMode() {
    if (contentCreationMode == 0) {
      setContentCreationMode(1)
    } else {
      setContentCreationMode(0)
    }
  }

  return (
    <section className="content-management component">
      <div className="section-title">
        <h2>+ CONTENT MANAGEMENT</h2>
        <p className="random-symbols">+-------</p>
      </div>
      <div className="cm-container">
        <div className="cm-saved-content"></div>
        <div className="cm-content">
          <div className={`cm-selector ${contentCreationMode ? "set-right" : "set-left"}`}>
            <button className="btn-secondary" onClick={handleContentCreationMode}>
              {contentCreationMode ? (
                <p>Rollout content creation</p>
              ) : (
                <p>Single content creation</p>
              )}
            </button>
          </div>
          <div>
            {contentCreationMode ? (
              <RolloutContentCreation />
            ) : (
              <SingleContentCreation />
            )}
          </div>
        </div>
      </div>
    </section >
  )
}

export default ContentManagement
