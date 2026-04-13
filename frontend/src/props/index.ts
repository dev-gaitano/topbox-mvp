export interface Company {
  id: number,
  name: string,
  logo: string,
  industry: string,
  email: string,
  description: string,
  target_audience: string,
  color_palette: string[],
  unique_value?: string,
  main_competitors?: string[],
  personality: string[],
  tone?: string,
  createdAt?: string | null,
}

export interface CompanySelectionProps {
  selectedCompany: Company | null,
  onSelectCompany?: (company: Company) => void,
}
