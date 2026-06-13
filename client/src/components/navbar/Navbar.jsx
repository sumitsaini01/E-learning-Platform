import { useEffect, useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../context/ThemeContext";

import BrandLogo from "./BrandLogo";
import NavLinks from "./NavLinks";
import SearchForm from "./SearchForm";
import ThemeToggle from "./ThemeToggle";
import AuthButtons from "./AuthButtons";
import UserMenu from "./UserMenu";
import MobileMenu from "./MobileMenu";
import NotificationsMenu from "../notifications/NotificationsMenu";

const navLinks = [
  { label: "Home", to: "/" },
  {
    label: "Browse",
    items: [
      { label: "All Courses", to: "/courses" },
      { label: "Development", to: "/courses?category=development" },
      { label: "Design", to: "/courses?category=design" },
      { label: "Business", to: "/courses?category=business" },
      { label: "Marketing", to: "/courses?category=marketing" },
      { label: "Data Science", to: "/courses?category=data-science" },
    ],
  },
  {
    label: "AI Features",
    items: [
      { label: "AI Features Hub", to: "/ai-features" },
      { label: "Career Roadmap", to: "/career-roadmap" },
      { label: "Learning Path", to: "/learning-path" },
      { label: "Skill Tracking", to: "/skills" },
      { label: "Study Planner", to: "/study-planner" },
      { label: "Interview Prep", to: "/interview-prep" },
      { label: "Resume Analyzer", to: "/resume-analyzer" },
      { label: "Mock Interview", to: "/mock-interview" },
      { label: "Job Readiness Score", to: "/job-readiness" },
    ],
  },
  {
    label: "Resources",
    items: [
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
    ],
  },
];

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, logout, user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setSearchQuery("");
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query) {
      navigate("/courses");
      return;
    }

    navigate(`/courses?search=${encodeURIComponent(query)}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl transition-colors dark:border-slate-800 dark:bg-slate-950/90">
      <nav className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <BrandLogo />

        <NavLinks links={navLinks} className="ml-10 hidden lg:flex" />

        <div className="hidden flex-1 justify-center px-6 md:flex">
          <SearchForm
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSearchSubmit}
          />
        </div>

        <div className="hidden items-center gap-3 xl:gap-4 lg:flex">
          <ThemeToggle isDarkMode={isDarkMode} onClick={toggleTheme} />

          {isAuthenticated ? (
            <>
              <UserMenu user={user} />
              <NotificationsMenu />

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-red-50 hover:text-red-700 dark:text-slate-300 dark:hover:bg-red-950/40 dark:hover:text-red-300"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <AuthButtons />
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((current) => !current)}
          className="rounded-full p-2 text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {mobileOpen && (
        <MobileMenu
          links={navLinks}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          isAuthenticated={isAuthenticated}
          user={user}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onLogout={handleLogout}
        />
      )}
    </header>
  );
}

export default Navbar;
