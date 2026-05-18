import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import HomePage from "../pages/HomePage";
import InstructorDashboard from "../pages/InstructorDashboard";
import LoginPage from "../pages/LoginPage";
import ProfilePage from "../pages/ProfilePage";
import RegisterPage from "../pages/RegisterPage";
import StudentDashboard from "../pages/StudentDashboard";
import ProtectedRoute from "./ProtectedRoute";
import UnauthorizedPage from "../pages/UnauthorizedPage";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          <Route path="dashboard/student" element={<StudentDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["instructor"]} />}>
          <Route path="dashboard/instructor" element={<InstructorDashboard />} />
        </Route>

        <Route path="unauthorized" element={<UnauthorizedPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
