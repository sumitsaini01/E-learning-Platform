import { useState } from "react";
import { Link } from "react-router-dom";
import { createCourse } from "../services/courseService";
import { courseCategories } from "../constants/coursecategories";

const initialFormState = {
  title: "",
  description: "",
  category: "",
  price: "",
  thumbnail: "",
  status: "draft",
};

function CreateCoursePage() {
  const [formData, setFormData] = useState(initialFormState);
  const [createdCourse, setCreatedCourse] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
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
            <label
              htmlFor="description"
              className="block text-sm font-medium text-zinc-800"
            >
              Description
            </label>

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
              htmlFor="thumbnail"
              className="block text-sm font-medium text-zinc-800"
            >
              Thumbnail URL
            </label>

            <input
              id="thumbnail"
              name="thumbnail"
              type="text"
              value={formData.thumbnail}
              onChange={handleChange}
              className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              placeholder="https://example.com/course-image.jpg"
            />
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
