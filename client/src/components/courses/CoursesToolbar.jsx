import { Search, X } from "lucide-react";

function CoursesToolbar({ search, sort, updateFilter }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full lg:max-w-2xl">
        <Search
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="search"
          value={search}
          onChange={(event) => updateFilter("search", event.target.value)}
          placeholder="Search courses..."
          className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-12 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-950"
        />

        {search && (
          <button
            type="button"
            onClick={() => updateFilter("search", "")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-500 dark:text-slate-400">
          Sort by:
        </span>

        <select
          value={sort}
          onChange={(event) => updateFilter("sort", event.target.value)}
          className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:ring-blue-950"
        >
          <option value="newest">Newest</option>
          <option value="highest-rated">Highest Rated</option>
          <option value="popular">Most Popular</option>
          <option value="price-low">Price Low to High</option>
          <option value="price-high">Price High to Low</option>
        </select>
      </div>
    </div>
  );
}

export default CoursesToolbar;
