import SectionHeading from "./SectionHeading";
import CategoryCard from "../UI/CategoryCard";

function TopCategories({ categories = [], isLoading = false }) {
  const visibleCategories = categories.slice(0, 6);

  return (
    <section className="bg-slate-50 pt-8 pb-6 dark:bg-slate-900/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Top Categories"
          title="Explore Skills By Category"
          description="Find courses by your career goal and start learning with a clear path."
        />

        {isLoading ? (
          <div className="mt-8 sm:mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-64 animate-pulse rounded-3xl bg-white dark:bg-slate-900"
              />
            ))}
          </div>
        ) : visibleCategories.length > 0 ? (
          <div className="mt-8 sm:mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleCategories.map((category) => (
              <CategoryCard
                key={category._id || category.id || category.name}
                category={category}
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 sm:mt-10 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
            <p className="text-slate-600 dark:text-slate-400">
              No categories available yet.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default TopCategories;
