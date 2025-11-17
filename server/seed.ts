import { storage } from "./storage";

// Seed data based on existing frontend job data
const seedJobs = [
  {
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
  }
];

async function seedDatabase() {
  try {
    console.log("Starting database seeding...");
    
    // Check if jobs already exist
    const existingJobs = await storage.getAllJobs();
    if (existingJobs.length > 0) {
      console.log("Database already has jobs, skipping seed");
      return;
    }

    // Insert all seed jobs
    for (const jobData of seedJobs) {
      await storage.createJob(jobData);
      console.log(`Created job: ${jobData.title}`);
    }

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().then(() => {
    console.log("Seeding complete");
    process.exit(0);
  });
}

export { seedDatabase };