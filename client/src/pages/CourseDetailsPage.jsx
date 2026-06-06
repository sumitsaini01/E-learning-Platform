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

function StarRatingInput({ value, onChange, disabled = false }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          className={`text-2xl transition ${
            star <= Number(value)
              ? "text-amber-500"
              : "text-zinc-300 hover:text-amber-400"
          } disabled:cursor-not-allowed`}
          aria-label={`${star} star`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

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
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              {course.category || "General"}
            </span>

            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
              {studentCount} enrolled
            </span>

            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
              {course.level || "beginner"}
            </span>

            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              ★ {(course.averageRating || 0).toFixed(1)} (
              {course.numReviews || 0})
            </span>
          </div>

          <h1 className="mt-5 text-3xl font-semibold leading-tight text-zinc-950 sm:text-4xl">
            {course.title}
          </h1>

          <p className="mt-5 whitespace-pre-line text-sm leading-7 text-zinc-600">
            {course.description || "No course description available."}
          </p>

          {continueLesson?.lessonId && canTrackProgress ? (
            <button
              type="button"
              onClick={() => openLessonById(continueLesson.lessonId)}
              className="mt-5 rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              Continue Watching: {continueLesson.lessonTitle}
            </button>
          ) : null}
        </div>

        <aside className="h-fit rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-zinc-500">Price</p>

          <p className="mt-1 text-3xl font-semibold text-zinc-950">
            {formatPrice(course.price)}
          </p>

          {isAuthenticated && user?.role === "student" ? (
            <button
              type="button"
              onClick={handleToggleSaveCourse}
              disabled={isSavingCourse}
              className="mt-4 w-full rounded-md border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSavingCourse
                ? "Updating..."
                : isSaved
                  ? "Saved ✓"
                  : "Save Course"}
            </button>
          ) : null}

          <div className="mt-6 border-t border-zinc-100 pt-5">
            <p className="text-sm text-zinc-500">Instructor</p>

            <p className="mt-1 text-sm font-semibold text-zinc-950">
              {instructorName}
            </p>

            {instructorEmail ? (
              <p className="mt-1 text-sm text-zinc-600">{instructorEmail}</p>
            ) : null}
          </div>

          {canTrackProgress ? (
            <div className="mt-6 border-t border-zinc-100 pt-5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-zinc-700">Progress</span>
                <span className="font-semibold text-emerald-700">
                  {percentage}%
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full rounded-full bg-emerald-600"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <p className="mt-2 text-xs text-zinc-500">
                {completed} of {totalLessons} lessons completed
              </p>
            </div>
          ) : null}

          {isEnrolled ? (
            <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              You are enrolled in this course.
            </div>
          ) : null}

          {enrollMessage ? (
            <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {enrollMessage}
            </div>
          ) : null}

          {enrollError ? (
            <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {enrollError}
            </div>
          ) : null}

          {canPurchase ? (
            <button
              type="button"
              onClick={handleBuyCourse}
              disabled={isEnrolling}
              className="mt-6 w-full rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-400"
            >
              {isEnrolling
                ? isFreeCourse
                  ? "Enrolling..."
                  : "Processing..."
                : isFreeCourse
                  ? "Enroll for Free"
                  : "Buy Now"}
            </button>
          ) : !isAuthenticated ? (
            <Link
              to="/login"
              state={{ from: location }}
              className="mt-6 inline-flex w-full justify-center rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              Login as student to continue
            </Link>
          ) : null}
        </aside>
      </div>

      {activeLesson ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
            {activeLesson.sectionTitle}
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
            {activeLesson.title}
          </h2>

          {activeLesson.description ? (
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              {activeLesson.description}
            </p>
          ) : null}

          {activeLesson.videoUrl ? (
            <div className="mt-5 overflow-hidden rounded-lg border border-zinc-200 bg-black">
              {activeLessonYoutubeEmbedUrl ? (
                <iframe
                  src={activeLessonYoutubeEmbedUrl}
                  title={activeLesson.title}
                  className="aspect-video w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  ref={videoRef}
                  src={activeLesson.videoUrl}
                  controls
                  controlsList="nodownload"
                  className="aspect-video w-full"
                  onTimeUpdate={handleVideoTimeUpdate}
                  onPause={handleVideoPauseOrEnded}
                  onEnded={handleVideoPauseOrEnded}
                />
              )}
            </div>
          ) : (
            <p className="mt-5 rounded-md bg-stone-50 px-3 py-2 text-sm text-zinc-600">
              No video URL added for this lesson.
            </p>
          )}

          {canTrackProgress ? (
            <div className="mt-5">
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>Watch progress</span>
                  <span>{activeLessonWatchedPercent}%</span>
                </div>

                <div className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${activeLessonWatchedPercent}%` }}
                  />
                </div>
              </div>

              {progressMessage ? (
                <p className="mb-3 rounded-md bg-stone-50 px-3 py-2 text-sm text-zinc-700">
                  {progressMessage}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleMarkComplete}
                  disabled={isCompleting || isActiveLessonCompleted}
                  className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-400"
                >
                  {isActiveLessonCompleted
                    ? "Completed"
                    : isCompleting
                      ? "Marking..."
                      : "Mark as Complete"}
                </button>

                {nextLesson ? (
                  <button
                    type="button"
                    onClick={handleOpenNextLesson}
                    className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100"
                  >
                    Next Lesson →
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
          {canTrackProgress ? (
            <div className="mt-8 border-t border-zinc-200 pt-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-950">
                    My Lesson Notes
                  </h3>
                  <p className="mt-1 text-sm text-zinc-600">
                    Save your personal notes for this lesson.
                  </p>
                </div>

                {lessonNote ? (
                  <button
                    type="button"
                    onClick={handleDeleteLessonNote}
                    disabled={isSavingNote}
                    className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:bg-red-300"
                  >
                    Delete Note
                  </button>
                ) : null}
              </div>

              {noteMessage ? (
                <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                  {noteMessage}
                </div>
              ) : null}

              {noteError ? (
                <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {noteError}
                </div>
              ) : null}

              <form onSubmit={handleSaveLessonNote} className="mt-5 space-y-4">
                <input
                  type="text"
                  value={noteForm.title}
                  onChange={(event) =>
                    setNoteForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Note title, optional"
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />

                <textarea
                  value={noteForm.content}
                  onChange={(event) =>
                    setNoteForm((current) => ({
                      ...current,
                      content: event.target.value,
                    }))
                  }
                  placeholder="Write your lesson notes here..."
                  className="min-h-36 w-full resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />

                <button
                  type="submit"
                  disabled={isSavingNote || !noteForm.content.trim()}
                  className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-400"
                >
                  {isSavingNote
                    ? "Saving..."
                    : lessonNote
                      ? "Update Note"
                      : "Save Note"}
                </button>
              </form>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-zinc-950">
          Course Curriculum
        </h2>

        <div className="mt-6 space-y-5">
          {sections.length === 0 ? (
            <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-600">
              Curriculum has not been added yet.
            </p>
          ) : (
            sections.map((section, sectionIndex) => (
              <div
                key={section._id}
                className="rounded-lg border border-zinc-200 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Section {sectionIndex + 1}
                </p>

                <h3 className="mt-1 font-semibold text-zinc-950">
                  {section.title}
                </h3>

                <div className="mt-4 space-y-3">
                  {section.lessons?.length ? (
                    section.lessons.map((lesson, lessonIndex) => {
                      const isLocked =
                        !canViewAllLessons && !lesson.isPreviewFree;

                      const isCompleted = completedLessons.includes(lesson._id);
                      const watchedPercent = getLessonWatchedPercent(
                        lesson._id,
                      );

                      return (
                        <button
                          key={lesson._id}
                          type="button"
                          onClick={() => handleOpenLesson(lesson, section)}
                          className={`w-full rounded-md border p-3 text-left transition ${
                            isLocked
                              ? "border-zinc-200 bg-stone-50"
                              : "border-zinc-200 bg-white hover:border-emerald-300 hover:bg-emerald-50"
                          }`}
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex-1">
                              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                Lesson {lessonIndex + 1}
                              </p>

                              <h4 className="mt-1 font-medium text-zinc-950">
                                {lesson.title}
                              </h4>

                              <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-600">
                                <span>{lesson.duration || 0} min</span>

                                {watchedPercent > 0 && !isCompleted ? (
                                  <span className="rounded-full bg-blue-100 px-2 py-1 font-medium text-blue-800">
                                    {watchedPercent}% watched
                                  </span>
                                ) : null}

                                {lesson.isPreviewFree ? (
                                  <span className="rounded-full bg-emerald-100 px-2 py-1 font-medium text-emerald-800">
                                    Free Preview
                                  </span>
                                ) : null}

                                {isCompleted ? (
                                  <span className="rounded-full bg-blue-100 px-2 py-1 font-medium text-blue-800">
                                    Completed
                                  </span>
                                ) : null}

                                {isLocked ? (
                                  <span className="rounded-full bg-zinc-200 px-2 py-1 font-medium text-zinc-700">
                                    Locked
                                  </span>
                                ) : null}
                              </div>

                              {watchedPercent > 0 ? (
                                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                                  <div
                                    className="h-full rounded-full bg-blue-600"
                                    style={{
                                      width: `${watchedPercent}%`,
                                    }}
                                  />
                                </div>
                              ) : null}
                            </div>

                            <span className="text-sm font-medium text-emerald-700">
                              {isLocked ? "Enroll to unlock" : "Open"}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <p className="rounded-md bg-stone-50 p-3 text-sm text-zinc-600">
                      No lessons added yet.
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-zinc-950">Course Quizzes</h2>

        <div className="mt-5 space-y-4">
          {quizzes.length === 0 ? (
            <p className="rounded-md bg-stone-50 p-4 text-sm text-zinc-600">
              No quizzes available for this course yet.
            </p>
          ) : (
            quizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="rounded-lg border border-zinc-200 p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-zinc-950">
                      {quiz.title}
                    </h3>

                    {quiz.description ? (
                      <p className="mt-2 text-sm text-zinc-600">
                        {quiz.description}
                      </p>
                    ) : null}

                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-emerald-100 px-2 py-1 font-medium text-emerald-800">
                        {quiz.questions?.length || 0} questions
                      </span>

                      <span className="rounded-full bg-amber-100 px-2 py-1 font-medium text-amber-800">
                        Passing {quiz.passingPercentage}%
                      </span>

                      {quiz.timeLimitMinutes > 0 ? (
                        <span className="rounded-full bg-blue-100 px-2 py-1 font-medium text-blue-800">
                          {quiz.timeLimitMinutes} min
                        </span>
                      ) : null}

                      {quiz.maxAttempts > 0 ? (
                        <span className="rounded-full bg-zinc-100 px-2 py-1 font-medium text-zinc-700">
                          {quiz.maxAttempts} attempts
                        </span>
                      ) : (
                        <span className="rounded-full bg-zinc-100 px-2 py-1 font-medium text-zinc-700">
                          Unlimited attempts
                        </span>
                      )}
                    </div>
                  </div>

                  {isAuthenticated && user?.role === "student" && isEnrolled ? (
                    <Link
                      to={`/quizzes/${quiz._id}/attempt`}
                      className="inline-flex justify-center rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
                    >
                      Attempt Quiz
                    </Link>
                  ) : (
                    <p className="rounded-md bg-stone-50 px-3 py-2 text-sm text-zinc-600">
                      Enroll to attempt
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-zinc-950">
              AI Study Notes
            </h2>

            <p className="mt-1 text-sm text-zinc-600">
              Generate quick revision notes, key points, terms, and practice
              questions.
            </p>
          </div>

          {canViewAllLessons ? (
            <button
              type="button"
              onClick={handleGenerateStudyNotes}
              disabled={isGeneratingNotes}
              className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-400"
            >
              {isGeneratingNotes ? "Generating..." : "Generate Notes with AI"}
            </button>
          ) : null}
        </div>

        {!canViewAllLessons ? (
          <p className="mt-5 rounded-md bg-stone-50 px-3 py-2 text-sm text-zinc-600">
            Enroll in this course to generate AI study notes.
          </p>
        ) : null}

        {studyNotesError ? (
          <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {studyNotesError}
          </div>
        ) : null}

        {studyNotes ? (
          <div className="mt-6 space-y-5">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-5">
              <h3 className="font-semibold text-zinc-950">Summary</h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-zinc-700">
                {studyNotes.summary}
              </p>
            </div>

            {studyNotes.keyPoints?.length ? (
              <div className="rounded-xl border border-zinc-200 p-5">
                <h3 className="font-semibold text-zinc-950">Key Points</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-700">
                  {studyNotes.keyPoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {studyNotes.importantTerms?.length ? (
              <div className="rounded-xl border border-zinc-200 p-5">
                <h3 className="font-semibold text-zinc-950">Important Terms</h3>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {studyNotes.importantTerms.map((item, index) => (
                    <div key={index} className="rounded-lg bg-stone-50 p-4">
                      <p className="font-semibold text-zinc-950">{item.term}</p>
                      <p className="mt-1 text-sm leading-6 text-zinc-600">
                        {item.definition}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {studyNotes.revisionChecklist?.length ? (
              <div className="rounded-xl border border-zinc-200 p-5">
                <h3 className="font-semibold text-zinc-950">
                  Revision Checklist
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-zinc-700">
                  {studyNotes.revisionChecklist.map((item, index) => (
                    <li key={index}>✅ {item}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {studyNotes.practiceQuestions?.length ? (
              <div className="rounded-xl border border-zinc-200 p-5">
                <h3 className="font-semibold text-zinc-950">
                  Practice Questions
                </h3>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-700">
                  {studyNotes.practiceQuestions.map((question, index) => (
                    <li key={index}>{question}</li>
                  ))}
                </ol>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-zinc-950">
              AI Flashcards
            </h2>

            <p className="mt-1 text-sm text-zinc-600">
              Generate quick revision flashcards for this course.
            </p>
          </div>

          {canViewAllLessons ? (
            <button
              type="button"
              onClick={handleGenerateFlashcards}
              disabled={isGeneratingFlashcards}
              className="rounded-md bg-purple-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:bg-purple-400"
            >
              {isGeneratingFlashcards ? "Generating..." : "Generate Flashcards"}
            </button>
          ) : null}
        </div>

        {!canViewAllLessons ? (
          <p className="mt-5 rounded-md bg-stone-50 px-3 py-2 text-sm text-zinc-600">
            Enroll in this course to generate AI flashcards.
          </p>
        ) : null}

        {flashcardsError ? (
          <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {flashcardsError}
          </div>
        ) : null}

        {flashcards.length > 0 ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {flashcards.map((card, index) => {
              const isFlipped = Boolean(flippedCards[index]);

              return (
                <button
                  key={`${card.question}-${index}`}
                  type="button"
                  onClick={() => handleToggleFlashcard(index)}
                  className={`min-h-40 rounded-xl border p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                    isFlipped
                      ? "border-purple-200 bg-purple-50"
                      : "border-zinc-200 bg-white"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">
                    {isFlipped ? "Answer" : "Question"} #{index + 1}
                  </p>

                  <p className="mt-3 text-sm leading-6 text-zinc-800">
                    {isFlipped ? card.answer : card.question}
                  </p>

                  <p className="mt-4 text-xs font-medium text-zinc-500">
                    Click to {isFlipped ? "view question" : "reveal answer"}
                  </p>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-zinc-950">
              Course Community
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              Discuss lessons, ask doubts, share ideas, and help other learners
              in this course.
            </p>
          </div>

          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            {discussions.length} discussions
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {["all", "open", "resolved"].map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setDiscussionFilter(filter)}
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition ${
                discussionFilter === filter
                  ? "bg-emerald-700 text-white"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {discussionError ? (
          <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {discussionError}
          </div>
        ) : null}

        {discussionMessage ? (
          <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {discussionMessage}
          </div>
        ) : null}

        {canUseDiscussions ? (
          <form
            onSubmit={handleSubmitDiscussion}
            className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50/40 p-5"
          >
            <h3 className="font-semibold text-zinc-950">Start a discussion</h3>

            <input
              type="text"
              value={discussionForm.title}
              onChange={(event) =>
                setDiscussionForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              placeholder="Example: I am confused about useEffect dependencies"
              className="mt-4 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />

            <textarea
              value={discussionForm.message}
              onChange={(event) =>
                setDiscussionForm((current) => ({
                  ...current,
                  message: event.target.value,
                }))
              }
              placeholder="Explain your question in detail."
              className="mt-3 min-h-24 w-full resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />

            <button
              type="submit"
              className="mt-4 rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Post Discussion
            </button>
          </form>
        ) : (
          <p className="mt-5 rounded-md bg-stone-50 px-3 py-2 text-sm text-zinc-600">
            Enroll in this course to participate in discussions.
          </p>
        )}

        <div className="mt-6 space-y-5">
          {filteredDiscussions.length === 0 ? (
            <p className="rounded-md bg-stone-50 p-4 text-sm text-zinc-600">
              No discussions found. Start the community conversation.
            </p>
          ) : (
            filteredDiscussions.map((discussion) => {
              const canMarkResolved =
                getUserId(discussion.user) === studentId ||
                user?.role === "instructor" ||
                user?.role === "admin";

              return (
                <div
                  key={discussion._id}
                  className="rounded-xl border border-zinc-200 p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-zinc-950">
                          {discussion.title}
                        </h3>

                        {discussion.isResolved ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">
                            Resolved
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
                            Open
                          </span>
                        )}
                        <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-700">
                          {discussion.replies?.length || 0} replies
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-zinc-500">
                        Asked by {discussion.name} •{" "}
                        {new Date(discussion.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {canMarkResolved ? (
                      <button
                        type="button"
                        onClick={() => handleToggleResolved(discussion._id)}
                        className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100"
                      >
                        {discussion.isResolved ? "Reopen" : "Mark Resolved"}
                      </button>
                    ) : null}
                  </div>

                  <p className="mt-4 whitespace-pre-line text-sm leading-6 text-zinc-700">
                    {discussion.message}
                  </p>

                  <div className="mt-5 space-y-3">
                    {discussion.replies?.map((reply, index) => (
                      <div
                        key={`${discussion._id}-${index}`}
                        className="rounded-lg border border-zinc-100 bg-stone-50 p-4"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-zinc-950">
                            {reply.name}
                          </p>

                          <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium capitalize text-zinc-700">
                            {reply.role}
                          </span>
                        </div>

                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-zinc-700">
                          {reply.message}
                        </p>

                        <p className="mt-2 text-xs text-zinc-400">
                          {reply.createdAt
                            ? new Date(reply.createdAt).toLocaleString()
                            : ""}
                        </p>
                      </div>
                    ))}
                  </div>

                  {canUseDiscussions ? (
                    <form
                      onSubmit={(event) =>
                        handleSubmitReply(event, discussion._id)
                      }
                      className="mt-4 flex flex-col gap-3 sm:flex-row"
                    >
                      <input
                        type="text"
                        value={replyForms[discussion._id] || ""}
                        onChange={(event) =>
                          setReplyForms((current) => ({
                            ...current,
                            [discussion._id]: event.target.value,
                          }))
                        }
                        placeholder="Write a reply..."
                        className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                      />

                      <button
                        type="submit"
                        className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
                      >
                        Reply
                      </button>
                    </form>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-zinc-950">
              Reviews & Ratings
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              Average rating: {(course.averageRating || 0).toFixed(1)} / 5 from{" "}
              {course.numReviews || 0} reviews.
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-full bg-amber-50 px-4 py-2">
            <span className="text-2xl font-bold text-amber-600">
              {(course.averageRating || 0).toFixed(1)}
            </span>
            <span className="text-amber-500">★</span>
          </div>
        </div>

        {reviewMessage ? (
          <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {reviewMessage}
          </div>
        ) : null}

        {reviewError ? (
          <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {reviewError}
          </div>
        ) : null}

        {canReview ? (
          <form
            onSubmit={handleSubmitReview}
            className="mt-5 rounded-xl border border-amber-200 bg-amber-50/40 p-5"
          >
            <h3 className="font-semibold text-zinc-950">Write a review</h3>

            <div className="mt-4">
              <label className="block text-sm font-medium text-zinc-800">
                Your rating
              </label>

              <div className="mt-2">
                <StarRatingInput
                  value={reviewForm.rating}
                  onChange={(rating) =>
                    setReviewForm((current) => ({
                      ...current,
                      rating,
                    }))
                  }
                  disabled={isReviewing}
                />
              </div>
            </div>

            <div className="mt-4">
              <label
                htmlFor="comment"
                className="block text-sm font-medium text-zinc-800"
              >
                Comment
              </label>

              <textarea
                id="comment"
                name="comment"
                value={reviewForm.comment}
                onChange={(event) =>
                  setReviewForm((current) => ({
                    ...current,
                    comment: event.target.value,
                  }))
                }
                className="mt-2 min-h-28 w-full resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                placeholder="Share your experience with this course."
                required
              />
            </div>

            <button
              type="submit"
              disabled={isReviewing || !reviewForm.comment.trim()}
              className="mt-4 rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-amber-300"
            >
              {isReviewing ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        ) : isAuthenticated &&
          user?.role === "student" &&
          isEnrolled &&
          hasReviewed ? (
          <p className="mt-5 rounded-md bg-stone-50 px-3 py-2 text-sm text-zinc-600">
            You have already reviewed this course. You can edit or delete your
            review below.
          </p>
        ) : null}

        <div className="mt-6 space-y-4">
          {reviews.length === 0 ? (
            <p className="rounded-md bg-stone-50 p-4 text-sm text-zinc-600">
              No reviews yet.
            </p>
          ) : (
            reviews.map((review) => {
              const isOwnReview = getUserId(review.user) === studentId;
              const isEditing = editingReviewId === review._id;

              return (
                <div
                  key={review._id}
                  className="rounded-xl border border-zinc-200 p-5 shadow-sm"
                >
                  {isEditing ? (
                    <form onSubmit={handleUpdateReview}>
                      <div>
                        <label className="block text-sm font-medium text-zinc-800">
                          Edit rating
                        </label>

                        <div className="mt-2">
                          <StarRatingInput
                            value={editReviewForm.rating}
                            onChange={(rating) =>
                              setEditReviewForm((current) => ({
                                ...current,
                                rating,
                              }))
                            }
                            disabled={isReviewing}
                          />
                        </div>
                      </div>

                      <textarea
                        value={editReviewForm.comment}
                        onChange={(event) =>
                          setEditReviewForm((current) => ({
                            ...current,
                            comment: event.target.value,
                          }))
                        }
                        className="mt-4 min-h-24 w-full resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                        required
                      />

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="submit"
                          disabled={
                            isReviewing || !editReviewForm.comment.trim()
                          }
                          className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:bg-amber-300"
                        >
                          {isReviewing ? "Saving..." : "Save Review"}
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingReviewId("")}
                          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-semibold text-zinc-950">
                            {review.name}
                          </p>

                          <div className="mt-1 flex items-center gap-2">
                            <div className="text-lg text-amber-500">
                              {"★".repeat(review.rating)}
                              <span className="text-zinc-300">
                                {"★".repeat(5 - review.rating)}
                              </span>
                            </div>

                            <span className="text-sm text-zinc-500">
                              {review.rating}/5
                            </span>
                          </div>
                        </div>

                        {isOwnReview ? (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => startEditReview(review)}
                              className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteReview(review._id)}
                              className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        ) : null}
                      </div>

                      <p className="mt-3 text-sm leading-6 text-zinc-600">
                        {review.comment}
                      </p>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

export default CourseDetailsPage;
