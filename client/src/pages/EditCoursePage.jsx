import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  addLesson,
  addSection,
  deleteCourse,
  deleteLesson,
  deleteSection,
  getCourseById,
  moveLesson,
  publishCourse,
  unpublishCourse,
  updateCourse,
  updateLesson,
  updateSection,
} from "../services/courseService";
import { courseCategories } from "../constants/coursecategories";

const initialFormState = {
  title: "",
  description: "",
  category: "",
  price: "",
  thumbnail: "",
  level: "beginner",
};

function EditCoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormState);
  const [course, setCourse] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isDeleting, setIsDeleting] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  const [sectionForm, setSectionForm] = useState({
    title: "",
    description: "",
  });
  const [lessonForms, setLessonForms] = useState({});
  const [curriculumLoadingId, setCurriculumLoadingId] = useState("");

  const [editingSectionId, setEditingSectionId] = useState("");
  const [sectionEditForms, setSectionEditForms] = useState({});

  const [editingLessonId, setEditingLessonId] = useState("");
  const [lessonEditForms, setLessonEditForms] = useState({});

  useEffect(() => {
    let shouldUpdate = true;

    const loadCourse = async () => {
      try {
        setError("");
        const data = await getCourseById(courseId);
        if (!shouldUpdate) return;

        const courseData = data.course;
        setCourse(courseData);

        setFormData({
          title: courseData.title || "",
          description: courseData.description || "",
          category: courseData.category || "",
          price: courseData.price || "",
          thumbnail: courseData.thumbnail || "",
          level: courseData.level || "beginner",
        });
      } catch (err) {
        if (!shouldUpdate) return;
        setError(
          err.response?.data?.message || "Unable to load course details.",
        );
      } finally {
        if (shouldUpdate) setIsLoading(false);
      }
    };

    loadCourse();

    return () => {
      shouldUpdate = false;
    };
  }, [courseId]);

  const updateSections = (sections) => {
    setCourse((current) => ({
      ...current,
      sections,
    }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError("");
      setSuccess("");
      setIsSaving(true);

      const data = await updateCourse(courseId, {
        ...formData,
        price: Number(formData.price),
      });

      setCourse(data.course);
      setSuccess("Course updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update course.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      setError("");
      setSuccess("");
      setIsDeleting(true);
      await deleteCourse(courseId);
      navigate("/dashboard/instructor");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete course.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      setError("");
      setSuccess("");
      setIsStatusUpdating(true);

      const response =
        course.status === "published"
          ? await unpublishCourse(courseId)
          : await publishCourse(courseId);

      setCourse(response.course);
      setSuccess(response.message);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update course status.",
      );
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const handleAddSection = async (event) => {
    event.preventDefault();

    try {
      setError("");
      setSuccess("");
      setCurriculumLoadingId("section");

      const data = await addSection(courseId, sectionForm);
      updateSections(data.sections);

      setSectionForm({ title: "", description: "" });
      setSuccess("Section added successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to add section.");
    } finally {
      setCurriculumLoadingId("");
    }
  };

  const startEditSection = (section) => {
    setEditingSectionId(section._id);
    setSectionEditForms((current) => ({
      ...current,
      [section._id]: {
        title: section.title || "",
        description: section.description || "",
      },
    }));
  };

  const handleSectionEditChange = (sectionId, field, value) => {
    setSectionEditForms((current) => ({
      ...current,
      [sectionId]: {
        ...current[sectionId],
        [field]: value,
      },
    }));
  };

  const handleUpdateSection = async (sectionId) => {
    try {
      setError("");
      setSuccess("");
      setCurriculumLoadingId(sectionId);

      const data = await updateSection(
        courseId,
        sectionId,
        sectionEditForms[sectionId],
      );
      updateSections(data.sections);

      setEditingSectionId("");
      setSuccess("Section updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update section.");
    } finally {
      setCurriculumLoadingId("");
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm("Delete this section and all lessons inside it?"))
      return;

    try {
      setError("");
      setSuccess("");
      setCurriculumLoadingId(sectionId);

      const data = await deleteSection(courseId, sectionId);
      updateSections(data.sections);

      setSuccess("Section deleted successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete section.");
    } finally {
      setCurriculumLoadingId("");
    }
  };

  const handleLessonFormChange = (sectionId, field, value) => {
    setLessonForms((current) => ({
      ...current,
      [sectionId]: {
        ...current[sectionId],
        [field]: value,
      },
    }));
  };

  const handleAddLesson = async (sectionId) => {
    try {
      setError("");
      setSuccess("");
      setCurriculumLoadingId(sectionId);

      const lessonForm = lessonForms[sectionId] || {};

      const data = await addLesson(courseId, sectionId, {
        title: lessonForm.title || "",
        description: lessonForm.description || "",
        videoUrl: lessonForm.videoUrl || "",
        duration: Number(lessonForm.duration) || 0,
        isPreviewFree: Boolean(lessonForm.isPreviewFree),
      });

      updateSections(data.sections);

      setLessonForms((current) => ({
        ...current,
        [sectionId]: {},
      }));

      setSuccess("Lesson added successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to add lesson.");
    } finally {
      setCurriculumLoadingId("");
    }
  };

  const startEditLesson = (sectionId, lesson) => {
    setEditingLessonId(lesson._id);
    setLessonEditForms((current) => ({
      ...current,
      [lesson._id]: {
        sectionId,
        title: lesson.title || "",
        description: lesson.description || "",
        videoUrl: lesson.videoUrl || "",
        duration: lesson.duration || "",
        isPreviewFree: Boolean(lesson.isPreviewFree),
        targetSectionId: sectionId,
      },
    }));
  };

  const handleLessonEditChange = (lessonId, field, value) => {
    setLessonEditForms((current) => ({
      ...current,
      [lessonId]: {
        ...current[lessonId],
        [field]: value,
      },
    }));
  };

  const handleUpdateLesson = async (sectionId, lessonId) => {
    try {
      setError("");
      setSuccess("");
      setCurriculumLoadingId(lessonId);

      const editForm = lessonEditForms[lessonId];

      const data = await updateLesson(courseId, sectionId, lessonId, {
        title: editForm.title || "",
        description: editForm.description || "",
        videoUrl: editForm.videoUrl || "",
        duration: Number(editForm.duration) || 0,
        isPreviewFree: Boolean(editForm.isPreviewFree),
      });

      updateSections(data.sections);

      setEditingLessonId("");
      setSuccess("Lesson updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update lesson.");
    } finally {
      setCurriculumLoadingId("");
    }
  };

  const handleMoveLesson = async (sectionId, lessonId) => {
    try {
      const targetSectionId = lessonEditForms[lessonId]?.targetSectionId;

      if (!targetSectionId || targetSectionId === sectionId) {
        setError("Please select a different target section.");
        return;
      }

      setError("");
      setSuccess("");
      setCurriculumLoadingId(`move-${lessonId}`);

      const data = await moveLesson(
        courseId,
        sectionId,
        lessonId,
        targetSectionId,
      );
      updateSections(data.sections);

      setEditingLessonId("");
      setSuccess("Lesson moved successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to move lesson.");
    } finally {
      setCurriculumLoadingId("");
    }
  };

  const handleDeleteLesson = async (sectionId, lessonId) => {
    if (!window.confirm("Delete this lesson?")) return;

    try {
      setError("");
      setSuccess("");
      setCurriculumLoadingId(lessonId);

      const data = await deleteLesson(courseId, sectionId, lessonId);
      updateSections(data.sections);

      setSuccess("Lesson deleted successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete lesson.");
    } finally {
      setCurriculumLoadingId("");
    }
  };

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="animate-pulse rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="h-6 w-48 rounded bg-zinc-200" />
          <div className="mt-6 space-y-4">
            <div className="h-10 rounded bg-zinc-200" />
            <div className="h-32 rounded bg-zinc-200" />
            <div className="h-10 rounded bg-zinc-200" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
              Instructor
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
              Edit Course
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Update course details, manage visibility, and build the course
              curriculum.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/instructor/quizzes"
              state={{
                courseId: course?._id,
                courseTitle: course?.title,
              }}
              className="inline-flex justify-center rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Manage Quizzes
            </Link>

            <Link
              to="/dashboard/instructor"
              className="inline-flex justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
          >
            <div className="space-y-5">
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                placeholder="Course title"
                required
              />

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="min-h-40 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                placeholder="Course description"
                required
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select category</option>

                  {courseCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <input
                  name="price"
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  placeholder="Price"
                  required
                />
              </div>

              <input
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                placeholder="Thumbnail URL"
              />

              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>

              <button
                type="submit"
                disabled={isSaving}
                className="rounded-md bg-emerald-700 px-5 py-2 text-sm font-semibold text-white"
              >
                {isSaving ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-zinc-950">
              Course Curriculum
            </h2>

            <form
              onSubmit={handleAddSection}
              className="mt-5 rounded-lg border border-zinc-200 bg-stone-50 p-4"
            >
              <h3 className="font-semibold text-zinc-950">Add Section</h3>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  value={sectionForm.title}
                  onChange={(event) =>
                    setSectionForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Section title"
                  className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
                  required
                />

                <input
                  type="text"
                  value={sectionForm.description}
                  onChange={(event) =>
                    setSectionForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Section description"
                  className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={curriculumLoadingId === "section"}
                className="mt-4 rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
              >
                {curriculumLoadingId === "section"
                  ? "Adding..."
                  : "Add Section"}
              </button>
            </form>

            <div className="mt-6 space-y-5">
              {course?.sections?.length ? (
                course.sections.map((section, sectionIndex) => (
                  <div
                    key={section._id}
                    className="rounded-lg border border-zinc-200 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      {editingSectionId === section._id ? (
                        <div className="flex-1 space-y-3">
                          <input
                            value={sectionEditForms[section._id]?.title || ""}
                            onChange={(event) =>
                              handleSectionEditChange(
                                section._id,
                                "title",
                                event.target.value,
                              )
                            }
                            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                          />

                          <input
                            value={
                              sectionEditForms[section._id]?.description || ""
                            }
                            onChange={(event) =>
                              handleSectionEditChange(
                                section._id,
                                "description",
                                event.target.value,
                              )
                            }
                            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                          />

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleUpdateSection(section._id)}
                              className="rounded-md bg-emerald-700 px-3 py-2 text-sm text-white"
                            >
                              Save Section
                            </button>

                            <button
                              type="button"
                              onClick={() => setEditingSectionId("")}
                              className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                            Section {sectionIndex + 1}
                          </p>
                          <h3 className="mt-1 font-semibold text-zinc-950">
                            {section.title}
                          </h3>
                          {section.description ? (
                            <p className="mt-1 text-sm text-zinc-600">
                              {section.description}
                            </p>
                          ) : null}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEditSection(section)}
                          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteSection(section._id)}
                          className="rounded-md bg-red-600 px-3 py-2 text-sm text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {section.lessons?.length ? (
                        section.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lesson._id}
                            className="rounded-md border border-zinc-200 bg-stone-50 p-3"
                          >
                            {editingLessonId === lesson._id ? (
                              <div className="space-y-3">
                                <input
                                  value={
                                    lessonEditForms[lesson._id]?.title || ""
                                  }
                                  onChange={(event) =>
                                    handleLessonEditChange(
                                      lesson._id,
                                      "title",
                                      event.target.value,
                                    )
                                  }
                                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                                  placeholder="Lesson title"
                                />

                                <textarea
                                  value={
                                    lessonEditForms[lesson._id]?.description ||
                                    ""
                                  }
                                  onChange={(event) =>
                                    handleLessonEditChange(
                                      lesson._id,
                                      "description",
                                      event.target.value,
                                    )
                                  }
                                  className="min-h-20 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                                  placeholder="Lesson description"
                                />

                                <input
                                  value={
                                    lessonEditForms[lesson._id]?.videoUrl || ""
                                  }
                                  onChange={(event) =>
                                    handleLessonEditChange(
                                      lesson._id,
                                      "videoUrl",
                                      event.target.value,
                                    )
                                  }
                                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                                  placeholder="Video URL"
                                />

                                <input
                                  type="number"
                                  min="0"
                                  value={
                                    lessonEditForms[lesson._id]?.duration || ""
                                  }
                                  onChange={(event) =>
                                    handleLessonEditChange(
                                      lesson._id,
                                      "duration",
                                      event.target.value,
                                    )
                                  }
                                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                                  placeholder="Duration"
                                />

                                <select
                                  value={
                                    lessonEditForms[lesson._id]
                                      ?.targetSectionId || section._id
                                  }
                                  onChange={(event) =>
                                    handleLessonEditChange(
                                      lesson._id,
                                      "targetSectionId",
                                      event.target.value,
                                    )
                                  }
                                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                                >
                                  {course.sections.map((targetSection) => (
                                    <option
                                      key={targetSection._id}
                                      value={targetSection._id}
                                    >
                                      Move to: {targetSection.title}
                                    </option>
                                  ))}
                                </select>

                                <label className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={
                                      lessonEditForms[lesson._id]
                                        ?.isPreviewFree || false
                                    }
                                    onChange={(event) =>
                                      handleLessonEditChange(
                                        lesson._id,
                                        "isPreviewFree",
                                        event.target.checked,
                                      )
                                    }
                                  />
                                  Free preview
                                </label>

                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateLesson(
                                        section._id,
                                        lesson._id,
                                      )
                                    }
                                    className="rounded-md bg-emerald-700 px-3 py-2 text-sm text-white"
                                  >
                                    Save Lesson
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleMoveLesson(section._id, lesson._id)
                                    }
                                    className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white"
                                  >
                                    Move Lesson
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setEditingLessonId("")}
                                    className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                    Lesson {lessonIndex + 1}
                                  </p>
                                  <h4 className="mt-1 font-medium text-zinc-950">
                                    {lesson.title}
                                  </h4>
                                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-600">
                                    <span>{lesson.duration || 0} min</span>
                                    {lesson.isPreviewFree ? (
                                      <span className="rounded-full bg-emerald-100 px-2 py-1 font-medium text-emerald-800">
                                        Free Preview
                                      </span>
                                    ) : null}
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      startEditLesson(section._id, lesson)
                                    }
                                    className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
                                  >
                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteLesson(
                                        section._id,
                                        lesson._id,
                                      )
                                    }
                                    className="rounded-md bg-red-600 px-3 py-2 text-sm text-white"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="rounded-md bg-stone-50 p-3 text-sm text-zinc-600">
                          No lessons added yet.
                        </p>
                      )}
                    </div>

                    <div className="mt-4 rounded-md border border-zinc-200 bg-white p-4">
                      <h4 className="font-medium text-zinc-950">Add Lesson</h4>

                      <div className="mt-4 grid gap-3">
                        <input
                          type="text"
                          value={lessonForms[section._id]?.title || ""}
                          onChange={(event) =>
                            handleLessonFormChange(
                              section._id,
                              "title",
                              event.target.value,
                            )
                          }
                          placeholder="Lesson title"
                          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
                        />

                        <textarea
                          value={lessonForms[section._id]?.description || ""}
                          onChange={(event) =>
                            handleLessonFormChange(
                              section._id,
                              "description",
                              event.target.value,
                            )
                          }
                          placeholder="Lesson description"
                          className="min-h-24 rounded-md border border-zinc-300 px-3 py-2 text-sm"
                        />

                        <input
                          type="text"
                          value={lessonForms[section._id]?.videoUrl || ""}
                          onChange={(event) =>
                            handleLessonFormChange(
                              section._id,
                              "videoUrl",
                              event.target.value,
                            )
                          }
                          placeholder="Video URL"
                          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
                        />

                        <input
                          type="number"
                          min="0"
                          value={lessonForms[section._id]?.duration || ""}
                          onChange={(event) =>
                            handleLessonFormChange(
                              section._id,
                              "duration",
                              event.target.value,
                            )
                          }
                          placeholder="Duration in minutes"
                          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
                        />

                        <label className="flex items-center gap-2 text-sm text-zinc-700">
                          <input
                            type="checkbox"
                            checked={
                              lessonForms[section._id]?.isPreviewFree || false
                            }
                            onChange={(event) =>
                              handleLessonFormChange(
                                section._id,
                                "isPreviewFree",
                                event.target.checked,
                              )
                            }
                          />
                          Free preview lesson
                        </label>

                        <button
                          type="button"
                          onClick={() => handleAddLesson(section._id)}
                          className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white"
                        >
                          Add Lesson
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-center">
                  <p className="text-sm text-zinc-600">
                    No curriculum sections yet. Add your first section above.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-950">
              Course Status
            </h2>

            <div className="mt-4">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  course?.status === "published"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {course?.status}
              </span>
            </div>

            <button
              onClick={handleToggleStatus}
              disabled={isStatusUpdating}
              className="mt-5 inline-flex w-full justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800"
            >
              {isStatusUpdating
                ? "Updating..."
                : course?.status === "published"
                  ? "Move to Draft"
                  : "Publish Course"}
            </button>
          </div>

          <div className="rounded-lg border border-red-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-red-700">Danger Zone</h2>

            <p className="mt-3 text-sm text-zinc-600">
              Permanently delete this course and all associated data.
            </p>

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="mt-5 inline-flex w-full justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white"
            >
              {isDeleting ? "Deleting..." : "Delete Course"}
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default EditCoursePage;
