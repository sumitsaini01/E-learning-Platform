const filterSections = [
  {
    title: "Level",
    key: "level",
    options: [
      { label: "All Levels", value: "" },
      { label: "Beginner", value: "beginner" },
      { label: "Intermediate", value: "intermediate" },
      { label: "Advanced", value: "advanced" },
    ],
  },
  {
    title: "Price",
    key: "priceType",
    options: [
      { label: "All Prices", value: "" },
      { label: "Free", value: "free" },
      { label: "Paid", value: "paid" },
    ],
  },
  {
    title: "Rating",
    key: "minRating",
    options: [
      { label: "All Ratings", value: "" },
      { label: "4★ & above", value: "4" },
      { label: "3★ & above", value: "3" },
      { label: "2★ & above", value: "2" },
    ],
  },
];

function CourseFilters({
  categoryOptions = [],
  category,
  level,
  priceType,
  minRating,
  updateFilter,
  clearFilters,
  hasFilters,
}) {
  const values = { level, priceType, minRating };

  return (
    <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-24">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-950 dark:text-white">
          Filters
        </h2>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Clear All
          </button>
        )}
      </div>

      <FilterGroup title="Category">
        <RadioOption
          label="All Categories"
          checked={!category}
          onChange={() => updateFilter("category", "")}
        />

        {categoryOptions.map((item) => (
          <RadioOption
            key={item.value}
            label={item.label}
            checked={category === item.value}
            onChange={() => updateFilter("category", item.value)}
          />
        ))}
      </FilterGroup>

      {filterSections.map((section) => (
        <FilterGroup key={section.key} title={section.title}>
          {section.options.map((option) => (
            <RadioOption
              key={option.label}
              label={option.label}
              checked={values[section.key] === option.value}
              onChange={() => updateFilter(section.key, option.value)}
            />
          ))}
        </FilterGroup>
      ))}
    </aside>
  );
}

function FilterGroup({ title, children }) {
  return (
    <div className="border-b border-slate-100 py-5 last:border-b-0 dark:border-slate-800">
      <h3 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">
        {title}
      </h3>

      <div className="space-y-3">{children}</div>
    </div>
  );
}

function RadioOption({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-blue-600"
      />

      <span>{label}</span>
    </label>
  );
}

export default CourseFilters;
