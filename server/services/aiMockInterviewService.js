import MockInterview from "../models/MockInterview.js";

const GEMINI_MODEL = "gemini-3.1-flash-lite-preview";

const sanitizeStringArray = (items = []) => {
  return Array.isArray(items)
    ? items.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
};

export const generateMockInterviewQuestions = async ({
  userId,
  targetRole,
  targetCompany,
  experienceType,
}) => {
  const previousInterviews = await MockInterview.find({
    user: userId,
    targetRole,
  }).select("questions.question");

  const previousQuestions = previousInterviews.flatMap((interview) =>
    interview.questions.map((question) => question.question),
  );

  const prompt = `
Generate a mock interview.

Role: ${targetRole}
Company: ${targetCompany}
Experience: ${experienceType}

Previously asked questions:
${previousQuestions.join("\n") || "None"}

IMPORTANT:
- Never repeat any previous question.
- Create fresh questions.
- Questions should become different every generation.
- Do not reuse wording.
- Company-specific style is allowed.
- Do not claim real interview questions.

Generate:

4 Technical Questions
2 Coding Questions
2 Project Questions
2 HR Questions

Return ONLY JSON:

{
  "questions": [
    {
      "question": "",
      "expectedAnswer": "",
      "category": "technical",
      "difficulty": "medium"
    }
  ]
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
          temperature: 0.9,
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

  return (parsed.questions || []).map((question) => ({
    question: String(question.question || "").trim(),
    expectedAnswer: String(question.expectedAnswer || "").trim(),
    category: question.category || "technical",
    difficulty: question.difficulty || "medium",
  }));
};

export const evaluateInterviewAnswer = async ({
  question,
  expectedAnswer,
  userAnswer,
}) => {
  const prompt = `
You are an expert technical interviewer.

Question:
${question}

Expected Answer:
${expectedAnswer}

Student Answer:
${userAnswer}

Evaluate the answer.

Return ONLY JSON:

{
  "score": 8,
  "feedback": "",
  "strengths": [],
  "improvements": []
}

Rules:
- Score from 0 to 10
- Be realistic
- Mention missing concepts
- Give constructive feedback
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
    score: Number(parsed.score || 0),
    feedback: String(parsed.feedback || ""),
    strengths: sanitizeStringArray(parsed.strengths),
    improvements: sanitizeStringArray(parsed.improvements),
  };
};
