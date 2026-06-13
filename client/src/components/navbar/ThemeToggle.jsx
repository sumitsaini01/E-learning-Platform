import { Moon, Sun } from "lucide-react";

function ThemeToggle({ isDarkMode, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Toggle theme"
      className="
        rounded-full
        p-2.5
        text-slate-600
        transition-all
        duration-200
        hover:bg-slate-100
        hover:text-blue-700
        dark:text-slate-300
        dark:hover:bg-slate-800
        dark:hover:text-blue-300
      "
    >
      {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}

export default ThemeToggle;
