const GEMINI_MODEL = "gemini-3.1-flash-lite-preview";

const sanitizeStringArray = (items = []) => {
  return Array.isArray(items)
    ? items.map((item) => String(item).trim()).filter(Boolean)
    : [];
};

const sanitizeRoadmapStep = (step) => ({
  phase: String(step.phase || "").trim(),
  title: String(step.title || "").trim(),
  description: String(step.description || "").trim(),
  skills: sanitizeStringArray(step.skills),
  recommendedProjects: sanitizeStringArray(step.recommendedProjects),
  estimatedWeeks:
    Number(step.estimatedWeeks) > 0 ? Number(step.estimatedWeeks) : 1,
});

export const generateCareerRoadmapWithAI = async ({
  careerGoal,
  currentLevel = "beginner",
  targetRole,
  knownSkills = "",
  timeCommitment = "",
}) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const prompt = `
Generate a practical career roadmap for a technical LMS student.

Career goal: ${careerGoal}
Target role: ${targetRole}
Current level: ${currentLevel}
Known skills: ${knownSkills}
Weekly time commitment: ${timeCommitment}

Rules:
- Make roadmap practical and project-focused.
- Include 6 to 10 roadmap phases.
- Each phase should include skills, projects, and estimated weeks.
- Focus on technical career growth.
- Return only valid JSON.

JSON format:
{
  "targetRole": "role name",
  "estimatedTimeline": "example: 4-6 months",
  "roadmap": [
    {
      "phase": "Phase 1",
      "title": "phase title",
      "description": "what to learn and why",
      "skills": ["skill 1", "skill 2"],
      "recommendedProjects": ["project 1", "project 2"],
      "estimatedWeeks": 2
    }
  ],
  "tools": ["tool 1", "tool 2"],
  "interviewTopics": ["topic 1", "topic 2"],
  "portfolioProjects": ["project 1", "project 2"]
}
`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.5,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const parsed = JSON.parse(text);

  const roadmap = Array.isArray(parsed.roadmap)
    ? parsed.roadmap.map(sanitizeRoadmapStep).filter(
        (step) => step.phase && step.title && step.description,
      )
    : [];

  return {
    targetRole: String(parsed.targetRole || targetRole || "").trim(),
    estimatedTimeline: String(parsed.estimatedTimeline || "").trim(),
    roadmap,
    tools: sanitizeStringArray(parsed.tools),
    interviewTopics: sanitizeStringArray(parsed.interviewTopics),
    portfolioProjects: sanitizeStringArray(parsed.portfolioProjects),
  };
};