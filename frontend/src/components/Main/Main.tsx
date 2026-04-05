import "./Main.css"

import CompanySelection from "../CompanySelection/CompanySelection";
import BrandPlaybook from "../BrandPlaybook/BrandPlaybook";
import ContentManagement from "../ContentManagement/ContentManagement";

function Main() {
  return (
    <main className="section main-section">
      <CompanySelection />
      <BrandPlaybook />
      <ContentManagement />
    </main>
  )
}

export default Main
