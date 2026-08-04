/**
 * localAnalyzer.js
 * Fully client-side ATS resume analysis engine.
 * No backend / API key required.
 */

// ── PDF Text Extraction (Vite-compatible pdfjs-dist v6) ──────────────────────
export async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();

  // Vite-compatible worker setup for pdfjs-dist v6
  const pdfjsLib = await import("pdfjs-dist");

  // Use import.meta.url-based resolution so Vite bundles the worker correctly
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).href;

  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((s) => s.str).join(" ") + "\n";
  }

  if (!text.trim()) {
    throw new Error("Could not extract text from this PDF. Try a different file.");
  }

  return text;
}

// ── Keyword Banks ────────────────────────────────────────────────────────────
const TECH_KEYWORDS = [
  "javascript","python","java","react","node","typescript","sql","html","css",
  "git","docker","kubernetes","aws","azure","gcp","mongodb","postgresql","mysql",
  "rest","api","graphql","redux","vue","angular","spring","express","flask",
  "django","tensorflow","pytorch","scikit","pandas","numpy","linux","agile",
  "scrum","ci/cd","devops","microservices","machine learning","deep learning",
  "data analysis","data science","cloud","backend","frontend","full stack",
];

const SOFT_SKILLS = [
  "leadership","communication","teamwork","problem solving","critical thinking",
  "project management","collaboration","time management","adaptability",
];

const RESUME_SECTIONS = [
  "experience","education","skills","projects","summary","objective",
  "certifications","achievements","awards","publications","volunteer",
];

const ACTION_VERBS = [
  "developed","implemented","designed","built","created","led","managed",
  "improved","optimized","deployed","architected","delivered","launched",
  "increased","reduced","collaborated","mentored","automated",
];

const BAD_PATTERNS = [
  /responsible for/gi, /duties include/gi, /worked on/gi,
  /helped with/gi, /assisted in/gi, /was involved/gi,
];

// ── Detect target role from text ─────────────────────────────────────────────
function detectRole(text) {
  const t = text.toLowerCase();
  if (t.includes("machine learning") || t.includes("tensorflow") || t.includes("pytorch")) return "Machine Learning Engineer";
  if (t.includes("data analyst") || (t.includes("data") && t.includes("pandas"))) return "Data Analyst";
  if (t.includes("devops") || t.includes("kubernetes") || t.includes("ci/cd")) return "DevOps Engineer";
  if (t.includes("backend") || t.includes("node.js") || t.includes("spring")) return "Backend Developer";
  if (t.includes("frontend") || t.includes("react") || t.includes("vue")) return "Frontend Developer";
  if (t.includes("full stack") || t.includes("fullstack")) return "Full Stack Developer";
  return "Software Developer";
}

// ── Main Analysis ────────────────────────────────────────────────────────────
export function analyzeResume(text, fileName = "") {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);

  // 1. Keywords found/missing
  const foundKeywords = TECH_KEYWORDS.filter((k) => lower.includes(k));
  const missingKeywords = TECH_KEYWORDS.filter((k) => !lower.includes(k)).slice(0, 12);

  // 2. Sections detected
  const foundSections = RESUME_SECTIONS.filter((s) => lower.includes(s));

  // 3. Action verbs
  const foundVerbs = ACTION_VERBS.filter((v) => lower.includes(v));

  // 4. Soft skills
  const foundSoftSkills = SOFT_SKILLS.filter((s) => lower.includes(s));

  // 5. Bad patterns
  const badCount = BAD_PATTERNS.filter((p) => p.test(text)).length;

  // 6. Contact info
  const hasEmail    = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/.test(text);
  const hasPhone    = /(\+?\d[\d\s\-().]{7,})/.test(text);
  const hasLinkedIn = /linkedin\.com/i.test(text);
  const hasGitHub   = /github\.com/i.test(text);

  // 7. Length
  const wordCount = words.length;

  // ── Scoring ────────────────────────────────────────────────────────────────
  let keywords   = Math.min(20, Math.round((foundKeywords.length / 18) * 20));
  let formatting = 0;
  if (foundSections.length >= 4) formatting += 8;
  else if (foundSections.length >= 2) formatting += 5;
  if (hasEmail)            formatting += 3;
  if (hasPhone)            formatting += 2;
  if (hasLinkedIn || hasGitHub) formatting += 3;
  if (wordCount >= 150 && wordCount <= 800) formatting += 4;
  formatting = Math.min(20, formatting);

  let skills = Math.min(20, Math.round(
    (foundKeywords.length * 0.6 + foundSoftSkills.length * 0.5) / 1.5
  ));

  let experience = Math.max(0, Math.min(20, foundVerbs.length * 2 - badCount * 2));
  
  let readability = 0;
  if (wordCount > 100)  readability += 6;
  if (wordCount > 250)  readability += 4;
  if (badCount === 0)   readability += 5;
  if (foundVerbs.length >= 5) readability += 5;
  readability = Math.min(20, readability);

  const atsScore = Math.max(25, Math.min(98, keywords + formatting + skills + experience + readability));

  // ── Feedback ────────────────────────────────────────────────────────────────
  const strengths = [];
  if (foundKeywords.length >= 8) strengths.push(`Strong technical keyword coverage (${foundKeywords.length} keywords detected).`);
  if (hasEmail && hasPhone)       strengths.push("Contact information is present and properly formatted.");
  if (hasLinkedIn)                strengths.push("LinkedIn profile link is included — great for recruiters.");
  if (hasGitHub)                  strengths.push("GitHub profile link is present, showcasing your code portfolio.");
  if (foundVerbs.length >= 6)     strengths.push(`${foundVerbs.length} strong action verbs found — shows impact-focused writing.`);
  if (foundSections.length >= 5)  strengths.push("Resume is well-structured with multiple clear sections.");
  if (foundSoftSkills.length >= 3) strengths.push(`Soft skills like ${foundSoftSkills.slice(0, 3).join(", ")} are highlighted.`);
  if (wordCount >= 200 && wordCount <= 700) strengths.push("Resume length is optimal (concise and thorough).");
  if (strengths.length === 0)     strengths.push("Resume content was parsed successfully.");

  const improvements = [];
  if (foundKeywords.length < 6)      improvements.push("Add more technical keywords relevant to your target role.");
  if (!lower.includes("summary"))    improvements.push("Add a professional summary at the top to capture recruiter attention.");
  if (!lower.includes("projects"))   improvements.push("Include a Projects section with links to demonstrate practical skills.");
  if (!lower.includes("certif"))     improvements.push("Consider adding certifications to strengthen your profile.");
  if (!hasLinkedIn)                  improvements.push("Add your LinkedIn profile URL to boost recruiter trust.");
  if (!hasGitHub)                    improvements.push("Add your GitHub URL to showcase real code samples.");
  if (badCount > 0)                  improvements.push(`Replace passive phrases like "responsible for" with strong action verbs.`);
  if (foundVerbs.length < 4)         improvements.push("Use more action verbs (Developed, Implemented, Led) to describe your work.");
  if (wordCount < 150)               improvements.push("Resume seems too short — expand your experience and projects sections.");
  if (wordCount > 1000)              improvements.push("Resume may be too long — try to condense to 1-2 pages.");

  const summary =
    atsScore >= 80 ? "Your resume is performing well for ATS systems. Tailor keywords for each job description."
  : atsScore >= 60 ? "Your resume has a decent foundation. A few targeted improvements will boost your ATS score significantly."
  : "Your resume needs improvement for ATS systems. Follow the suggestions below to increase your chances.";

  return {
    atsScore,
    scores: { keywords, formatting, skills, experience, readability },
    strengths,
    improvements,
    missingKeywords: missingKeywords.slice(0, 8),
    keywordsFound:   foundKeywords.slice(0, 15),
    summary,
    targetRole: detectRole(text),
    fileName: fileName.replace(/\.(pdf|doc|docx)$/i, ""),
  };
}
