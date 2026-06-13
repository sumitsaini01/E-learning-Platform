import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../services/notificationService";

import NotificationDropdown from "../navbar/NotificationDropdown";

function NotificationsMenu() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  useEffect(() => {
    loadNotifications();
  }, []);

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

  const loadNotifications = async () => {
    try {
      setIsLoadingNotifications(true);

      const data = await getMyNotifications({ limit: 10 });

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
          item._id === notification._id ? { ...item, read: true } : item,
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

  return (
    <NotificationDropdown
      dropdownRef={dropdownRef}
      isOpen={notificationOpen}
      setIsOpen={setNotificationOpen}
      notifications={notifications}
      unreadCount={unreadCount}
      isLoading={isLoadingNotifications}
      onNotificationClick={handleNotificationClick}
      onMarkAllRead={handleMarkAllRead}
    />
  );
}

export default NotificationsMenu;
