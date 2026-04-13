import "./Main.css"

// Components
import CompanySelection from "../CompanySelection/CompanySelection";
import BrandPlaybook from "../BrandPlaybook/BrandPlaybook";
import ContentManagement from "../ContentManagement/ContentManagement";

// Props
import { Company } from "../../props";

// Modules
import { useState } from "react";

function Main() {
  // Define state variable to manage state of selected company
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

  return (
    <main className="section main-section">
      <CompanySelection selectedCompany={selectedCompany} onSelectCompany={setSelectedCompany} />
      <BrandPlaybook selectedCompany={selectedCompany} />
      <ContentManagement />
    </main>
  )
}

export default Main
