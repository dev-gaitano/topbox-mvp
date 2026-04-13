import "./CompanySelection.css"

// Props
import { Company } from "../../props"
import { CompanySelectionProps } from "../../props"

// Destructure interface to get keys as function parameters
function CompanySelection({ selectedCompany, onSelectCompany }: CompanySelectionProps) {
  const companies: Company[] = [
    {
      id: 1,
      name: "React",
      logo: "https://res.cloudinary.com/diwkfbsgv/image/upload/v1775547583/logo-00_hwbp2y.jpg",
      industry: "Software & Technology",
      email: "hello@react.dev",
      description: "React is a world-class JavaScript library for building highly interactive and performant user interfaces. It enables developers to create complex web applications with ease by using a component-based architecture that manages state efficiently. Its massive ecosystem and strong community support make it the industry standard for modern web development and scalable front-end architecture.",
      target_audience: "Web Developers, Tech Companies",
      color_palette: ["#20232A", "#282C34", "#ABB2BF", "#61DAFB", "#FFFFFF"],
      personality: ["Innovative", "Efficient", "Community-driven"],
      tone: "Technical and modern"
    },
    {
      id: 2,
      name: "Medi",
      logo: "https://res.cloudinary.com/diwkfbsgv/image/upload/v1775547584/logo-02_godffk.jpg",
      industry: "Healthcare Services",
      email: "contact@medi.care",
      description: "Medi is at the forefront of digital healthcare, providing a seamless platform that connects patients with top-tier medical professionals. By integrating advanced scheduling, secure telemedicine, and personalized health tracking, Medi ensures that high-quality care is accessible to everyone, regardless of location. Our mission is to humanize the digital health experience through trust and innovation.",
      target_audience: "Patients, Doctors, Health Clinics",
      color_palette: ["#1976D2", "#4CAF50", "#42A5F5", "#E3F2FD", "#FFFFFF"],
      personality: ["Trustworthy", "Caring", "Professional"],
      tone: "Reassuring and professional"
    },
    {
      id: 3,
      name: "Mixta",
      logo: "https://res.cloudinary.com/diwkfbsgv/image/upload/v1775546445/logo-04_jk3niz.jpg",
      industry: "Food & Beverage",
      email: "hola@nixta.com",
      description: "Nixta is dedicated to preserving and celebrating the ancient Mesoamerican art of nixtamalization. We produce premium, organic corn-based products that serve as the foundation for authentic Mexican cuisine. By working directly with local farmers and using traditional stone-grinding methods, Nixta delivers an unparalleled depth of flavor and nutrition that honors centuries of culinary heritage.",
      target_audience: "Food Enthusiasts, Chefs, Local Markets",
      color_palette: ["#6ECFBF", "#3DA898", "#F7A8B8", "#FFF5E4", "#FFFFFF"],
      personality: ["Authentic", "Traditional", "Flavorful"],
      tone: "Warm and inviting"
    },
    {
      id: 4,
      name: "Niche",
      logo: "https://res.cloudinary.com/diwkfbsgv/image/upload/v1775547583/logo-01_ibxa7x.jpg",
      industry: "Creative Agency",
      email: "info@niche.studio",
      description: "Niche is a boutique creative agency specializing in bespoke branding and strategic marketing for companies that dare to be different. We dive deep into each brand's unique story to craft visual identities and digital campaigns that resonate with specific, high-value audiences. Our collaborative approach ensures that every project we undertake stands out as a masterpiece of design and strategy.",
      target_audience: "Small Businesses, Startups, Artisans",
      color_palette: ["#222326", "#2E5BFF", "#1A3DB5", "#3A3D45", "#F0F0F2"],
      personality: ["Creative", "Bold", "Specialized"],
      tone: "Vibrant and confident"
    },
    {
      id: 5,
      name: "Knötra",
      logo: "https://res.cloudinary.com/diwkfbsgv/image/upload/v1775547583/logo-05_v5rq5f.jpg",
      industry: "Fashion & Apparel",
      email: "info@knotra.style",
      description: "Knötra is a premium handmade clothing brand established in 2024, crafting high-quality knitwear and textile pieces with an artisanal touch. Rooted in the beauty of slow fashion, Knötra blends timeless design with meticulous craftsmanship. We offer warmly textured, thoughtfully made garments for those who value authenticity, enduring style, and the quiet luxury of ethical production methods.",
      target_audience: "Fashion-conscious individuals, Eco-aware consumers",
      color_palette: ["#3A2F28", "#2C5F52", "#C4895A", "#F2EDE6", "#FFFFFF"],
      personality: ["Artisanal", "Sustainable", "Timeless"],
      tone: "Calm and intentional"
    },
    {
      id: 6,
      name: "Brew bean",
      logo: "https://res.cloudinary.com/diwkfbsgv/image/upload/v1775547583/logo-06_ukevib.jpg",
      industry: "Hospitality & Cafe",
      email: "coffee@brewbean.com",
      description: "Brew Bean is a community-focused coffee roastery committed to sourcing the finest ethical beans from around the globe. We believe that coffee is more than just a drink; it is an experience of connection and craft. Our small-batch roasting process highlights the unique flavor profiles of every origin, ensuring that every cup served in our cafes is a tribute to the passion of our farmers.",
      target_audience: "Coffee Lovers, Early Risers, Remote Workers",
      color_palette: ["#212121", "#4E342E", "#A1887F", "#BDBDBD", "#D7CCC8"],
      personality: ["Cozy", "Energetic", "Passionate"],
      tone: "Friendly and energetic"
    },
    {
      id: 7,
      name: "White circle",
      logo: "https://res.cloudinary.com/diwkfbsgv/image/upload/v1775547583/logo-07_tcwnsu.jpg",
      industry: "Minimalist Design Tech",
      email: "design@whitecircle.io",
      description: "White Circle is a design-led technology company that applies the principles of radical minimalism to digital and physical products. We believe that by removing the unnecessary, we can create experiences that are more intuitive, beautiful, and human. Our tools are designed for those who seek clarity in a world of noise, offering a perfect balance between sophisticated engineering and aesthetic purity.",
      target_audience: "Designers, Tech Enthusiasts, Minimalists",
      color_palette: ["#212121", "#F4341C", "#E0E0E0", "#F5F5F5", "#FFFFFF"],
      personality: ["Minimalist", "Clean", "Logical"],
      tone: "Clean and direct"
    },
    {
      id: 8,
      name: "Pushy",
      logo: "https://res.cloudinary.com/diwkfbsgv/image/upload/v1775547588/logo-10_rqooqc.jpg",
      industry: "Fitness & Wellness",
      email: "go@pushy.fit",
      description: "Pushy is the ultimate high-performance fitness and wellness brand, designed to help you shatter your personal records. Through our integrated app and wearable technology, we provide real-time coaching and data analytics that keep you motivated and on track. Whether you are a professional athlete or a beginner, Pushy gives you the competitive edge needed to reach your peak physical potential.",
      target_audience: "Athletes, Fitness Beginners, Health-conscious youth",
      color_palette: ["#C4E01E", "#181818", "#4A4A4A", "#A8A8A8", "#F4F4F4"],
      personality: ["Bold", "Motivating", "Energetic"],
      tone: "Bold and motivating"
    },
    {
      id: 9,
      name: "Filomena",
      logo: "https://res.cloudinary.com/diwkfbsgv/image/upload/v1775547586/logo-09_zihzoz.jpg",
      industry: "Boutique & Lifestyle",
      email: "hello@filomena.shop",
      description: "Filomena is a curated lifestyle boutique that brings the essence of modern elegance into your home. We source hand-selected goods from artisans worldwide, focusing on items that combine timeless charm with contemporary functionality. From artisanal ceramics to sustainable textiles, Filomena helps you create a sanctuary that reflects your personal style and a deep appreciation for refined living.",
      target_audience: "Homeowners, Gift Shoppers, Decor Enthusiasts",
      color_palette: ["#8D6E63", "#F48FB1", "#F8BBD0", "#E1BEE7", "#FFF9C4"],
      personality: ["Elegant", "Soft", "Charming"],
      tone: "Elegant and soft"
    },
    {
      id: 10,
      name: "Legacy",
      logo: "https://res.cloudinary.com/diwkfbsgv/image/upload/v1775547584/logo-08_xtry5a.jpg",
      industry: "Financial Consulting",
      email: "trust@legacy.partners",
      description: "Legacy is a premier financial consulting firm dedicated to the art of wealth preservation and intergenerational planning. We provide bespoke investment strategies and comprehensive estate management for families and business owners who want to secure their future. Our team of experts combines decades of experience with a forward-looking perspective to ensure that your financial legacy remains strong.",
      target_audience: "Investors, Families, Business Owners",
      color_palette: ["#C8271A", "#E04A20", "#F5BE0B", "#110D02", "#F5EDCC"],
      personality: ["Stable", "Trustworthy", "Experienced"],
      tone: "Conservative and stable"
    },
    {
      id: 11,
      name: "Taup studio",
      logo: "https://res.cloudinary.com/diwkfbsgv/image/upload/v1775548625/logo-11_kks8ca.jpg",
      industry: "Interior Design",
      email: "create@taup.studio",
      description: "Taup Studio is an award-winning interior design firm that specializes in creating harmonious, earth-toned environments. We draw inspiration from natural textures and organic forms to design residential and commercial spaces that feel grounded and sophisticated. Our holistic approach to design ensures that every interior we create is a reflection of the client’s lifestyle, balanced with architectural integrity.",
      target_audience: "Architects, Homeowners, Real Estate Developers",
      color_palette: ["#CC7EEB", "#8B3FBF", "#C5F135", "#151515", "#F3E6FC"],
      personality: ["Neutral", "Harmonious", "Sophisticated"],
      tone: "Sophisticated and grounded"
    },
    {
      id: 12,
      name: "Swoop",
      logo: "https://res.cloudinary.com/diwkfbsgv/image/upload/v1775547583/logo-03_rxioom.jpg",
      industry: "Logistics & Delivery",
      email: "fast@swoop.delivery",
      description: "Swoop is a next-generation logistics company revolutionizing hyper-local delivery through AI-optimized routing and a sustainable fleet. We bridge the gap between local businesses and their customers by providing fast, reliable, and transparent shipping solutions. Our commitment to speed and customer satisfaction makes Swoop the preferred partner for urban residents who demand efficiency in their daily lives.",
      target_audience: "Urban Residents, Local Businesses, E-commerce shoppers",
      color_palette: ["#212121", "#BF360C", "#FF5722", "#FFCCBC", "FFFFFF"],
      personality: ["Fast", "Reliable", "Agile"],
      tone: "Fast and reliable"
    },
  ]


  return (
    <section className="company-selection component">
      <div className='section-title'>
        <h2>+ COMPANIES</h2>
      </div>
      <div className="cs-container">
        <div className="cs-add-new">
          <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" width="48" height="48">
            {/* Horizonatal bar */}
            <rect x="8" y="22" width="32" height="4" rx="1" fill="#FFFFFF" />
            {/* Vertical bar */}
            <rect x="22" y="8" width="4" height="32" rx="1" fill="#FFFFFF" />
          </svg>
        </div>
        <div className="cs-carousel">
          {/* Map saved companies */}
          {companies.map((company) => (
            <div
              key={company.id}
              onClick={() => onSelectCompany?.(company)}
              className={`cs-company-item ${selectedCompany?.id === company.id ? "selected" : ""}`}
            >
              <img className="cs-company-logo" src={company.logo} alt="logo-img" />
              {selectedCompany?.id === company.id ? (
                <h2 className="cs-company-name">{company.name.toUpperCase()}</h2>
              ) : (
                <h2 className="cs-company-name"></h2>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CompanySelection
