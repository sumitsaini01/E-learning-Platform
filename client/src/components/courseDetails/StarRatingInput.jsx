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
              : "text-zinc-300 hover:text-amber-400 dark:text-slate-700"
          } disabled:cursor-not-allowed`}
          aria-label={`${star} star`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default StarRatingInput;
