import { useEffect, useRef, useState } from "react";
import {
  Bell,
  BookOpen,
  LayoutDashboard,
  LogOut,
  Search,
  User,
} from "lucide-react";

import { NavLink, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../services/notificationService";

import { getRoleRedirectPath } from "../utils/getRoleRedirectPath";

const navLinks = [
  {
    label: "Home",
    to: "/",
  },
  {
    label: "Courses",
    to: "/courses",
  },
];

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const dropdownRef = useRef(null);

  const { isAuthenticated, logout, user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [notificationOpen, setNotificationOpen] = useState(false);

  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  useEffect(() => {
    if (!isAuthenticated) return;

    loadNotifications();
  }, [isAuthenticated]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    setSearchQuery("");
  }, [location.pathname, location.search]);

  const loadNotifications = async () => {
    try {
      setIsLoadingNotifications(true);

      const data = await getMyNotifications({
        limit: 10,
      });

      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      await markNotificationAsRead(notification._id);

      setNotifications((current) =>
        current.map((item) =>
          item._id === notification._id
            ? {
                ...item,
                read: true,
              }
            : item,
        ),
      );

      setNotificationOpen(false);

      if (notification.actionUrl) {
        navigate(notification.actionUrl);
      }
    } catch (error) {
      console.error("Failed to open notification", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read: true,
        })),
      );
    } catch (error) {
      console.error("Failed to mark all notifications as read", error);
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query) {
      navigate("/courses");
      return;
    }

    navigate(`/courses?search=${encodeURIComponent(query)}`);
  };

  const getLinkClass = ({ isActive }) =>
    [
      "rounded-md px-3 py-2 text-sm font-medium transition",
      isActive
        ? "bg-emerald-100 text-emerald-800"
        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950",
    ].join(" ");

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex items-center gap-2">
          <div className="rounded-xl bg-emerald-600 p-2 text-white">
            <BookOpen size={18} />
          </div>

          <span className="text-lg font-bold text-zinc-950">SkillSphere</span>
        </NavLink>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={getLinkClass}>
              {link.label}
            </NavLink>
          ))}

          <form
            onSubmit={handleSearchSubmit}
            className="mx-4 hidden flex-1 md:block"
          >
            <div className="relative mx-auto max-w-md">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search courses or instructors..."
                className="w-full rounded-full border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </form>

          {isAuthenticated ? (
            <>
              {/* Dashboard */}

              <NavLink
                to={getRoleRedirectPath(user?.role)}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-emerald-100 text-emerald-800"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950",
                  ].join(" ")
                }
              >
                <LayoutDashboard size={16} />
                Dashboard
              </NavLink>

              {/* Profile */}

              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  [
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-emerald-100 text-emerald-800"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950",
                  ].join(" ")
                }
              >
                <User size={16} />

                <span className="max-w-24 truncate">{user?.name}</span>
              </NavLink>

              {/* Notifications */}

              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className="relative rounded-md p-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950"
                >
                  <Bell size={20} />

                  {unreadCount > 0 ? (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  ) : null}
                </button>

                {notificationOpen ? (
                  <div className="absolute right-0 mt-3 w-96 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl">
                    <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-950">
                          Notifications
                        </h3>

                        <p className="text-xs text-zinc-500">
                          Latest platform updates
                        </p>
                      </div>

                      {notifications.length > 0 ? (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                        >
                          Mark all read
                        </button>
                      ) : null}
                    </div>

                    <div className="max-h-[420px] overflow-y-auto">
                      {isLoadingNotifications ? (
                        <div className="space-y-3 p-4">
                          {[1, 2, 3].map((item) => (
                            <div
                              key={item}
                              className="animate-pulse rounded-xl border border-zinc-200 p-3"
                            >
                              <div className="h-4 w-40 rounded bg-zinc-200" />

                              <div className="mt-2 h-3 w-full rounded bg-zinc-100" />
                            </div>
                          ))}
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <Bell size={34} className="mx-auto text-zinc-300" />

                          <p className="mt-3 text-sm text-zinc-500">
                            No notifications yet
                          </p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <button
                            key={notification._id}
                            type="button"
                            onClick={() =>
                              handleNotificationClick(notification)
                            }
                            className={`w-full border-b border-zinc-100 px-4 py-4 text-left transition hover:bg-zinc-50 ${
                              notification.read
                                ? "bg-white"
                                : "bg-emerald-50/60"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-medium text-zinc-900">
                                  {notification.title}
                                </p>

                                <p className="mt-1 text-xs leading-5 text-zinc-600">
                                  {notification.message}
                                </p>
                              </div>

                              {!notification.read ? (
                                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                              ) : null}
                            </div>

                            <p className="mt-2 text-[11px] text-zinc-400">
                              {new Date(
                                notification.createdAt,
                              ).toLocaleString()}
                            </p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Logout */}

              <button
                type="button"
                onClick={() => {
                  logout();

                  navigate("/login", {
                    replace: true,
                  });
                }}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-red-50 hover:text-red-700"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={getLinkClass}>
                Login
              </NavLink>

              <NavLink
                to="/register"
                className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                Register
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
