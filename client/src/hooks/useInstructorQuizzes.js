import { useEffect, useState } from "react";

import { getInstructorCourses } from "../services/courseService";
import {
  createQuiz,
  deleteQuiz,
  generateAIQuiz,
  getInstructorQuizzes,
  getQuizAnalytics,
  updateQuiz,
} from "../services/quizService";

const emptyQuestion = {
  questionText: "",
  options: ["", "", "", ""],
  correctOptionIndex: 0,
  explanation: "",
  points: 1,
};

const initialQuizForm = {
  title: "",
  description: "",
  courseId: "",
  placementType: "course",
  sectionId: "",
  lessonId: "",
  passingPercentage: 60,
  timeLimitMinutes: 0,
  maxAttempts: 0,
  status: "draft",
  source: "manual",
  aiPrompt: "",
  questions: [{ ...emptyQuestion }],
};

function useInstructorQuizzes(initialCourseId = "") {
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  const [formData, setFormData] = useState({
    ...initialQuizForm,
    courseId: initialCourseId,
  });

  const [editingQuizId, setEditingQuizId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  const [aiForm, setAiForm] = useState({
    topic: "",
    difficulty: "intermediate",
    questionCount: 5,
  });

  const loadPageData = async () => {
    try {
      setError("");

      const [coursesData, quizzesData] = await Promise.all([
        getInstructorCourses(),
        getInstructorQuizzes(),
      ]);

      setCourses(coursesData.courses || []);
      setQuizzes(quizzesData.quizzes || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load quiz management data.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  const resetForm = () => {
    setEditingQuizId("");
    setFormData({
      ...initialQuizForm,
      courseId: initialCourseId,
      questions: [{ ...emptyQuestion }],
    });
  };

  const handleFormChange = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleCourseChange = (courseId) => {
    setFormData((current) => ({
      ...current,
      courseId,
      sectionId: "",
      lessonId: "",
      placementType: "course",
    }));
  };

  const handleSectionChange = (sectionId) => {
    setFormData((current) => ({
      ...current,
      sectionId,
      lessonId: "",
      placementType: sectionId ? "section" : "course",
    }));
  };

  const handleLessonChange = (lessonId) => {
    setFormData((current) => ({
      ...current,
      lessonId,
      placementType: lessonId
        ? "lesson"
        : current.sectionId
          ? "section"
          : "course",
    }));
  };

  const handleQuestionChange = (questionIndex, field, value) => {
    setFormData((current) => ({
      ...current,
      questions: current.questions.map((question, index) =>
        index === questionIndex ? { ...question, [field]: value } : question,
      ),
    }));
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setFormData((current) => ({
      ...current,
      questions: current.questions.map((question, index) => {
        if (index !== questionIndex) return question;

        const nextOptions = [...question.options];
        nextOptions[optionIndex] = value;

        return { ...question, options: nextOptions };
      }),
    }));
  };

  const addQuestion = () => {
    setFormData((current) => ({
      ...current,
      questions: [
        ...current.questions,
        { ...emptyQuestion, options: ["", "", "", ""] },
      ],
    }));
  };

  const removeQuestion = (questionIndex) => {
    setFormData((current) => ({
      ...current,
      questions:
        current.questions.length === 1
          ? current.questions
          : current.questions.filter((_, index) => index !== questionIndex),
    }));
  };

  const cleanPayload = () => {
    const sectionId =
      formData.placementType === "section" ||
      formData.placementType === "lesson"
        ? formData.sectionId
        : "";

    const lessonId =
      formData.placementType === "lesson" ? formData.lessonId : "";

    return {
      title: formData.title.trim(),
      description: formData.description.trim(),
      courseId: formData.courseId,
      sectionId,
      lessonId,
      passingPercentage: Number(formData.passingPercentage) || 60,
      timeLimitMinutes: Number(formData.timeLimitMinutes) || 0,
      maxAttempts: Number(formData.maxAttempts) || 0,
      status: formData.status,
      source: formData.source || "manual",
      aiPrompt: formData.aiPrompt || "",
      questions: formData.questions.map((question) => ({
        questionText: question.questionText.trim(),
        options: question.options.map((option) => option.trim()),
        correctOptionIndex: Number(question.correctOptionIndex),
        explanation: question.explanation?.trim() || "",
        points: Number(question.points) || 1,
      })),
    };
  };

  const validateQuiz = () => {
    if (!formData.title.trim()) return "Quiz title is required.";
    if (!formData.courseId) return "Please select a course.";

    if (formData.placementType === "section" && !formData.sectionId) {
      return "Please select a section.";
    }

    if (formData.placementType === "lesson" && !formData.lessonId) {
      return "Please select a lesson.";
    }

    for (const question of formData.questions) {
      if (!question.questionText.trim()) {
        return "Every question needs question text.";
      }

      const validOptions = question.options.filter((option) => option.trim());

      if (validOptions.length < 2) {
        return "Every question needs at least two options.";
      }

      if (!question.options[question.correctOptionIndex]?.trim()) {
        return "Correct option cannot be empty.";
      }
    }

    return "";
  };

  const handleGenerateAIQuiz = async () => {
    if (!formData.courseId) {
      setError("Please select a course before generating AI questions.");
      return;
    }

    if (!aiForm.topic.trim()) {
      setError("Please enter a topic for AI quiz generation.");
      return;
    }

    try {
      setError("");
      setSuccess("");
      setIsGeneratingAI(true);

      const data = await generateAIQuiz({
        courseId: formData.courseId,
        topic: aiForm.topic.trim(),
        difficulty: aiForm.difficulty,
        questionCount: Number(aiForm.questionCount) || 5,
      });

      if (!data.questions?.length) {
        setError("AI did not generate any valid questions. Try another topic.");
        return;
      }

      setFormData((current) => ({
        ...current,
        title: current.title || `${aiForm.topic.trim()} Quiz`,
        description:
          current.description ||
          `AI-generated ${aiForm.difficulty} level quiz on ${aiForm.topic.trim()}.`,
        source: "ai",
        aiPrompt: aiForm.topic.trim(),
        questions: data.questions,
      }));

      setSuccess(
        "AI questions generated successfully. Review them before saving.",
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to generate AI quiz questions.",
      );
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateQuiz();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setError("");
      setSuccess("");
      setIsSaving(true);

      const payload = cleanPayload();

      if (editingQuizId) {
        await updateQuiz(editingQuizId, payload);
        setSuccess("Quiz updated successfully.");
      } else {
        await createQuiz(payload);
        setSuccess("Quiz created successfully.");
      }

      resetForm();
      await loadPageData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save quiz.");
    } finally {
      setIsSaving(false);
    }
  };

  const getPlacementType = (quiz) => {
    if (quiz.lessonId) return "lesson";
    if (quiz.sectionId) return "section";
    return "course";
  };

  const handleEditQuiz = (quiz) => {
    setEditingQuizId(quiz._id);

    setFormData({
      title: quiz.title || "",
      description: quiz.description || "",
      courseId: quiz.course?._id || quiz.course || "",
      placementType: getPlacementType(quiz),
      sectionId: quiz.sectionId || "",
      lessonId: quiz.lessonId || "",
      passingPercentage: quiz.passingPercentage || 60,
      timeLimitMinutes: quiz.timeLimitMinutes || 0,
      maxAttempts: quiz.maxAttempts || 0,
      status: quiz.status || "draft",
      source: quiz.source || "manual",
      aiPrompt: quiz.aiPrompt || "",
      questions:
        quiz.questions?.length > 0
          ? quiz.questions.map((question) => ({
              questionText: question.questionText || "",
              options:
                question.options?.length > 0
                  ? question.options
                  : ["", "", "", ""],
              correctOptionIndex: question.correctOptionIndex || 0,
              explanation: question.explanation || "",
              points: question.points || 1,
            }))
          : [{ ...emptyQuestion }],
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm("Delete this quiz and all attempts?")) return;

    try {
      setError("");
      setSuccess("");

      await deleteQuiz(quizId);

      setSuccess("Quiz deleted successfully.");
      await loadPageData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete quiz.");
    }
  };

  const handleViewAnalytics = async (quizId) => {
    try {
      setError("");
      setSuccess("");
      setIsLoadingAnalytics(true);

      const data = await getQuizAnalytics(quizId);

      setAnalytics(data.analytics);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load quiz analytics.");
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  return {
    courses,
    quizzes,
    formData,
    editingQuizId,
    error,
    success,
    isLoading,
    isSaving,
    isGeneratingAI,
    analytics,
    isLoadingAnalytics,
    aiForm,
    setAiForm,
    setAnalytics,
    resetForm,
    handleFormChange,
    handleCourseChange,
    handleSectionChange,
    handleLessonChange,
    handleQuestionChange,
    handleOptionChange,
    addQuestion,
    removeQuestion,
    handleGenerateAIQuiz,
    handleSubmit,
    handleEditQuiz,
    handleDeleteQuiz,
    handleViewAnalytics,
  };
}

export default useInstructorQuizzes;
