const GEMINI_MODEL = "gemini-3.1-flash-lite-preview";

const sanitizeStringArray = (items = []) => {
  return Array.isArray(items)
    ? items.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
};

const sanitizePlanDay = (item) => ({
  day: Number(item.day) > 0 ? Number(item.day) : 1,
  title: String(item.title || "").trim(),
  tasks: sanitizeStringArray(item.tasks),
  topics: sanitizeStringArray(item.topics),
  estimatedHours:
    Number(item.estimatedHours) > 0 ? Number(item.estimatedHours) : 1,
  resources: sanitizeStringArray(item.resources),
});

export const generateStudyPlanWithAI = async ({
  goal,
  targetRole = "",
  durationDays,
  hoursPerDay,
  currentLevel = "beginner",
}) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const prompt = `
Generate a practical study plan for a technical learning platform student.

Goal: ${goal}
Target role: ${targetRole || "Not specified"}
Duration: ${durationDays} days
Daily study time: ${hoursPerDay} hours per day
Current level: ${currentLevel}

Rules:
- Create exactly ${durationDays} daily plan items.
- Keep the plan realistic for ${hoursPerDay} hours per day.
- Include tasks, topics, resources, and estimated hours for each day.
- Include milestones and revision strategy.
- Make it useful for technical career learning.
- Return only valid JSON.

JSON format:
{
  "plan": [
    {
      "day": 1,
      "title": "day title",
      "tasks": ["task 1", "task 2"],
      "topics": ["topic 1", "topic 2"],
      "estimatedHours": 2,
      "resources": ["resource 1", "resource 2"]
    }
  ],
  "milestones": ["milestone 1", "milestone 2"],
  "revisionStrategy": ["strategy 1", "strategy 2"],
  "finalOutcome": "what student will achieve"
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
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  const parsed = JSON.parse(text);

  return {
    plan: Array.isArray(parsed.plan)
      ? parsed.plan.map(sanitizePlanDay).filter((item) => item.title)
      : [],
    milestones: sanitizeStringArray(parsed.milestones),
    revisionStrategy: sanitizeStringArray(parsed.revisionStrategy),
    finalOutcome: String(parsed.finalOutcome || "").trim(),
  };
};
