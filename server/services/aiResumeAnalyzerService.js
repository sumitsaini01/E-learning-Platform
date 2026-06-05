const GEMINI_MODEL = "gemini-3.1-flash-lite-preview";

const sanitizeStringArray = (items = []) => {
  return Array.isArray(items)
    ? items.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
};

export const analyzeResumeWithAI = async ({ resumeText, targetRole }) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  if (!resumeText?.trim()) {
    throw new Error("Resume text is empty");
  }

  const prompt = `
Analyze this resume for the target role.

Target Role: ${targetRole}

Resume Text:
${resumeText}

Rules:
- Give realistic ATS-style score out of 100.
- Focus on technical skills, projects, experience, keywords, formatting, and role fit.
- Do not be overly positive.
- Give actionable suggestions.
- Return only valid JSON.

JSON format:
{
  "atsScore": 75,
  "summary": "short summary",
  "strengths": ["strength 1"],
  "weaknesses": ["weakness 1"],
  "missingKeywords": ["keyword 1"],
  "projectSuggestions": ["suggestion 1"],
  "improvementTips": ["tip 1"]
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
          temperature: 0.4,
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
    atsScore: Math.max(0, Math.min(100, Number(parsed.atsScore) || 0)),
    summary: String(parsed.summary || "").trim(),
    strengths: sanitizeStringArray(parsed.strengths),
    weaknesses: sanitizeStringArray(parsed.weaknesses),
    missingKeywords: sanitizeStringArray(parsed.missingKeywords),
    projectSuggestions: sanitizeStringArray(parsed.projectSuggestions),
    improvementTips: sanitizeStringArray(parsed.improvementTips),
  };
};
