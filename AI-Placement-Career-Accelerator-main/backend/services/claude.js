import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env

const MODEL = process.env.CLAUDE_MODEL || "claude-opus-4-8";

/**
 * Ask Claude and get validated JSON back using structured outputs
 * (output_config.format with a json_schema).
 */
async function askClaudeJSON({ system, user, schema, maxTokens = 16000, pdfBase64 }) {
  const content = [];
  if (pdfBase64) {
    content.push({
      type: "document",
      source: { type: "base64", media_type: "application/pdf", data: pdfBase64 },
    });
  }
  content.push({ type: "text", text: user });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    thinking: { type: "adaptive" },
    system,
    output_config: { format: { type: "json_schema", schema } },
    messages: [{ role: "user", content }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return JSON.parse(textBlock.text);
}

/** Plain text/chat completion (used by conversational interview turns). */
export async function askClaudeText({ system, messages, maxTokens = 4096 }) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    thinking: { type: "adaptive" },
    system,
    messages,
  });
  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock ? textBlock.text : "";
}

// ── Resume ATS analysis ──────────────────────────────────────────────────────

const RESUME_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "atsScore",
    "scores",
    "strengths",
    "improvements",
    "missingKeywords",
    "summary",
  ],
  properties: {
    atsScore: { type: "integer", description: "Overall ATS score 0-100" },
    scores: {
      type: "object",
      additionalProperties: false,
      required: ["keywords", "formatting", "experience", "skills", "readability"],
      properties: {
        keywords: { type: "integer", description: "0-20" },
        formatting: { type: "integer", description: "0-20" },
        experience: { type: "integer", description: "0-20" },
        skills: { type: "integer", description: "0-20" },
        readability: { type: "integer", description: "0-20" },
      },
    },
    strengths: { type: "array", items: { type: "string" } },
    improvements: { type: "array", items: { type: "string" } },
    missingKeywords: { type: "array", items: { type: "string" } },
    summary: { type: "string" },
  },
};

export function analyzeResume({ pdfBase64, resumeText, targetRole }) {
  const roleLine = targetRole
    ? `The candidate is targeting the role: ${targetRole}.`
    : "Infer the most likely target role from the resume.";
  return askClaudeJSON({
    system:
      "You are an expert ATS (Applicant Tracking System) resume reviewer for campus placements in India. Score strictly but fairly. Section scores are each out of 20 and must sum to roughly the overall score.",
    user: `${roleLine}\n\nAnalyze the resume${
      resumeText ? `:\n\n${resumeText}` : " in the attached PDF."
    }\n\nReturn the ATS analysis.`,
    schema: RESUME_SCHEMA,
    pdfBase64,
  });
}

// ── Mock interview ───────────────────────────────────────────────────────────

const QUESTIONS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["questions"],
  properties: {
    questions: {
      type: "array",
      items: { type: "string" },
      description: "Interview questions",
    },
  },
};

export function generateQuestions({ role, difficulty, count = 5 }) {
  return askClaudeJSON({
    system:
      "You are a senior technical interviewer preparing questions for a mock interview.",
    user: `Generate exactly ${count} ${difficulty} interview questions for the role of ${role}. Questions should be answerable verbally (no coding editors). Mix conceptual and practical questions.`,
    schema: QUESTIONS_SCHEMA,
  });
}

const GRADE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["score", "feedback"],
  properties: {
    score: { type: "integer", description: "0-10" },
    feedback: { type: "string", description: "2-3 sentence constructive feedback" },
  },
};

export function gradeAnswer({ role, question, answer }) {
  return askClaudeJSON({
    system: `You are a strict but encouraging technical interviewer for the role of ${role}. Grade the candidate's spoken answer.`,
    user: `Question: ${question}\n\nCandidate's answer: ${answer || "(no answer given)"}\n\nGrade it 0-10 and give short constructive feedback.`,
    schema: GRADE_SCHEMA,
    maxTokens: 2048,
  });
}

const OVERALL_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["overallScore", "overallFeedback"],
  properties: {
    overallScore: { type: "integer", description: "0-100" },
    overallFeedback: { type: "string" },
  },
};

export function gradeInterview({ role, difficulty, answers }) {
  const transcript = answers
    .map(
      (a, i) =>
        `Q${i + 1}: ${a.question}\nAnswer: ${a.answer || "(skipped)"}\nPer-question score: ${a.score}/10`
    )
    .join("\n\n");
  return askClaudeJSON({
    system: `You are a technical interviewer summarizing a ${difficulty} mock interview for a ${role} candidate.`,
    user: `Here is the interview transcript with per-question scores:\n\n${transcript}\n\nGive an overall score (0-100) and 3-5 sentences of overall feedback with concrete next steps.`,
    schema: OVERALL_SCHEMA,
  });
}

// ── Roadmap generation ───────────────────────────────────────────────────────

const ROADMAP_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["phases"],
  properties: {
    phases: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "duration", "topics"],
        properties: {
          title: { type: "string" },
          duration: { type: "string", description: 'e.g. "2 weeks"' },
          topics: { type: "array", items: { type: "string" } },
        },
      },
    },
  },
};

export function generateRoadmap({ goal, currentSkills = [] }) {
  return askClaudeJSON({
    system:
      "You are a career mentor creating practical learning roadmaps for students preparing for placements.",
    user: `Create a phased learning roadmap for becoming a ${goal}.${
      currentSkills.length
        ? ` The student already knows: ${currentSkills.join(", ")}.`
        : ""
    } 4-6 phases, each with a title, duration, and 4-8 concrete topics.`,
    schema: ROADMAP_SCHEMA,
  });
}
