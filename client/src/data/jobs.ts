export interface JobOpening {
  id: string;
  title: string;
  department: string;
  type: string;
  level?: string; // Made optional since we removed level filtering
  location: string;
  description: string;
  requirements: string[];
  applicationUrl: string;
}

export const jobOpenings: JobOpening[] = [
  {
    id: "frontend-dev-1",
    title: "Senior Frontend Developer",
    department: "Engineering",
    type: "Full-time",
    level: "Senior Level",
    location: "San Francisco, CA • Remote Available",
    description: "Join our frontend team to build next-generation web applications using React, TypeScript, and modern development practices.",
    requirements: [
      "5+ years React experience",
      "TypeScript proficiency", 
      "UI/UX design skills"
    ],
    applicationUrl: "https://docs.google.com/forms/d/e/1FAIpQLSc_frontend_dev_form/viewform"
  },
  {
    id: "product-designer-1",
    title: "Product Designer",
    department: "Design",
    type: "Full-time", 
    level: "Mid Level",
    location: "New York, NY • Hybrid",
    description: "Create exceptional user experiences and drive product design strategy across our platform ecosystem.",
    requirements: [
      "3+ years product design",
      "Figma/Sketch expertise",
      "User research experience"
    ],
    applicationUrl: "https://docs.google.com/forms/d/e/1FAIpQLSc_product_designer_form/viewform"
  },
  {
    id: "devops-engineer-1",
    title: "DevOps Engineer", 
    department: "Engineering",
    type: "Full-time",
    level: "Senior Level",
    location: "Austin, TX • Remote Available",
    description: "Build and maintain scalable infrastructure while implementing CI/CD pipelines and monitoring systems.",
    requirements: [
      "AWS/GCP experience",
      "Docker & Kubernetes",
      "Infrastructure as Code"
    ],
    applicationUrl: "https://docs.google.com/forms/d/e/1FAIpQLSc_devops_engineer_form/viewform"
  },
  {
    id: "marketing-manager-1",
    title: "Marketing Manager",
    department: "Marketing", 
    type: "Full-time",
    level: "Mid Level",
    location: "Los Angeles, CA • Hybrid",
    description: "Lead digital marketing campaigns and drive brand awareness across multiple channels and platforms.",
    requirements: [
      "4+ years marketing experience",
      "Digital marketing expertise", 
      "Analytics & reporting skills"
    ],
    applicationUrl: "https://docs.google.com/forms/d/e/1FAIpQLSc_marketing_manager_form/viewform"
  },
  {
    id: "data-scientist-1",
    title: "Data Scientist",
    department: "Engineering",
    type: "Full-time",
    level: "Mid Level", 
    location: "Seattle, WA • Remote Available",
    description: "Analyze complex datasets and build machine learning models to drive business insights and product decisions.",
    requirements: [
      "Python/R proficiency",
      "Machine learning expertise",
      "Statistical analysis skills"
    ],
    applicationUrl: "https://docs.google.com/forms/d/e/1FAIpQLSc_data_scientist_form/viewform"
  },
  {
    id: "sales-rep-1", 
    title: "Sales Representative",
    department: "Sales",
    type: "Full-time",
    level: "Entry Level",
    location: "Chicago, IL • On-site",
    description: "Build relationships with potential clients and drive revenue growth through consultative selling approach.",
    requirements: [
      "1+ years sales experience",
      "Strong communication skills",
      "CRM software knowledge"
    ],
    applicationUrl: "https://docs.google.com/forms/d/e/1FAIpQLSc_sales_rep_form/viewform"
  },
  {
    id: "backend-dev-1",
    title: "Backend Developer",
    department: "Engineering",
    type: "Contract", 
    level: "Mid Level",
    location: "Remote • 6-month contract",
    description: "Develop robust APIs and microservices using Node.js, Python, and cloud infrastructure technologies.",
    requirements: [
      "Node.js/Python expertise",
      "Database design skills",
      "API development experience"
    ],
    applicationUrl: "https://docs.google.com/forms/d/e/1FAIpQLSc_backend_dev_form/viewform"
  },
  {
    id: "operations-manager-1",
    title: "Operations Manager",
    department: "Operations",
    type: "Full-time",
    level: "Senior Level",
    location: "Boston, MA • Hybrid",
    description: "Streamline business operations and lead process improvement initiatives across multiple departments.",
    requirements: [
      "5+ years operations experience", 
      "Process optimization skills",
      "Team leadership experience"
    ],
    applicationUrl: "https://docs.google.com/forms/d/e/1FAIpQLSc_operations_manager_form/viewform"
  },
  {
    id: "social-media-content-1",
    title: "Social Media and Content Creation Specialist",
    department: "Marketing",
    type: "Full-time",
    level: "Entry Level",
    location: "Navi Mumbai, India • On-site",
    description: "Create engaging social media content, manage social media accounts, and develop content strategies for automotive brand MotorOctane.",
    requirements: [
      "Experience with Facebook & Instagram business tools",
      "Photo and video editing skills",
      "Understanding of social media trends",
      "Creative content creation abilities"
    ],
    applicationUrl: "https://docs.google.com/forms/d/e/1FAIpQLSc_social_media_form/viewform"
  },
  {
    id: "content-writer-1",
    title: "Content Writer",
    department: "Marketing",
    type: "Full-time",
    level: "Mid Level",
    location: "Navi Mumbai, India • On-site",
    description: "Create compelling written content for automotive brand MotorOctane, including articles, blog posts, social media content, and marketing materials.",
    requirements: [
      "2+ years of content writing experience",
      "Strong understanding of SEO principles",
      "Experience writing automotive or technical content",
      "Excellent grammar and storytelling skills"
    ],
    applicationUrl: "https://docs.google.com/forms/d/e/1FAIpQLSc_content_writer_form/viewform"
  },
  {
    id: "videographer-1",
    title: "Videographer",
    department: "Production",
    type: "Full-time",
    level: "Mid Level",
    location: "Navi Mumbai, India • On-site",
    description: "Capture high-quality video content for automotive brand MotorOctane, including product shoots, automotive reviews, and promotional content using professional equipment.",
    requirements: [
      "Experience with DSLR cameras and gimbal operation",
      "Knowledge of video production stages",
      "Portfolio of previous video work",
      "Understanding of automotive photography/videography"
    ],
    applicationUrl: "https://docs.google.com/forms/d/e/1FAIpQLSc_videographer_form/viewform"
  },
  {
    id: "graphic-designer-1",
    title: "Graphic Designer",
    department: "Design",
    type: "Full-time",
    level: "Mid Level",
    location: "Navi Mumbai, India • On-site",
    description: "We're looking for a creative Graphic Designer passionate about automotive culture. You'll design engaging visuals for Instagram, YouTube, and our Website, including posts, carousels, stories, and thumbnails. Collaborate with marketing and content teams to bring fresh ideas to life while managing multiple projects.",
    requirements: [
      "2+ years of graphic design experience",
      "Proficiency in Adobe Creative Suite (Photoshop, Illustrator, After Effects)",
      "Understanding of social media design trends",
      "Experience with automotive or lifestyle brand design"
    ],
    applicationUrl: "https://docs.google.com/forms/d/e/1FAIpQLSc_graphic_designer_form/viewform"
  }
];
