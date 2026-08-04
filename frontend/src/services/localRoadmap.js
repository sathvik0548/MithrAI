/**
 * localRoadmap.js — Pre-built comprehensive roadmaps for each role.
 * No backend / API key required. Works 100% offline.
 */

const ROADMAPS = {
  "Full Stack Developer": [
    { title: "Web Foundations", duration: "4 weeks", topics: ["HTML5 & Semantic Markup", "CSS3, Flexbox & Grid", "Responsive Design", "JavaScript ES6+", "DOM Manipulation", "Browser DevTools"] },
    { title: "Frontend Framework", duration: "5 weeks", topics: ["React Fundamentals", "JSX & Components", "State & Props", "React Hooks (useState, useEffect)", "React Router", "Context API"] },
    { title: "Backend Development", duration: "5 weeks", topics: ["Node.js & npm", "Express.js REST APIs", "Middleware & Error Handling", "Authentication (JWT)", "File Uploads (Multer)", "Environment Variables"] },
    { title: "Database & Storage", duration: "4 weeks", topics: ["SQL Basics & PostgreSQL", "NoSQL & MongoDB", "Database Design & ORMs", "Supabase / Firebase", "Caching with Redis", "Data Migrations"] },
    { title: "DevOps & Deployment", duration: "3 weeks", topics: ["Git & GitHub", "CI/CD Pipelines", "Docker Basics", "Vercel / Render / Railway", "Environment Configuration", "Monitoring & Logging"] },
    { title: "Advanced Topics", duration: "4 weeks", topics: ["GraphQL", "WebSockets / Real-time", "Performance Optimization", "Security Best Practices", "Testing (Jest, Vitest)", "System Design Fundamentals"] },
  ],
  "Frontend Developer": [
    { title: "HTML & CSS Mastery", duration: "3 weeks", topics: ["Semantic HTML5", "CSS3 & Animations", "Flexbox & Grid", "CSS Variables & Themes", "Responsive & Mobile-First", "Accessibility (a11y)"] },
    { title: "JavaScript Depth", duration: "4 weeks", topics: ["ES6+ Features", "Async/Await & Promises", "Fetch API & Axios", "DOM & Events", "Error Handling", "Browser Storage APIs"] },
    { title: "React Ecosystem", duration: "5 weeks", topics: ["React Fundamentals", "Hooks Deep Dive", "State Management (Zustand/Redux)", "React Router", "Code Splitting", "React Performance"] },
    { title: "Tooling & Build", duration: "3 weeks", topics: ["Vite / Webpack", "npm / yarn / pnpm", "ESLint & Prettier", "TypeScript Basics", "Testing (Vitest, RTL)", "Git Workflow"] },
    { title: "UI & Design Systems", duration: "3 weeks", topics: ["Design Tokens", "Component Libraries", "Storybook", "Figma to Code", "Animations (Framer Motion)", "Dark Mode Implementation"] },
    { title: "Deployment & Performance", duration: "2 weeks", topics: ["Core Web Vitals", "Lighthouse Optimization", "Lazy Loading", "CDN & Caching", "Vercel / Netlify Deploy", "SEO Basics"] },
  ],
  "Backend Developer": [
    { title: "Programming Fundamentals", duration: "3 weeks", topics: ["Python / Node.js / Java", "OOP Concepts", "Data Structures", "Algorithms & Complexity", "Clean Code Principles", "Version Control (Git)"] },
    { title: "Web Frameworks", duration: "4 weeks", topics: ["Express.js or FastAPI", "REST API Design", "HTTP Methods & Status Codes", "Middleware Pattern", "Request Validation", "Error Handling"] },
    { title: "Databases", duration: "4 weeks", topics: ["SQL & PostgreSQL", "Query Optimization", "Indexes & Transactions", "ORMs (Prisma/SQLAlchemy)", "NoSQL (MongoDB)", "Redis Caching"] },
    { title: "Security & Auth", duration: "3 weeks", topics: ["JWT Authentication", "OAuth 2.0 / OAuth Providers", "Password Hashing (bcrypt)", "Rate Limiting", "Input Sanitization", "CORS Configuration"] },
    { title: "Scalability", duration: "4 weeks", topics: ["Microservices Architecture", "Message Queues (RabbitMQ/Kafka)", "Load Balancing", "Horizontal Scaling", "Docker & Containers", "API Gateways"] },
    { title: "Cloud & DevOps", duration: "3 weeks", topics: ["AWS / GCP / Azure Basics", "CI/CD Pipelines", "Environment Management", "Monitoring (Prometheus)", "Logging (ELK Stack)", "Database Backups"] },
  ],
  "Data Analyst": [
    { title: "Python for Data", duration: "4 weeks", topics: ["Python Basics", "NumPy Arrays", "Pandas DataFrames", "Data Cleaning", "File I/O (CSV, Excel, JSON)", "Virtual Environments"] },
    { title: "Data Visualization", duration: "3 weeks", topics: ["Matplotlib & Seaborn", "Plotly Interactive Charts", "Dashboard Design Principles", "Tableau / Power BI Basics", "Storytelling with Data", "Chart Best Practices"] },
    { title: "SQL & Databases", duration: "3 weeks", topics: ["SQL Fundamentals", "JOINs & Subqueries", "Aggregations & Window Functions", "Query Optimization", "PostgreSQL / MySQL", "ETL Pipelines"] },
    { title: "Statistics", duration: "3 weeks", topics: ["Descriptive Statistics", "Probability Distributions", "Hypothesis Testing", "Correlation & Regression", "A/B Testing", "Statistical Significance"] },
    { title: "Business Intelligence", duration: "3 weeks", topics: ["KPI Definition", "Reporting Automation", "Google Analytics", "Data Warehousing", "Looker / Metabase", "Stakeholder Communication"] },
    { title: "Advanced Analytics", duration: "4 weeks", topics: ["Time Series Analysis", "Machine Learning Basics (sklearn)", "Forecasting Models", "Cohort Analysis", "Customer Segmentation", "Predictive Analytics"] },
  ],
  "Data Scientist": [
    { title: "Math & Programming", duration: "4 weeks", topics: ["Linear Algebra", "Calculus for ML", "Probability & Statistics", "Python for Data Science", "NumPy & Pandas", "Jupyter Notebooks"] },
    { title: "ML Fundamentals", duration: "5 weeks", topics: ["Supervised Learning", "Unsupervised Learning", "scikit-learn Library", "Feature Engineering", "Cross-Validation", "Model Evaluation Metrics"] },
    { title: "Deep Learning", duration: "5 weeks", topics: ["Neural Network Basics", "TensorFlow / PyTorch", "CNNs for Image Data", "RNNs & LSTM", "Transfer Learning", "GPU Training"] },
    { title: "NLP & Generative AI", duration: "4 weeks", topics: ["Text Preprocessing", "Word Embeddings", "Transformers (BERT, GPT)", "Hugging Face", "Prompt Engineering", "LLM Fine-tuning"] },
    { title: "MLOps", duration: "3 weeks", topics: ["ML Pipelines", "Model Versioning (MLflow)", "Feature Stores", "Model Monitoring", "A/B Testing Models", "Docker for ML"] },
    { title: "Projects & Portfolio", duration: "3 weeks", topics: ["Kaggle Competitions", "End-to-End Projects", "GitHub Portfolio", "Technical Blog Writing", "Research Paper Reading", "Mock ML System Design"] },
  ],
  "DevOps Engineer": [
    { title: "Linux & Scripting", duration: "4 weeks", topics: ["Linux Commands & Navigation", "Bash Scripting", "File Permissions & Processes", "Package Management", "SSH & Remote Servers", "Cron Jobs"] },
    { title: "Version Control & CI/CD", duration: "3 weeks", topics: ["Git Advanced (branching, rebase)", "GitHub Actions", "GitLab CI/CD", "Jenkins Pipelines", "Automated Testing in CI", "Release Strategies"] },
    { title: "Containers", duration: "4 weeks", topics: ["Docker Architecture", "Dockerfile & Images", "Docker Compose", "Kubernetes Basics", "Pods & Deployments", "Kubernetes Networking"] },
    { title: "Cloud Platforms", duration: "5 weeks", topics: ["AWS Core Services (EC2, S3, RDS)", "IAM & Security Groups", "VPC & Networking", "Lambda (Serverless)", "CloudFormation/Terraform", "Azure / GCP Basics"] },
    { title: "Monitoring & Security", duration: "3 weeks", topics: ["Prometheus & Grafana", "ELK Stack (Elasticsearch)", "Log Aggregation", "Alerting Strategies", "Secrets Management", "Security Scanning"] },
    { title: "Advanced DevOps", duration: "3 weeks", topics: ["Infrastructure as Code (Terraform)", "GitOps (ArgoCD/Flux)", "Service Mesh (Istio)", "Chaos Engineering", "Cost Optimization", "SRE Principles"] },
  ],
  "Machine Learning Engineer": [
    { title: "ML Foundations", duration: "4 weeks", topics: ["Python for ML", "NumPy, Pandas, Matplotlib", "Linear Algebra & Calculus", "Probability & Statistics", "scikit-learn", "Model Evaluation"] },
    { title: "Deep Learning", duration: "5 weeks", topics: ["Neural Networks", "PyTorch Fundamentals", "CNNs & Computer Vision", "RNNs & Sequence Models", "Transformers", "GPU Computing (CUDA)"] },
    { title: "NLP & LLMs", duration: "4 weeks", topics: ["Text Processing & Tokenization", "Word Embeddings", "BERT & GPT Models", "Hugging Face Transformers", "Fine-tuning LLMs", "Retrieval Augmented Generation"] },
    { title: "MLOps & Pipelines", duration: "4 weeks", topics: ["ML Pipeline Design", "MLflow / DVC", "Feature Stores", "Model Registry", "CI/CD for ML", "Containerized Training"] },
    { title: "Production ML", duration: "3 weeks", topics: ["Model Serving (FastAPI, TorchServe)", "Model Monitoring & Drift", "A/B Testing", "Shadow Deployments", "Scalable Inference", "Cost Optimization"] },
    { title: "Specialized Topics", duration: "4 weeks", topics: ["Reinforcement Learning", "Recommender Systems", "Computer Vision Projects", "Kaggle Competition Strategy", "ML System Design", "Research Paper Implementation"] },
  ],
  "Mobile Developer": [
    { title: "React Native Basics", duration: "4 weeks", topics: ["React Native Setup", "Core Components", "Styling with StyleSheet", "Navigation (React Navigation)", "State Management", "Debugging Tools"] },
    { title: "Device Features", duration: "3 weeks", topics: ["Camera & Media", "Location Services", "Push Notifications", "Offline Storage (AsyncStorage)", "Biometric Auth", "Sensors & Accelerometer"] },
    { title: "Backend Integration", duration: "3 weeks", topics: ["REST API Integration", "GraphQL Client", "Authentication (JWT/OAuth)", "File Upload", "WebSocket/Real-time", "Background Tasks"] },
    { title: "Performance", duration: "3 weeks", topics: ["FlatList Optimization", "Memoization", "Native Modules", "Hermes Engine", "Bundle Size Reduction", "Profiling Tools"] },
    { title: "Publishing", duration: "2 weeks", topics: ["App Store (iOS) Submission", "Google Play Publishing", "App Signing & Certificates", "OTA Updates (Expo)", "Analytics (Firebase)", "Crash Reporting"] },
    { title: "Advanced", duration: "3 weeks", topics: ["Reanimated 2", "Gesture Handler", "Custom Native Modules", "Expo SDK", "TypeScript in React Native", "Testing (Detox)"] },
  ],
  "Product Manager": [
    { title: "PM Fundamentals", duration: "3 weeks", topics: ["Product Lifecycle", "Agile & Scrum", "User Story Writing", "Backlog Prioritization", "Sprint Planning", "Stakeholder Management"] },
    { title: "User Research", duration: "3 weeks", topics: ["User Interviews", "Surveys & Questionnaires", "Usability Testing", "Persona Creation", "Journey Mapping", "Empathy Mapping"] },
    { title: "Product Strategy", duration: "4 weeks", topics: ["Market Analysis", "Competitive Landscape", "OKRs & KPIs", "Product Roadmapping", "Go-to-Market Strategy", "Product Vision"] },
    { title: "Data & Analytics", duration: "3 weeks", topics: ["SQL for PMs", "Google Analytics", "Funnel Analysis", "A/B Testing", "Cohort Analysis", "Data-Driven Decision Making"] },
    { title: "Technical Knowledge", duration: "3 weeks", topics: ["System Design Basics", "APIs & Integrations", "Database Concepts", "Mobile vs Web Products", "Technical Debt", "Dev Process Understanding"] },
    { title: "Launch & Growth", duration: "4 weeks", topics: ["Feature Flagging", "Beta Testing Programs", "Product Launch Checklist", "Growth Hacking", "Pricing Strategies", "NPS & Retention Metrics"] },
  ],
};

export function getRoadmapForGoal(goal) {
  const phases = ROADMAPS[goal] || ROADMAPS["Full Stack Developer"];
  return {
    id: `local-${Date.now()}`,
    _id: `local-${Date.now()}`,
    goal,
    phases: phases.map((p) => ({
      title: p.title,
      duration: p.duration,
      topics: p.topics.map((name) => ({ name, done: false })),
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export const AVAILABLE_GOALS = Object.keys(ROADMAPS);
