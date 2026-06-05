const GEMINI_MODEL = "gemini-3.1-flash-lite-preview";

const sanitizeStringArray = (items = []) => {
  return Array.isArray(items)
    ? items.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
};

const sanitizeQuestion = (question) => {
  const type = ["technical", "mcq", "coding", "hr"].includes(question.type)
    ? question.type
    : "technical";

  const difficulty = ["easy", "medium", "hard"].includes(question.difficulty)
    ? question.difficulty
    : "medium";

  return {
    type,
    question: String(question.question || "").trim(),
    options: sanitizeStringArray(question.options),
    correctAnswer: String(question.correctAnswer || "").trim(),
    explanation: String(question.explanation || "").trim(),
    difficulty,
  };
};

export const generateInterviewPrepWithAI = async ({
  targetRole,
  targetCompany,
  experienceType,
}) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const prompt = `
Generate an interview preparation set for a student.

Target job role: ${targetRole}
Target company: ${targetCompany}
Candidate experience type: ${experienceType}

Rules:
- Make questions specific to the target role.
- If company is known, include company-style preparation focus, but do not claim exact real interview questions.
- For fresher/entry-level, focus on fundamentals, projects, problem solving, and basic system/design thinking.
- For experienced, include deeper architecture, debugging, scalability, project ownership, and scenario-based questions.
- Generate:
  - 8 technical questions
  - 5 MCQs
  - 3 coding/problem-solving questions
  - 5 HR/behavioral questions
  - 8 important topics
  - 6 preparation tips
- MCQs must have exactly 4 options and a correctAnswer.
- Return only valid JSON.

JSON format:
{
  "questions": [
    {
      "type": "technical",
      "question": "question text",
      "options": [],
      "correctAnswer": "short answer",
      "explanation": "brief explanation",
      "difficulty": "easy"
    }
  ],
  "importantTopics": ["topic 1", "topic 2"],
  "preparationTips": ["tip 1", "tip 2"]
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

  const questions = Array.isArray(parsed.questions)
    ? parsed.questions.map(sanitizeQuestion).filter((item) => item.question)
    : [];

  return {
    questions,
    importantTopics: sanitizeStringArray(parsed.importantTopics),
    preparationTips: sanitizeStringArray(parsed.preparationTips),
  };
};
