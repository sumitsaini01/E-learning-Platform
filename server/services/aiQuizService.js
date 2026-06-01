const GEMINI_MODEL = "gemini-3.1-flash-lite-preview";

const sanitizeQuestion = (question) => {
  const options = Array.isArray(question.options)
    ? question.options.map((option) => String(option).trim()).filter(Boolean)
    : [];

  const correctOptionIndex = Number(question.correctOptionIndex);

  return {
    questionText: String(question.questionText || "").trim(),
    options,
    correctOptionIndex:
      Number.isInteger(correctOptionIndex) &&
      correctOptionIndex >= 0 &&
      correctOptionIndex < options.length
        ? correctOptionIndex
        : 0,
    explanation: String(question.explanation || "").trim(),
    points: Number(question.points) > 0 ? Number(question.points) : 1,
  };
};

export const generateQuizQuestionsWithAI = async ({
  topic,
  difficulty = "intermediate",
  questionCount = 5,
  courseTitle = "",
  courseDescription = "",
}) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const safeQuestionCount = Math.min(
    Math.max(Number(questionCount) || 5, 1),
    20,
  );

  const prompt = `
Generate ${safeQuestionCount} multiple-choice quiz questions.

Course title: ${courseTitle}
Course description: ${courseDescription}
Topic: ${topic}
Difficulty: ${difficulty}

Rules:
- Each question must have exactly 4 options.
- correctOptionIndex must be 0, 1, 2, or 3.
- Questions must be clear and useful for LMS assessment.
- Avoid duplicate questions.
- Explanation should briefly explain the correct answer.
- Return only valid JSON.
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
          responseSchema: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    questionText: { type: "string" },
                    options: {
                      type: "array",
                      items: { type: "string" },
                    },
                    correctOptionIndex: { type: "integer" },
                    explanation: { type: "string" },
                    points: { type: "integer" },
                  },
                  required: [
                    "questionText",
                    "options",
                    "correctOptionIndex",
                    "explanation",
                    "points",
                  ],
                },
              },
            },
            required: ["questions"],
          },
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
    ? parsed.questions.map(sanitizeQuestion)
    : [];

  return questions.filter(
    (question) =>
      question.questionText &&
      question.options.length === 4 &&
      question.correctOptionIndex >= 0 &&
      question.correctOptionIndex < 4,
  );
};

export const generateCourseDescriptionWithAI = async ({
  title,
  category = "",
  level = "beginner",
  targetAudience = "",
}) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  if (!title?.trim()) {
    throw new Error("Course title is required");
  }

  const prompt = `
Generate a professional LMS course description.

Course title: ${title}
Category: ${category}
Level: ${level}
Target audience: ${targetAudience}

Return only valid JSON with:
{
  "description": "A detailed course description between 120 and 180 words.",
  "learningOutcomes": ["outcome 1", "outcome 2", "outcome 3", "outcome 4"],
  "skills": ["skill 1", "skill 2", "skill 3", "skill 4"]
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

  return {
    description: String(parsed.description || "").trim(),
    learningOutcomes: Array.isArray(parsed.learningOutcomes)
      ? parsed.learningOutcomes
          .map((item) => String(item).trim())
          .filter(Boolean)
      : [],
    skills: Array.isArray(parsed.skills)
      ? parsed.skills.map((item) => String(item).trim()).filter(Boolean)
      : [],
  };
};
