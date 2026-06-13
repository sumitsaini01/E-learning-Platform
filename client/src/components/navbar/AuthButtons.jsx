import { NavLink } from "react-router-dom";

function AuthButtons() {
  return (
    <div className="flex items-center gap-2">
      <NavLink
        to="/login"
        className="
          rounded-full
          px-4
          py-2
          text-sm
          font-semibold
          text-slate-700
          transition-all
          duration-200
          hover:bg-slate-100
          hover:text-blue-700
          dark:text-slate-300
          dark:hover:bg-slate-800
          dark:hover:text-blue-300
        "
      >
        Login
      </NavLink>

      <NavLink
        to="/register"
        className="
          rounded-full
          bg-blue-600
          px-5
          py-2.5
          text-sm
          font-semibold
          text-white
          shadow-lg
          shadow-blue-600/20
          transition-all
          duration-200
          hover:bg-blue-700
          hover:shadow-xl
          hover:shadow-blue-600/30
        "
      >
        Register
      </NavLink>
    </div>
  );
}

export default AuthButtons;
