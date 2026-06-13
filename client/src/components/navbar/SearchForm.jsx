import { Search } from "lucide-react";

function SearchForm({
  value,
  onChange,
  onSubmit,
  placeholder = "Search courses...",
  className = "",
}) {
  return (
    <form onSubmit={onSubmit} className={`w-full ${className}`}>
      <div className="relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="
            w-full
            rounded-full
            border
            border-slate-300
            bg-white
            py-2.5
            pl-11
            pr-4
            text-sm
            text-slate-800
            outline-none
            transition-all
            duration-200
            placeholder:text-slate-400
            focus:border-blue-500
            focus:ring-4
            focus:ring-blue-100
            dark:border-slate-700
            dark:bg-slate-900
            dark:text-slate-100
            dark:placeholder:text-slate-500
            dark:focus:border-blue-500
            dark:focus:ring-blue-950
          "
        />
      </div>
    </form>
  );
}

export default SearchForm;
