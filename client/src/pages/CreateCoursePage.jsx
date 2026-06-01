import { useState } from "react";
import { Link } from "react-router-dom";
import {
  createCourse,
  generateCourseDescription,
} from "../services/courseService";
import { courseCategories } from "../constants/coursecategories";
import { uploadThumbnail } from "../services/uploadService";

const initialFormState = {
  title: "",
  description: "",
  category: "",
  price: "",
  thumbnail: "",
  level: "beginner",
  status: "draft",
};

function CreateCoursePage() {
  const [formData, setFormData] = useState(initialFormState);
  const [createdCourse, setCreatedCourse] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleThumbnailUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    try {
      setThumbnailUploading(true);

      const data = await uploadThumbnail(file);

      setFormData((current) => ({
        ...current,
        thumbnail: data.url,
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Thumbnail upload failed");
    } finally {
      setThumbnailUploading(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.title.trim()) {
      setError("Please enter a course title first.");
      return;
    }

    try {
      setError("");
      setIsGeneratingDescription(true);

      const data = await generateCourseDescription({
        title: formData.title,
        category: formData.category,
        level: formData.level,
        targetAudience: "Students and beginners looking to learn this topic",
      });

      const outcomes = data.learningOutcomes?.length
        ? `\n\nWhat you will learn:\n${data.learningOutcomes
            .map((item) => `• ${item}`)
            .join("\n")}`
        : "";

      const skills = data.skills?.length
        ? `\n\nSkills covered:\n${data.skills.map((item) => `• ${item}`).join("\n")}`
        : "";

      setFormData((current) => ({
        ...current,
        description: `${data.description || ""}${outcomes}${skills}`.trim(),
      }));
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to generate course description.",
      );
    } finally {
      setIsGeneratingDescription(false);
    }
  };
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setCreatedCourse(null);
    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
      };

      const data = await createCourse(payload);

      setCreatedCourse(data.course);
      setFormData(initialFormState);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create course. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_340px]">
      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
            Instructor
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
            Create course
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
            Create a draft course or publish it immediately for students.
          </p>
        </div>

        {error ? (
          <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {createdCourse ? (
          <div className="mb-5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Course created successfully.{" "}
            <Link
              to={`/courses/${createdCourse._id || createdCourse.id}`}
              className="font-semibold underline underline-offset-2"
            >
              View course
            </Link>
          </div>
        ) : null}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-zinc-800"
            >
              Title
            </label>

            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              placeholder="Complete JavaScript Fundamentals"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-zinc-800"
              >
                Description
              </label>

              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={isGeneratingDescription}
                className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGeneratingDescription ? "Generating..." : "Generate with AI"}
              </button>
            </div>

            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-2 min-h-36 w-full resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              placeholder="Describe what students will learn in this course."
              required
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-zinc-800"
              >
                Category
              </label>

              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                required
              >
                <option value="">Select category</option>

                {courseCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-zinc-800"
              >
                Price
              </label>

              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="1"
                value={formData.price}
                onChange={handleChange}
                className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                placeholder="999"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="level"
              className="block text-sm font-medium text-zinc-800"
            >
              Course Level
            </label>

            <select
              id="level"
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              required
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="thumbnail"
              className="block text-sm font-medium text-zinc-800"
            >
              Course Thumbnail
            </label>

            <input
              id="thumbnail"
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
            />

            {thumbnailUploading ? (
              <p className="mt-2 text-sm text-emerald-700">
                Uploading thumbnail...
              </p>
            ) : null}

            {formData.thumbnail ? (
              <img
                src={formData.thumbnail}
                alt="Course Thumbnail"
                className="mt-4 h-44 w-full rounded-lg object-cover"
              />
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-800">
              Course Status
            </label>

            <div className="mt-3 flex gap-4">
              <label className="flex items-center gap-2 text-sm text-zinc-700">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={formData.status === "draft"}
                  onChange={handleChange}
                />
                Draft
              </label>

              <label className="flex items-center gap-2 text-sm text-zinc-700">
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={formData.status === "published"}
                  onChange={handleChange}
                />
                Publish
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex w-full justify-center rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-400 sm:w-auto"
          >
            {isLoading ? "Creating course..." : "Create Course"}
          </button>
        </form>
      </div>

      <aside className="h-fit rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">Course setup</h2>

        <div className="mt-4 space-y-3 text-sm text-zinc-600">
          <p className="rounded-md bg-stone-50 p-3">
            Use a clear title students can scan quickly.
          </p>

          <p className="rounded-md bg-stone-50 p-3">
            Draft courses stay hidden from students.
          </p>

          <p className="rounded-md bg-stone-50 p-3">
            Published courses appear in the public course catalog.
          </p>

          <p className="rounded-md bg-stone-50 p-3">
            Set price to 0 for a free course.
          </p>
        </div>
      </aside>
    </section>
  );
}

export default CreateCoursePage;
