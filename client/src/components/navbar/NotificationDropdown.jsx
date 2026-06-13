import { Bell } from "lucide-react";

function NotificationDropdown({
  dropdownRef,
  isOpen,
  setIsOpen,
  notifications,
  unreadCount,
  isLoading,
  onNotificationClick,
  onMarkAllRead,
}) {
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="
          relative
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
        <Bell size={20} />

        {unreadCount > 0 && (
          <span
            className="
              absolute
              -right-1
              -top-1
              flex
              h-5
              min-w-5
              items-center
              justify-center
              rounded-full
              bg-red-500
              px-1
              text-[10px]
              font-bold
              text-white
            "
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="
            absolute
            right-0
            mt-3
            w-96
            overflow-hidden
            rounded-3xl
            border
            border-slate-200
            bg-white
            shadow-2xl
            dark:border-slate-800
            dark:bg-slate-900
          "
        >
          {/* Header */}

          <div
            className="
              flex
              items-center
              justify-between
              border-b
              border-slate-100
              px-5
              py-4
              dark:border-slate-800
            "
          >
            <div>
              <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                Notifications
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest platform updates
              </p>
            </div>

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="
                  text-xs
                  font-semibold
                  text-blue-600
                  transition
                  hover:text-blue-700
                  dark:text-blue-400
                "
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Content */}

          <div className="max-h-[420px] overflow-y-auto">
            {isLoading ? (
              <LoadingState />
            ) : notifications.length === 0 ? (
              <EmptyState />
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  onClick={() => onNotificationClick(notification)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-3 p-4">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="
            animate-pulse
            rounded-2xl
            border
            border-slate-200
            p-4
            dark:border-slate-800
          "
        >
          <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-700" />

          <div className="mt-2 h-3 w-full rounded bg-slate-100 dark:bg-slate-800" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="p-8 text-center">
      <Bell size={34} className="mx-auto text-slate-300 dark:text-slate-600" />

      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
        No notifications yet
      </p>
    </div>
  );
}

function NotificationItem({ notification, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full
        border-b
        border-slate-100
        px-5
        py-4
        text-left
        transition
        hover:bg-slate-50
        dark:border-slate-800
        dark:hover:bg-slate-800/70
        ${
          notification.read
            ? "bg-white dark:bg-slate-900"
            : "bg-blue-50/80 dark:bg-blue-950/30"
        }
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {notification.title}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
            {notification.message}
          </p>
        </div>

        {!notification.read && (
          <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
        )}
      </div>

      <p className="mt-2 text-[11px] text-slate-400">
        {new Date(notification.createdAt).toLocaleString()}
      </p>
    </button>
  );
}

export default NotificationDropdown;
