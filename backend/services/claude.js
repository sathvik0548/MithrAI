import Anthropic from "@anthropic-ai/sdk";

// Initialize Anthropic client if key is available
const apiKey = process.env.ANTHROPIC_API_KEY;
const client = apiKey && !apiKey.includes("your-anthropic-api-key") ? new Anthropic({ apiKey }) : null;
const MODEL = process.env.CLAUDE_MODEL || "claude-3-5-sonnet-20241022";

/**
 * Fallback ATS Analyzer when AI API key is not configured or API call fails.
 * Uses intelligent rule-based keyword & section heuristics.
 */
function analyzeResumeFallback({ resumeText = "", targetRole = "Software Engineer" }) {
  const text = (resumeText || "").toLowerCase();
  
  // Section checks
  const hasExperience = text.includes("experience") || text.includes("work") || text.includes("internship");
  const hasEducation = text.includes("education") || text.includes("college") || text.includes("university") || text.includes("degree") || text.includes("b.tech");
  const hasProjects = text.includes("project") || text.includes("portfolio") || text.includes("built");
  const hasSkills = text.includes("skills") || text.includes("technologies") || text.includes("programming");

  // Keyword check based on target role
  const roleKeywords = {
    "software engineer": ["javascript", "react", "node", "python", "java", "sql", "git", "api", "data structures", "algorithms"],
    "frontend developer": ["react", "javascript", "typescript", "html", "css", "tailwind", "redux", "git", "webpack", "responsive"],
    "backend developer": ["node", "express", "python", "java", "sql", "mongodb", "postgresql", "rest api", "docker", "aws"],
    "data scientist": ["python", "sql", "machine learning", "pandas", "numpy", "scikit-learn", "tensorflow", "statistics", "data analysis"],
    "full stack": ["react", "node", "express", "mongodb", "sql", "javascript", "typescript", "git", "rest api", "aws"]
  };

  const matchedKeywords = [];
  const missingKeywords = [];
  const targetLower = targetRole.toLowerCase();
  
  // Find appropriate keywords list
  let activeKeywords = roleKeywords["software engineer"];
  for (const r in roleKeywords) {
    if (targetLower.includes(r)) {
      activeKeywords = roleKeywords[r];
      break;
    }
  }

  activeKeywords.forEach(kw => {
    if (text.includes(kw)) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  });

  // Calculate scores
  const keywordsScore = Math.min(20, Math.round((matchedKeywords.length / activeKeywords.length) * 20) + 5);
  const formattingScore = (hasExperience && hasEducation && hasProjects && hasSkills) ? 18 : 12;
  const experienceScore = hasExperience ? 17 : 11;
  const skillsScore = Math.min(20, matchedKeywords.length * 3 + 8);
  const readabilityScore = text.length > 300 ? 17 : 12;

  const totalScore = Math.min(98, keywordsScore + formattingScore + experienceScore + skillsScore + readabilityScore);

  const strengths = [];
  if (hasProjects) strengths.push("Includes detailed project section highlighting hands-on technical experience.");
  if (hasExperience) strengths.push("Work/Internship section clearly structured.");
  if (matchedKeywords.length >= 3) strengths.push(`Matches essential core technical keywords (${matchedKeywords.slice(0, 3).join(", ")}).`);
  if (strengths.length === 0) strengths.push("Clean section headers and readable layout.");

  const improvements = [];
  if (missingKeywords.length > 0) improvements.push(`Incorporate target role keywords like: ${missingKeywords.slice(0, 4).join(", ")}.`);
  if (!hasExperience) improvements.push("Add relevant internship, open-source, or freelance experience.");
  improvements.push("Quantify achievements with metrics (e.g. 'Improved efficiency by 25%').");

  return {
    atsScore: totalScore,
    scores: {
      keywords: keywordsScore,
      formatting: formattingScore,
      experience: experienceScore,
      skills: skillsScore,
      readability: readabilityScore,
    },
    strengths,
    improvements,
    missingKeywords: missingKeywords.slice(0, 5),
    summary: `Resume scored ${totalScore}/100 for ${targetRole || "Software Engineer"}. Strong foundational layout with opportunity to enhance ATS keyword density.`,
  };
}

// ── Mock Interview Fallbacks ──────────────────────────────────────────────────
function generateQuestionsFallback({ role = "Software Engineer", difficulty = "Medium", count = 5 }) {
  const questionBank = [
    `Can you explain the difference between synchronous and asynchronous execution in web applications?`,
    `How do you optimize a database query or application performance when handling large datasets?`,
    `Explain the concept of RESTful APIs and how HTTP status codes are structured.`,
    `Describe a challenging bug you encountered in a recent project and how you debugged it.`,
    `What are the core differences between SQL and NoSQL databases, and when would you choose one over the other?`,
    `How do you handle state management and component lifecycle in modern web frameworks?`
  ];
  return { questions: questionBank.slice(0, count) };
}

function gradeAnswerFallback({ question, answer }) {
  const ansLen = (answer || "").trim().length;
  let score = 7;
  let feedback = "Good explanation of the core concept. To improve, try providing a concrete code example.";
  if (ansLen < 20) {
    score = 4;
    feedback = "Answer is quite brief. Elaborate further on key technical terms and application scenarios.";
  } else if (ansLen > 100) {
    score = 9;
    feedback = "Excellent thorough answer covering practical use cases and clear reasoning.";
  }
  return { score, feedback };
}

function gradeInterviewFallback({ answers = [] }) {
  const scores = answers.map(a => a.score || 7);
  const avg = scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) : 75;
  return {
    overallScore: avg,
    overallFeedback: `Solid performance overall! You demonstrated good technical knowledge. Work on structuring your answers using the STAR method (Situation, Task, Action, Result) for complex questions.`
  };
}

// ── Roadmap Fallback ─────────────────────────────────────────────────────────
function generateRoadmapFallback({ goal = "Full Stack Developer" }) {
  return {
    phases: [
      {
        title: "Phase 1: Foundations & Core Concepts",
        duration: "2-3 weeks",
        topics: ["HTML5 & Semantic Markup", "CSS3 & Modern Layouts (Flexbox/Grid)", "JavaScript ES6+ Fundamentals", "Git & GitHub Workflow"]
      },
      {
        title: "Phase 2: Frontend Engineering",
        duration: "3-4 weeks",
        topics: ["React Component Architecture", "State Management & Hooks", "API Integration with Axios/Fetch", "TailwindCSS & UI Components"]
      },
      {
        title: "Phase 3: Backend & Database Development",
        duration: "3-4 weeks",
        topics: ["Node.js & Express Server Setup", "RESTful API Design", "PostgreSQL / MongoDB Schemas", "Authentication & JWT / Supabase"]
      },
      {
        title: "Phase 4: Deployment & Real-World Projects",
        duration: "2 weeks",
        topics: ["Building a Full Stack Capstone Project", "Vercel / Render Deployment", "System Architecture & Performance", "Resume & ATS Optimization"]
      }
    ]
  };
}

// ── Exported Services ────────────────────────────────────────────────────────

export async function analyzeResume({ pdfBase64, resumeText, targetRole }) {
  if (!client) return analyzeResumeFallback({ resumeText, targetRole });
  try {
    const roleLine = targetRole ? `Target role: ${targetRole}.` : "Infer target role.";
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: "You are an expert ATS resume reviewer. Return valid JSON.",
      messages: [{ role: "user", content: `${roleLine}\n\nAnalyze resume:\n${resumeText || "Attached PDF"}\n\nReturn JSON: {atsScore (0-100), scores: {keywords (0-20), formatting (0-20), experience (0-20), skills (0-20), readability (0-20)}, strengths: [], improvements: [], missingKeywords: [], summary: ""}` }]
    });
    const textBlock = response.content.find((b) => b.type === "text");
    return JSON.parse(textBlock.text);
  } catch (err) {
    console.warn("Claude API failed or not configured, using smart fallback ATS engine:", err.message);
    return analyzeResumeFallback({ resumeText, targetRole });
  }
}

export async function generateQuestions({ role, difficulty, count = 5 }) {
  if (!client) return generateQuestionsFallback({ role, difficulty, count });
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      messages: [{ role: "user", content: `Generate ${count} ${difficulty} interview questions for ${role}. Return JSON: {"questions": ["q1", "q2"...]}` }]
    });
    const textBlock = response.content.find((b) => b.type === "text");
    return JSON.parse(textBlock.text);
  } catch (err) {
    return generateQuestionsFallback({ role, difficulty, count });
  }
}

export async function gradeAnswer({ role, question, answer }) {
  if (!client) return gradeAnswerFallback({ question, answer });
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: "user", content: `Role: ${role}\nQuestion: ${question}\nAnswer: ${answer}\nGrade 0-10 and feedback. Return JSON: {"score": 8, "feedback": "..."}` }]
    });
    const textBlock = response.content.find((b) => b.type === "text");
    return JSON.parse(textBlock.text);
  } catch (err) {
    return gradeAnswerFallback({ question, answer });
  }
}

export async function gradeInterview({ role, difficulty, answers }) {
  if (!client) return gradeInterviewFallback({ answers });
  try {
    const transcript = answers.map((a, i) => `Q${i + 1}: ${a.question}\nAnswer: ${a.answer}`).join("\n\n");
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      messages: [{ role: "user", content: `Interview transcript:\n${transcript}\nOverall score (0-100) and feedback. Return JSON: {"overallScore": 85, "overallFeedback": "..."}` }]
    });
    const textBlock = response.content.find((b) => b.type === "text");
    return JSON.parse(textBlock.text);
  } catch (err) {
    return gradeInterviewFallback({ answers });
  }
}

export async function generateRoadmap({ goal, currentSkills = [] }) {
  if (!client) return generateRoadmapFallback({ goal });
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      messages: [{ role: "user", content: `Create learning roadmap for ${goal}. Return JSON: {"phases": [{"title": "", "duration": "", "topics": []}]}` }]
    });
    const textBlock = response.content.find((b) => b.type === "text");
    return JSON.parse(textBlock.text);
  } catch (err) {
    return generateRoadmapFallback({ goal });
  }
}
