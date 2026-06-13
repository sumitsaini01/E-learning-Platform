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
        ? `\n\nSkills covered:\n${data.skills
            .map((item) => `• ${item}`)
            .join("\n")}`
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
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            Instructor
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
            Create course
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
            Create a draft course or publish it immediately for students.
          </p>
        </div>

        {error ? (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        ) : null}

        {createdCourse ? (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
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
          <FormInput
            id="title"
            name="title"
            label="Title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Complete JavaScript Fundamentals"
            required
          />

          <div>
            <div className="flex items-center justify-between gap-3">
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-slate-800 dark:text-slate-200"
              >
                Description
              </label>

              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={isGeneratingDescription}
                className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950"
              >
                {isGeneratingDescription ? "Generating..." : "Generate with AI"}
              </button>
            </div>

            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-2 min-h-36 w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-blue-950"
              placeholder="Describe what students will learn in this course."
              required
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-semibold text-slate-800 dark:text-slate-200"
              >
                Category
              </label>

              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
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

            <FormInput
              id="price"
              name="price"
              type="number"
              min="0"
              step="1"
              label="Price"
              value={formData.price}
              onChange={handleChange}
              placeholder="999"
              required
            />
          </div>

          <div>
            <label
              htmlFor="level"
              className="block text-sm font-semibold text-slate-800 dark:text-slate-200"
            >
              Course Level
            </label>

            <select
              id="level"
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
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
              className="block text-sm font-semibold text-slate-800 dark:text-slate-200"
            >
              Course Thumbnail
            </label>

            <input
              id="thumbnail"
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
            />

            {thumbnailUploading ? (
              <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">
                Uploading thumbnail...
              </p>
            ) : null}

            {formData.thumbnail ? (
              <img
                src={formData.thumbnail}
                alt="Course Thumbnail"
                className="mt-4 h-44 w-full rounded-2xl object-cover"
              />
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
              Course Status
            </label>

            <div className="mt-3 flex flex-wrap gap-4">
              <RadioOption
                name="status"
                value="draft"
                checked={formData.status === "draft"}
                onChange={handleChange}
                label="Draft"
              />

              <RadioOption
                name="status"
                value="published"
                checked={formData.status === "published"}
                onChange={handleChange}
                label="Publish"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex w-full justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 sm:w-auto"
          >
            {isLoading ? "Creating course..." : "Create Course"}
          </button>
        </form>
      </div>

      <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-950 dark:text-white">
          Course setup
        </h2>

        <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
          {[
            "Use a clear title students can scan quickly.",
            "Draft courses stay hidden from students.",
            "Published courses appear in the public course catalog.",
            "Set price to 0 for a free course.",
          ].map((tip) => (
            <p
              key={tip}
              className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950"
            >
              {tip}
            </p>
          ))}
        </div>
      </aside>
    </section>
  );
}

function FormInput({
  id,
  name,
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  min,
  step,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-slate-800 dark:text-slate-200"
      >
        {label}
      </label>

      <input
        id={id}
        name={name}
        type={type}
        min={min}
        step={step}
        value={value}
        onChange={onChange}
        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-blue-950"
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

function RadioOption({ name, value, checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
      />
      {label}
    </label>
  );
}

export default CreateCoursePage;
