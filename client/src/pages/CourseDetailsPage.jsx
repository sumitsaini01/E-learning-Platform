import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getCourseQuizzes } from "../services/quizService";
import {
  createCourseReview,
  deleteCourseReview,
  enrollInCourse,
  getCourseById,
  generateStudyNotes,
  generateFlashcards,
  getAiStudyResources,
  getSavedCourses,
  removeSavedCourse,
  saveCourse,
  updateCourseReview,
} from "../services/courseService";

import { createPaymentOrder, verifyPayment } from "../services/paymentService";
import {
  getCourseProgress,
  markLessonComplete,
  updateLessonWatchProgress,
} from "../services/progressService";

import {
  createDiscussion,
  getCourseDiscussions,
  replyToDiscussion,
  toggleDiscussionResolved,
} from "../services/discussionService";

import {
  deleteLessonNote,
  getLessonNote,
  saveLessonNote,
} from "../services/noteService";

import CourseHero from "../components/courseDetails/CourseHero";
import CoursePurchaseCard from "../components/courseDetails/CoursePurchaseCard";
import ActiveLessonPlayer from "../components/courseDetails/ActiveLessonPlayer";
import LessonNotes from "../components/courseDetails/LessonNotes";
import CourseCurriculum from "../components/courseDetails/CourseCurriculum";
import CourseQuizzes from "../components/courseDetails/CourseQuizzes";
import AiStudyNotes from "../components/courseDetails/AiStudyNotes";
import AiFlashcards from "../components/courseDetails/AiFlashcards";
import CourseCommunity from "../components/courseDetails/CourseCommunity";
import CourseReviews from "../components/courseDetails/CourseReviews";
import StarRatingInput from "../components/courseDetails/StarRatingInput";

const formatPrice = (price) =>
  Number(price) === 0
    ? "Free"
    : new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(Number(price || 0));

const getYouTubeEmbedUrl = (url) => {
  if (!url) return "";

  const youtubeRegex =
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/;

  const match = url.match(youtubeRegex);
  if (!match?.[1]) return "";

  return `https://www.youtube.com/embed/${match[1]}`;
};

const getUserId = (value) => {
  if (!value) return "";
  return typeof value === "string" ? value : value._id || value.id || "";
};

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function CourseDetailsPage() {
  const { id } = useParams();
  const location = useLocation();
  const { isAuthenticated, user, updateUser } = useAuth();

  const videoRef = useRef(null);
  const watchSaveTimerRef = useRef(null);

  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [progress, setProgress] = useState(null);
  const [nextLesson, setNextLesson] = useState(null);
  const [continueLesson, setContinueLesson] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [discussions, setDiscussions] = useState([]);

  const [error, setError] = useState("");
  const [enrollError, setEnrollError] = useState("");
  const [enrollMessage, setEnrollMessage] = useState("");
  const [progressMessage, setProgressMessage] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [discussionError, setDiscussionError] = useState("");
  const [discussionMessage, setDiscussionMessage] = useState("");
  const [studyNotes, setStudyNotes] = useState(null);
  const [studyNotesError, setStudyNotesError] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [flashcardsError, setFlashcardsError] = useState("");
  const [flippedCards, setFlippedCards] = useState({});
  const [activeFlashcard, setActiveFlashcard] = useState(0);
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false);
  const [lessonNote, setLessonNote] = useState(null);
  const [noteMessage, setNoteMessage] = useState("");
  const [noteError, setNoteError] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSavingCourse, setIsSavingCourse] = useState(false);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState("");

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });

  const [noteForm, setNoteForm] = useState({
    title: "",
    content: "",
  });

  const [discussionForm, setDiscussionForm] = useState({
    title: "",
    message: "",
  });

  const [replyForms, setReplyForms] = useState({});

  const [discussionFilter, setDiscussionFilter] = useState("all");

  const [editReviewForm, setEditReviewForm] = useState({
    rating: 5,
    comment: "",
  });

  const studentId = user?._id || user?.id;

  const isEnrolled = useMemo(() => {
    if (!course?.students || !studentId) return false;
    return course.students.some((student) => getUserId(student) === studentId);
  }, [course?.students, studentId]);

  const userReview = useMemo(() => {
    if (!course?.reviews || !studentId) return null;
    return course.reviews.find(
      (review) => getUserId(review.user) === studentId,
    );
  }, [course?.reviews, studentId]);

  const hasReviewed = Boolean(userReview);
  const isFreeCourse = Number(course?.price || 0) === 0;

  const canViewAllLessons =
    isAuthenticated &&
    (user?.role === "admin" || user?.role === "instructor" || isEnrolled);

  const canTrackProgress =
    isAuthenticated && user?.role === "student" && isEnrolled;

  const canReview =
    isAuthenticated && user?.role === "student" && isEnrolled && !hasReviewed;

  const canUseDiscussions =
    isAuthenticated &&
    (user?.role === "admin" || user?.role === "instructor" || isEnrolled);

  const completedLessons = progress?.progress?.completedLessons || [];
  const lessonProgressList = progress?.progress?.lessonProgress || [];
  const completed = progress?.completed || completedLessons.length || 0;
  const totalLessons = progress?.totalLessons || 0;
  const percentage = progress?.percentage || 0;

  const getLessonById = (lessonId) => {
    if (!course || !lessonId) return null;

    for (const section of course.sections || []) {
      const lesson = section.lessons?.find((item) => item._id === lessonId);

      if (lesson) {
        return {
          lesson,
          section,
        };
      }
    }

    return null;
  };

  const getNextLessonLocal = (lessonId) => {
    const flatLessons = [];

    (course?.sections || []).forEach((section) => {
      section.lessons?.forEach((lesson) => {
        flatLessons.push({
          lesson,
          section,
        });
      });
    });

    const currentIndex = flatLessons.findIndex(
      (item) => item.lesson._id === lessonId,
    );

    if (currentIndex === -1 || currentIndex === flatLessons.length - 1) {
      return null;
    }

    return flatLessons[currentIndex + 1];
  };

  const openLessonById = (lessonId) => {
    const found = getLessonById(lessonId);

    if (found) {
      handleOpenLesson(found.lesson, found.section);
    }
  };

  const loadProgress = async () => {
    if (!canTrackProgress) return;

    try {
      const data = await getCourseProgress(id);
      setProgress(data);
      setContinueLesson(data.continueLesson || null);
    } catch {
      setProgress(null);
    }
  };

  const loadQuizzes = async () => {
    if (!canViewAllLessons) return;

    try {
      const data = await getCourseQuizzes(id);
      setQuizzes(data.quizzes || []);
    } catch {
      setQuizzes([]);
    }
  };

  const loadDiscussions = async () => {
    if (!canUseDiscussions) return;

    try {
      const data = await getCourseDiscussions(id);
      setDiscussions(data.discussions || []);
    } catch {
      setDiscussions([]);
    }
  };

  const loadAiStudyResources = async () => {
    if (!canViewAllLessons) return;

    try {
      const data = await getAiStudyResources(id);

      setStudyNotes(data.notes || null);
      setFlashcards(data.flashcards || []);
      setFlippedCards({});
    } catch {
      setStudyNotes(null);
      setFlashcards([]);
    }
  };
  const loadCourse = async () => {
    try {
      setIsLoading(true);
      setError("");
      setEnrollError("");
      setEnrollMessage("");

      const data = await getCourseById(id);
      setCourse(data.course);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load course details.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSavedStatus = async () => {
    if (!isAuthenticated || user?.role !== "student") return;

    try {
      const data = await getSavedCourses();

      const saved = (data.courses || []).some(
        (savedCourse) => getUserId(savedCourse) === id,
      );

      setIsSaved(saved);
    } catch {
      setIsSaved(false);
    }
  };

  useEffect(() => {
    loadCourse();
  }, [id]);

  useEffect(() => {
    loadSavedStatus();
  }, [id, isAuthenticated, user?.role]);

  useEffect(() => {
    loadProgress();
  }, [id, canTrackProgress]);

  useEffect(() => {
    loadQuizzes();
  }, [id, canViewAllLessons]);

  useEffect(() => {
    loadDiscussions();
  }, [id, canUseDiscussions]);

  useEffect(() => {
    loadAiStudyResources();
  }, [id, canViewAllLessons]);

  useEffect(() => {
    if (!course || !continueLesson?.lessonId || activeLesson) return;

    const found = getLessonById(continueLesson.lessonId);

    if (found && canViewAllLessons) {
      setActiveLesson({
        ...found.lesson,
        sectionTitle: found.section.title,
      });

      setNextLesson(getNextLessonLocal(found.lesson._id));

      if (canTrackProgress) {
        loadLessonNote(found.lesson._id);
      }
    }
  }, [
    course,
    continueLesson,
    canViewAllLessons,
    activeLesson,
    canTrackProgress,
  ]);

  const loadLessonNote = async (lessonId) => {
    if (!canTrackProgress || !lessonId) return;

    try {
      setNoteError("");
      setNoteMessage("");

      const data = await getLessonNote(id, lessonId);

      setLessonNote(data.note || null);
      setNoteForm({
        title: data.note?.title || "",
        content: data.note?.content || "",
      });
    } catch {
      setLessonNote(null);
      setNoteForm({
        title: "",
        content: "",
      });
    }
  };

  const handleFreeEnroll = async () => {
    try {
      setEnrollError("");
      setEnrollMessage("");
      setIsEnrolling(true);

      const data = await enrollInCourse(id);

      if (data.course) setCourse(data.course);

      setEnrollMessage(data.message || "Successfully enrolled in this course.");
    } catch (err) {
      setEnrollError(
        err.response?.data?.message || "Unable to enroll in this course.",
      );
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleToggleSaveCourse = async () => {
    if (!isAuthenticated || user?.role !== "student") {
      setEnrollError("Please login as a student to save this course.");
      return;
    }

    try {
      setIsSavingCourse(true);
      setEnrollError("");
      setEnrollMessage("");

      if (isSaved) {
        await removeSavedCourse(id);
        setIsSaved(false);
        setEnrollMessage("Course removed from saved list.");
      } else {
        await saveCourse(id);
        setIsSaved(true);
        setEnrollMessage("Course saved successfully.");
      }
    } catch (err) {
      setEnrollError(
        err.response?.data?.message || "Unable to update saved course.",
      );
    } finally {
      setIsSavingCourse(false);
    }
  };

  const handleBuyCourse = async () => {
    try {
      setEnrollError("");
      setEnrollMessage("");
      setIsEnrolling(true);

      if (isFreeCourse) {
        await handleFreeEnroll();
        setIsEnrolling(false);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        setEnrollError("Unable to load Razorpay. Please check your internet.");
        setIsEnrolling(false);
        return;
      }

      const orderData = await createPaymentOrder(id);

      if (orderData.free) {
        if (orderData.course) setCourse(orderData.course);
        setEnrollMessage(orderData.message || "Successfully enrolled.");
        setIsEnrolling(false);
        return;
      }

      const options = {
        key: orderData.key,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "SkillSphere",
        description: orderData.order.courseTitle,
        order_id: orderData.order.razorpayOrderId,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        notes: {
          courseId: id,
        },
        theme: {
          color: "#047857",
        },
        handler: async (response) => {
          try {
            const verifiedData = await verifyPayment({
              courseId: id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifiedData.course) {
              setCourse(verifiedData.course);
            } else {
              await loadCourse();
            }

            setEnrollMessage(
              verifiedData.message ||
                "Payment successful. You are enrolled in this course.",
            );

            setIsEnrolling(false);
          } catch (err) {
            setEnrollError(
              err.response?.data?.message ||
                "Payment completed but verification failed.",
            );
            setIsEnrolling(false);
          }
        },
        modal: {
          ondismiss: () => {
            setEnrollError("Payment cancelled.");
            setIsEnrolling(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setEnrollError(err.response?.data?.message || "Unable to start payment.");
      setIsEnrolling(false);
    }
  };

  const handleOpenLesson = async (lesson, section) => {
    const canOpenLesson = canViewAllLessons || lesson.isPreviewFree;

    if (!canOpenLesson) {
      setEnrollError("Please enroll in this course to access this lesson.");
      return;
    }

    setEnrollError("");
    setProgressMessage("");

    setActiveLesson({
      ...lesson,
      sectionTitle: section.title,
    });

    setNextLesson(getNextLessonLocal(lesson._id));

    if (canTrackProgress) {
      await loadLessonNote(lesson._id);
    }

    if (canTrackProgress) {
      try {
        const data = await updateLessonWatchProgress(id, {
          lessonId: lesson._id,
          watchedSeconds: 0,
          durationSeconds: Number(lesson.duration || 0) * 60,
        });

        setProgress(data);
        setContinueLesson(data.continueLesson || null);
      } catch {
        // lesson should still open
      }
    }
  };

  const saveWatchProgress = async (videoElement) => {
    if (!canTrackProgress || !activeLesson?._id || !videoElement) return;

    try {
      const data = await updateLessonWatchProgress(id, {
        lessonId: activeLesson._id,
        watchedSeconds: Math.floor(videoElement.currentTime || 0),
        durationSeconds: Math.floor(videoElement.duration || 0),
      });

      setProgress(data);
      setContinueLesson(data.continueLesson || null);
      setNextLesson(getNextLessonLocal(activeLesson._id));

      if (data.learningStreak) {
        updateUser({
          learningStreak: data.learningStreak,
        });
      }

      if (data.message === "Lesson auto-marked as complete") {
        setProgressMessage("Lesson auto-marked as complete.");
      }
    } catch {
      // avoid noisy UI while video is playing
    }
  };

  const handleVideoTimeUpdate = (event) => {
    if (watchSaveTimerRef.current) return;

    watchSaveTimerRef.current = setTimeout(() => {
      saveWatchProgress(event.target);
      watchSaveTimerRef.current = null;
    }, 5000);
  };

  const handleVideoPauseOrEnded = (event) => {
    saveWatchProgress(event.target);
  };

  const handleMarkComplete = async () => {
    if (!activeLesson?._id) return;

    try {
      setIsCompleting(true);
      setProgressMessage("");

      const data = await markLessonComplete(id, activeLesson._id);

      setProgress(data);
      setNextLesson(getNextLessonLocal(activeLesson._id));
      setContinueLesson(data.continueLesson || null);

      if (data.learningStreak) {
        updateUser({
          learningStreak: data.learningStreak,
        });
      }

      setProgressMessage("Lesson marked as complete.");
    } catch (err) {
      setProgressMessage(
        err.response?.data?.message || "Unable to mark lesson complete.",
      );
    } finally {
      setIsCompleting(false);
    }
  };

  const handleOpenNextLesson = () => {
    if (!nextLesson) return;
    handleOpenLesson(nextLesson.lesson, nextLesson.section);
  };

  const handleSaveLessonNote = async (event) => {
    event.preventDefault();

    if (!activeLesson?._id) return;

    if (!noteForm.content.trim()) {
      setNoteError("Note content is required.");
      return;
    }

    try {
      setIsSavingNote(true);
      setNoteError("");
      setNoteMessage("");

      const data = await saveLessonNote(id, activeLesson._id, {
        title: noteForm.title,
        content: noteForm.content,
      });

      setLessonNote(data.note);
      setNoteMessage(data.message || "Note saved successfully.");
    } catch (err) {
      setNoteError(err.response?.data?.message || "Unable to save note.");
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleDeleteLessonNote = async () => {
    if (!activeLesson?._id) return;

    const confirmed = window.confirm("Delete this note?");

    if (!confirmed) return;

    try {
      setIsSavingNote(true);
      setNoteError("");
      setNoteMessage("");

      await deleteLessonNote(id, activeLesson._id);

      setLessonNote(null);
      setNoteForm({
        title: "",
        content: "",
      });

      setNoteMessage("Note deleted successfully.");
    } catch (err) {
      setNoteError(err.response?.data?.message || "Unable to delete note.");
    } finally {
      setIsSavingNote(false);
    }
  };
  const handleGenerateStudyNotes = async () => {
    try {
      setStudyNotesError("");
      setIsGeneratingNotes(true);

      const data = await generateStudyNotes(id);

      setStudyNotes(data.notes);
    } catch (err) {
      setStudyNotesError(
        err.response?.data?.message || "Unable to generate study notes.",
      );
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    try {
      setFlashcardsError("");
      setIsGeneratingFlashcards(true);

      const data = await generateFlashcards(id);

      setFlashcards(data.flashcards || []);
      setFlippedCards({});
      setActiveFlashcard(0);
      setShowFlashcardAnswer(false);
    } catch (err) {
      setFlashcardsError(
        err.response?.data?.message || "Unable to generate flashcards.",
      );
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  const handleToggleFlashcard = (index) => {
    setFlippedCards((current) => ({
      ...current,
      [index]: !current[index],
    }));
  };

  const handleSubmitDiscussion = async (event) => {
    event.preventDefault();

    if (!discussionForm.title.trim() || !discussionForm.message.trim()) {
      setDiscussionError("Discussion title and message are required.");
      return;
    }

    try {
      setDiscussionError("");
      setDiscussionMessage("");

      await createDiscussion(id, {
        title: discussionForm.title.trim(),
        message: discussionForm.message.trim(),
      });

      setDiscussionForm({
        title: "",
        message: "",
      });

      setDiscussionMessage("Discussion posted successfully.");
      await loadDiscussions();
    } catch (err) {
      setDiscussionError(
        err.response?.data?.message || "Unable to post discussion.",
      );
    }
  };

  const handleSubmitReply = async (event, discussionId) => {
    event.preventDefault();

    const message = replyForms[discussionId] || "";

    if (!message.trim()) {
      setDiscussionError("Reply message is required.");
      return;
    }

    try {
      setDiscussionError("");
      setDiscussionMessage("");

      await replyToDiscussion(discussionId, {
        message: message.trim(),
      });

      setReplyForms((current) => ({
        ...current,
        [discussionId]: "",
      }));

      setDiscussionMessage("Reply posted successfully.");
      await loadDiscussions();
    } catch (err) {
      setDiscussionError(
        err.response?.data?.message || "Unable to post reply.",
      );
    }
  };

  const handleToggleResolved = async (discussionId) => {
    try {
      setDiscussionError("");
      setDiscussionMessage("");

      const data = await toggleDiscussionResolved(discussionId);

      setDiscussionMessage(data.message || "Discussion updated.");
      await loadDiscussions();
    } catch (err) {
      setDiscussionError(
        err.response?.data?.message || "Unable to update discussion.",
      );
    }
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();

    try {
      setReviewError("");
      setReviewMessage("");
      setIsReviewing(true);

      const data = await createCourseReview(id, {
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment.trim(),
      });

      if (data.course) setCourse(data.course);

      setReviewForm({
        rating: 5,
        comment: "",
      });

      setReviewMessage(data.message || "Review added successfully.");
    } catch (err) {
      setReviewError(err.response?.data?.message || "Unable to submit review.");
    } finally {
      setIsReviewing(false);
    }
  };

  const startEditReview = (review) => {
    setReviewError("");
    setReviewMessage("");
    setEditingReviewId(review._id);
    setEditReviewForm({
      rating: review.rating || 5,
      comment: review.comment || "",
    });
  };

  const handleUpdateReview = async (event) => {
    event.preventDefault();

    try {
      setReviewError("");
      setReviewMessage("");
      setIsReviewing(true);

      const data = await updateCourseReview(id, editingReviewId, {
        rating: Number(editReviewForm.rating),
        comment: editReviewForm.comment.trim(),
      });

      if (data.course) setCourse(data.course);

      setEditingReviewId("");
      setReviewMessage(data.message || "Review updated successfully.");
    } catch (err) {
      setReviewError(err.response?.data?.message || "Unable to update review.");
    } finally {
      setIsReviewing(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    const confirmed = window.confirm("Delete your review?");

    if (!confirmed) return;

    try {
      setReviewError("");
      setReviewMessage("");
      setIsReviewing(true);

      const data = await deleteCourseReview(id, reviewId);

      if (data.course) setCourse(data.course);

      setEditingReviewId("");
      setReviewMessage(data.message || "Review deleted successfully.");
    } catch (err) {
      setReviewError(err.response?.data?.message || "Unable to delete review.");
    } finally {
      setIsReviewing(false);
    }
  };

  const getLessonWatchedPercent = (lessonId) => {
    const item = lessonProgressList.find(
      (lessonProgress) => lessonProgress.lessonId === lessonId,
    );

    if (!item?.durationSeconds) return 0;

    return Math.min(
      Math.round((item.watchedSeconds / item.durationSeconds) * 100),
      100,
    );
  };

  if (isLoading) {
    return (
      <section className="mx-auto max-w-4xl">
        <div className="animate-pulse rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="h-5 w-28 rounded bg-zinc-200" />
          <div className="mt-6 h-10 w-3/4 rounded bg-zinc-200" />
          <div className="mt-5 space-y-3">
            <div className="h-4 rounded bg-zinc-200" />
            <div className="h-4 rounded bg-zinc-200" />
            <div className="h-4 w-2/3 rounded bg-zinc-200" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-2xl rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-medium text-red-800">{error}</p>

        <button
          type="button"
          onClick={loadCourse}
          className="mt-4 rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800"
        >
          Try again
        </button>
      </section>
    );
  }

  if (!course) {
    return (
      <section className="mx-auto max-w-2xl rounded-lg border border-zinc-200 bg-white p-6 text-center shadow-sm">
        <h2 className="text-xl font-semibold text-zinc-950">
          Course not found
        </h2>

        <p className="mt-2 text-sm text-zinc-600">
          This course may have been removed or does not exist.
        </p>

        <Link
          to="/courses"
          className="mt-5 inline-flex rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          Browse courses
        </Link>
      </section>
    );
  }

  const instructorName = course.instructor?.name || "SkillSphere Instructor";
  const instructorEmail = course.instructor?.email;
  const canPurchase =
    isAuthenticated && user?.role === "student" && !isEnrolled;
  const studentCount = course.students?.length || 0;
  const sections = course.sections || [];
  const reviews = course.reviews || [];
  const filteredDiscussions = discussions.filter((discussion) => {
    if (discussionFilter === "open") return !discussion.isResolved;
    if (discussionFilter === "resolved") return discussion.isResolved;
    return true;
  });

  const isActiveLessonCompleted =
    activeLesson?._id && completedLessons.includes(activeLesson._id);

  const activeLessonYoutubeEmbedUrl = getYouTubeEmbedUrl(
    activeLesson?.videoUrl || "",
  );

  const activeLessonWatchedPercent = activeLesson?._id
    ? getLessonWatchedPercent(activeLesson._id)
    : 0;

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <CourseHero
          course={course}
          studentCount={studentCount}
          continueLesson={continueLesson}
          canTrackProgress={canTrackProgress}
          openLessonById={openLessonById}
        />

        <CoursePurchaseCard
          course={course}
          formatPrice={formatPrice}
          isAuthenticated={isAuthenticated}
          user={user}
          location={location}
          isSaved={isSaved}
          isSavingCourse={isSavingCourse}
          handleToggleSaveCourse={handleToggleSaveCourse}
          canTrackProgress={canTrackProgress}
          percentage={percentage}
          completed={completed}
          totalLessons={totalLessons}
          isEnrolled={isEnrolled}
          enrollMessage={enrollMessage}
          enrollError={enrollError}
          canPurchase={canPurchase}
          handleBuyCourse={handleBuyCourse}
          isEnrolling={isEnrolling}
          isFreeCourse={isFreeCourse}
          instructorName={instructorName}
          instructorEmail={instructorEmail}
        />
      </div>

      <ActiveLessonPlayer
        activeLesson={activeLesson}
        activeLessonYoutubeEmbedUrl={activeLessonYoutubeEmbedUrl}
        videoRef={videoRef}
        handleVideoTimeUpdate={handleVideoTimeUpdate}
        handleVideoPauseOrEnded={handleVideoPauseOrEnded}
        canTrackProgress={canTrackProgress}
        activeLessonWatchedPercent={activeLessonWatchedPercent}
        progressMessage={progressMessage}
        handleMarkComplete={handleMarkComplete}
        isCompleting={isCompleting}
        isActiveLessonCompleted={isActiveLessonCompleted}
        nextLesson={nextLesson}
        handleOpenNextLesson={handleOpenNextLesson}
      />

      {canTrackProgress ? (
        <LessonNotes
          lessonNote={lessonNote}
          noteForm={noteForm}
          setNoteForm={setNoteForm}
          noteMessage={noteMessage}
          noteError={noteError}
          isSavingNote={isSavingNote}
          handleSaveLessonNote={handleSaveLessonNote}
          handleDeleteLessonNote={handleDeleteLessonNote}
        />
      ) : null}

      <CourseCurriculum
        sections={sections}
        canViewAllLessons={canViewAllLessons}
        completedLessons={completedLessons}
        getLessonWatchedPercent={getLessonWatchedPercent}
        handleOpenLesson={handleOpenLesson}
      />

      <CourseQuizzes
        quizzes={quizzes}
        isAuthenticated={isAuthenticated}
        user={user}
        isEnrolled={isEnrolled}
      />
      <AiStudyNotes
        canViewAllLessons={canViewAllLessons}
        studyNotes={studyNotes}
        studyNotesError={studyNotesError}
        isGeneratingNotes={isGeneratingNotes}
        handleGenerateStudyNotes={handleGenerateStudyNotes}
      />

      <AiFlashcards
        canViewAllLessons={canViewAllLessons}
        flashcards={flashcards}
        flashcardsError={flashcardsError}
        isGeneratingFlashcards={isGeneratingFlashcards}
        handleGenerateFlashcards={handleGenerateFlashcards}
        activeFlashcard={activeFlashcard}
        setActiveFlashcard={setActiveFlashcard}
        showFlashcardAnswer={showFlashcardAnswer}
        setShowFlashcardAnswer={setShowFlashcardAnswer}
      />
      <CourseCommunity
        discussions={discussions}
        filteredDiscussions={filteredDiscussions}
        discussionFilter={discussionFilter}
        setDiscussionFilter={setDiscussionFilter}
        discussionError={discussionError}
        discussionMessage={discussionMessage}
        canUseDiscussions={canUseDiscussions}
        discussionForm={discussionForm}
        setDiscussionForm={setDiscussionForm}
        handleSubmitDiscussion={handleSubmitDiscussion}
        replyForms={replyForms}
        setReplyForms={setReplyForms}
        handleSubmitReply={handleSubmitReply}
        handleToggleResolved={handleToggleResolved}
        getUserId={getUserId}
        studentId={studentId}
        user={user}
      />

      <CourseReviews
        course={course}
        reviews={reviews}
        reviewMessage={reviewMessage}
        reviewError={reviewError}
        canReview={canReview}
        reviewForm={reviewForm}
        setReviewForm={setReviewForm}
        handleSubmitReview={handleSubmitReview}
        isReviewing={isReviewing}
        isAuthenticated={isAuthenticated}
        user={user}
        isEnrolled={isEnrolled}
        hasReviewed={hasReviewed}
        getUserId={getUserId}
        studentId={studentId}
        editingReviewId={editingReviewId}
        editReviewForm={editReviewForm}
        setEditReviewForm={setEditReviewForm}
        handleUpdateReview={handleUpdateReview}
        setEditingReviewId={setEditingReviewId}
        startEditReview={startEditReview}
        handleDeleteReview={handleDeleteReview}
      />
    </section>
  );
}

export default CourseDetailsPage;
