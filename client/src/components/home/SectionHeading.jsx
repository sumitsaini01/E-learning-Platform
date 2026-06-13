function SectionHeading({ eyebrow, title, description, centered = true }) {
  return (
    <div className={`max-w-3xl ${centered ? "mx-auto text-center" : ""}`}>
      {eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          {eyebrow}
        </p>
      )}

      <h2 className="mt-3 text-3xl font-bold text-slate-950 dark:text-white sm:text-4xl">
        {title}
      </h2>

      {description && (
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionHeading;
