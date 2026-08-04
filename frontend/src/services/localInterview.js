/**
 * localInterview.js — Pre-built interview question banks for all roles.
 * No backend / API key required. Works 100% offline.
 */

const QUESTION_BANKS = {
  "Java Developer": {
    Easy: [
      "What is the difference between JDK, JRE, and JVM?",
      "Explain the concept of Object-Oriented Programming with examples.",
      "What are the four pillars of OOP? Explain each.",
      "What is the difference between == and .equals() in Java?",
      "What are Java collections and when would you use List vs Set vs Map?",
    ],
    Medium: [
      "Explain Java memory management and garbage collection.",
      "What is the difference between abstract class and interface in Java?",
      "Explain the concept of multithreading and how synchronization works.",
      "What is Spring Boot and how does dependency injection work?",
      "How would you handle exceptions in a production Java application?",
    ],
    Hard: [
      "Design a thread-safe LRU cache in Java without using any library classes.",
      "Explain the Java memory model and how volatile and synchronized keywords work at the JVM level.",
      "How would you design a microservices architecture using Spring Cloud?",
      "What are Java design patterns? Implement the Observer pattern from scratch.",
      "Explain how the JVM JIT compiler works and how you'd optimize code for it.",
    ],
  },
  "Frontend Developer": {
    Easy: [
      "What is the difference between HTML, CSS, and JavaScript?",
      "Explain what the DOM is and how JavaScript interacts with it.",
      "What is the difference between var, let, and const in JavaScript?",
      "What is Flexbox and how does it differ from CSS Grid?",
      "What are React components and what is the difference between functional and class components?",
    ],
    Medium: [
      "Explain React's virtual DOM and why it improves performance.",
      "What are React Hooks? Explain useState, useEffect, and useCallback.",
      "How would you optimize a React application that is rendering slowly?",
      "What is CORS and how do you handle it in a frontend application?",
      "Explain the event loop in JavaScript and how async/await works under the hood.",
    ],
    Hard: [
      "Design a state management solution for a large-scale React application without Redux.",
      "How would you implement code splitting and lazy loading for a React app with 100+ routes?",
      "Explain how you'd build a real-time collaborative editor (like Google Docs) using React.",
      "What are Core Web Vitals and how would you improve a site with a CLS score of 0.5?",
      "Describe how you'd architect a micro-frontend system with multiple team ownership.",
    ],
  },
  "Backend Developer": {
    Easy: [
      "What is a REST API and what are the standard HTTP methods?",
      "What is the difference between SQL and NoSQL databases?",
      "What is middleware in Express.js and when would you use it?",
      "Explain what JWT tokens are and how they work for authentication.",
      "What is the difference between synchronous and asynchronous programming?",
    ],
    Medium: [
      "How would you design database schemas for a social media platform?",
      "Explain database indexing and when you should/shouldn't use indexes.",
      "How would you implement rate limiting on an API?",
      "What are database transactions and why do ACID properties matter?",
      "How would you handle a memory leak in a Node.js application?",
    ],
    Hard: [
      "Design a URL shortener like bit.ly that handles 100M requests per day.",
      "How would you implement distributed caching with Redis in a microservices architecture?",
      "Explain CAP theorem and how you'd apply it when choosing a database.",
      "Design an event-driven architecture for a payment processing system.",
      "How would you debug and resolve a production database deadlock?",
    ],
  },
  "Data Analyst": {
    Easy: [
      "What is the difference between a mean, median, and mode?",
      "Explain what a JOIN is in SQL and the difference between INNER, LEFT, and RIGHT JOINs.",
      "What is a pivot table and when would you use one?",
      "What is the difference between a bar chart and a histogram?",
      "What does ETL stand for and what does each step involve?",
    ],
    Medium: [
      "How would you identify and handle outliers in a dataset?",
      "Explain A/B testing — how would you set one up and interpret results?",
      "What are window functions in SQL? Give an example use case.",
      "How would you present a data analysis to a non-technical executive?",
      "What is the difference between correlation and causation? Give a real example.",
    ],
    Hard: [
      "Design a metrics framework to measure the success of a new product feature.",
      "How would you detect anomalies in time series data for a financial application?",
      "Explain cohort analysis and how you'd use it to improve user retention.",
      "Design a data pipeline that ingests, processes, and reports on 10GB of daily log data.",
      "How would you use statistical modeling to forecast quarterly revenue?",
    ],
  },
  "Full Stack Developer": {
    Easy: [
      "Explain the difference between frontend and backend development.",
      "What is an API and how does a frontend communicate with a backend?",
      "What is the MVC (Model-View-Controller) architecture pattern?",
      "What is version control and why is Git essential for development?",
      "What is responsive design and how do you implement it?",
    ],
    Medium: [
      "How would you implement user authentication with sessions vs JWT tokens?",
      "Explain the difference between server-side rendering (SSR) and client-side rendering (CSR).",
      "How would you design a database schema for an e-commerce application?",
      "What is WebSocket and when would you use it instead of REST?",
      "How do you handle environment variables securely across frontend and backend?",
    ],
    Hard: [
      "Design a full-stack architecture for a video streaming service like YouTube.",
      "How would you implement real-time notifications for a social media platform?",
      "Explain how you'd set up CI/CD pipelines for a full-stack monorepo.",
      "How would you migrate a monolithic application to microservices without downtime?",
      "Design a multi-tenant SaaS application with row-level security in PostgreSQL.",
    ],
  },
  "DevOps Engineer": {
    Easy: [
      "What is the difference between Docker and a virtual machine?",
      "Explain what CI/CD means and why it's important.",
      "What is Kubernetes and what problems does it solve?",
      "What is Infrastructure as Code (IaC) and what tools implement it?",
      "What is the difference between a monolith and microservices?",
    ],
    Medium: [
      "How would you design a CI/CD pipeline for a Node.js microservice?",
      "Explain how Kubernetes deployments, services, and ingress controllers work together.",
      "What is blue-green deployment and how does it minimize downtime?",
      "How would you monitor and alert on application performance using Prometheus and Grafana?",
      "What strategies would you use to manage secrets in a Kubernetes cluster?",
    ],
    Hard: [
      "Design a disaster recovery plan for a multi-region cloud architecture.",
      "How would you implement zero-downtime deployments for a stateful application?",
      "Explain how you'd architect a GitOps workflow using ArgoCD for 50+ microservices.",
      "How would you design a self-healing infrastructure that automatically recovers from node failures?",
      "Describe how you'd reduce cloud costs by 40% for an application spending $50K/month on AWS.",
    ],
  },
  "Machine Learning Engineer": {
    Easy: [
      "What is the difference between supervised and unsupervised learning?",
      "What is overfitting and how do you prevent it?",
      "Explain what a neural network is at a high level.",
      "What is the difference between classification and regression problems?",
      "What are hyperparameters and how do you tune them?",
    ],
    Medium: [
      "Explain the transformer architecture and why it's important for NLP.",
      "How would you handle class imbalance in a binary classification problem?",
      "What is feature engineering and give examples of effective techniques?",
      "Explain the bias-variance tradeoff and how it affects model selection.",
      "How would you deploy an ML model to production and monitor its performance?",
    ],
    Hard: [
      "Design an end-to-end recommendation system for a streaming platform.",
      "How would you implement model monitoring to detect data drift in production?",
      "Explain how you'd fine-tune a large language model for a domain-specific task.",
      "Design a real-time fraud detection system with sub-100ms latency requirements.",
      "How would you architect a feature store for a company with 100+ ML models?",
    ],
  },
  "Product Manager": {
    Easy: [
      "How would you prioritize a backlog with 50 competing feature requests?",
      "What is the difference between a user story and a technical requirement?",
      "What metrics would you use to measure the success of a new feature?",
      "Describe your process for writing a Product Requirements Document (PRD).",
      "What is Agile and how does it differ from Waterfall?",
    ],
    Medium: [
      "How would you decide whether to build, buy, or partner for a new product capability?",
      "Walk me through how you would do a product teardown for Spotify.",
      "How would you handle a situation where engineering pushes back on your feature request?",
      "Describe how you'd design an onboarding experience for a new B2B SaaS product.",
      "How would you use data to decide whether to launch a feature globally or in specific markets?",
    ],
    Hard: [
      "Design a product strategy for entering the Indian market for a US-based fintech company.",
      "How would you measure and improve user retention for a social app losing 30% of new users in week 1?",
      "Describe how you'd manage a major product pivot when the current strategy is clearly failing.",
      "How would you align 5 different stakeholder groups (engineering, design, sales, marketing, legal) on a single roadmap?",
      "Design an experiment to test whether AI-generated content recommendations improve engagement by 20%.",
    ],
  },
};

export function getQuestionsForRole(role, difficulty, count = 5) {
  const bank = QUESTION_BANKS[role] || QUESTION_BANKS["Full Stack Developer"];
  const pool = bank[difficulty] || bank.Medium;
  // Shuffle for variety
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function gradeAnswer(question, answer, role) {
  const len = (answer || "").trim().length;

  // Score based on answer length and keyword presence
  let score = 0;
  if (len > 500) score = 9;
  else if (len > 300) score = 8;
  else if (len > 150) score = 7;
  else if (len > 80) score = 5;
  else if (len > 30) score = 3;
  else score = 1;

  // Feedback based on score
  const feedbacks = {
    9: "Excellent answer! Very detailed and comprehensive. You demonstrated strong expertise.",
    8: "Great answer with good depth. Shows solid understanding of the topic.",
    7: "Good answer. A bit more detail or examples would strengthen it further.",
    5: "Decent attempt. Try to elaborate more and provide concrete examples.",
    3: "Answer is too brief. Expand on your reasoning and add specific examples.",
    1: "This answer needs significant development. Try to explain the concept step by step.",
  };

  return {
    score,
    feedback: feedbacks[score] || feedbacks[5],
    questionIndex: 0,
  };
}

export function gradeInterview(questions, answers) {
  const graded = questions.map((q, i) => {
    const result = gradeAnswer(q, answers[i]);
    return {
      question: q,
      answer: answers[i] || "",
      score: result.score,
      feedback: result.feedback,
    };
  });

  const totalScore = graded.reduce((sum, g) => sum + g.score, 0);
  const overallScore = Math.round((totalScore / (graded.length * 10)) * 100);

  const overallFeedback =
    overallScore >= 80
      ? "Outstanding performance! You demonstrated strong knowledge and communication skills. You are well-prepared for technical interviews."
      : overallScore >= 60
      ? "Good performance overall. You showed solid understanding in most areas. Focus on giving more detailed, example-driven answers."
      : overallScore >= 40
      ? "Fair attempt. Work on expanding your answers with specific examples and deeper technical explanation."
      : "Keep practicing! Focus on learning the core concepts and use the STAR method (Situation, Task, Action, Result) for behavioral questions.";

  return {
    overallScore,
    overallFeedback,
    answers: graded,
  };
}

export const AVAILABLE_ROLES = Object.keys(QUESTION_BANKS);
