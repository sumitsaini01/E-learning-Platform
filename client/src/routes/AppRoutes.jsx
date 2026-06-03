import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import CourseDetailsPage from "../pages/CourseDetailsPage";
import CoursesPage from "../pages/CoursesPage";
import CreateCoursePage from "../pages/CreateCoursePage";
import EditCoursePage from "../pages/EditCoursePage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import HomePage from "../pages/HomePage";
import InstructorDashboard from "../pages/InstructorDashboard";
import InstructorQuizzesPage from "../pages/InstructorQuizzesPage";
import LoginPage from "../pages/LoginPage";
import ProfilePage from "../pages/ProfilePage";
import QuizAttemptPage from "../pages/QuizAttemptPage";
import RegisterPage from "../pages/RegisterPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import StudentDashboard from "../pages/StudentDashboard";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import ProtectedRoute from "./ProtectedRoute";
import CertificateVerificationPage from "../pages/CertificateVerificationPage";
import MyCertificatesPage from "../pages/MyCertificatesPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import VerifyEmailPage from "../pages/VerifyEmailPage";
import CareerRoadmapPage from "../pages/CareerRoadmapPage";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="courses/:id" element={<CourseDetailsPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="verify-email" element={<VerifyEmailPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password/:token" element={<ResetPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          <Route path="dashboard/student" element={<StudentDashboard />} />

          <Route path="my-certificates" element={<MyCertificatesPage />} />

          <Route path="quizzes/:quizId/attempt" element={<QuizAttemptPage />} />

          <Route path="career-roadmap" element={<CareerRoadmapPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="dashboard/admin" element={<AdminDashboardPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["instructor"]} />}>
          <Route
            path="dashboard/instructor"
            element={<InstructorDashboard />}
          />
        </Route>

        <Route
          element={<ProtectedRoute allowedRoles={["instructor", "admin"]} />}
        >
          <Route
            path="instructor/create-course"
            element={<CreateCoursePage />}
          />

          <Route
            path="instructor/courses/:courseId/edit"
            element={<EditCoursePage />}
          />

          <Route
            path="instructor/quizzes"
            element={<InstructorQuizzesPage />}
          />
        </Route>

        <Route
          path="certificates/verify/:certificateId"
          element={<CertificateVerificationPage />}
        />

        <Route path="unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
