import { useCallback, useMemo, useState } from "react";
import AuthContext from "./AuthContextBase";
import {
  clearAuthSession,
  getStoredToken,
  getStoredUser,
  login as loginRequest,
  logoutRequest,
  setAuthSession,
} from "../services/authService";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(() => getStoredUser());

  const login = useCallback(async (credentials) => {
    const data = await loginRequest(credentials);

    if (!data.accessToken || !data.user) {
      throw new Error("Invalid login response from server");
    }

    setAuthSession({ token: data.accessToken, user: data.user });
    setToken(data.accessToken);
    setUser(data.user);

    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      clearAuthSession();
      setToken(null);
      setUser(null);
    }
  }, []);

  const updateUser = useCallback(
    (updatedUser) => {
      const nextUser = {
        ...user,
        ...updatedUser,
      };

      setAuthSession({ token, user: nextUser });
      setUser(nextUser);
    },
    [token, user],
  );

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(token && user),
      login,
      logout,
      updateUser,
      token,
      user,
    }),
    [login, logout, updateUser, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
