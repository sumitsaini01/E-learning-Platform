import { Navigate, Route, Routes } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import MainLayout from "../layouts/MainLayout";

import AboutPage from "../pages/AboutPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import CareerRoadmapPage from "../pages/CareerRoadmapPage";
import CertificateVerificationPage from "../pages/CertificateVerificationPage";
import ContactPage from "../pages/ContactPage";
import CourseDetailsPage from "../pages/CourseDetailsPage";
import CoursesPage from "../pages/CoursesPage";
import CreateCoursePage from "../pages/CreateCoursePage";
import EditCoursePage from "../pages/EditCoursePage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import HomePage from "../pages/HomePage";
import InstructorAnalyticsPage from "../pages/InstructorAnalyticsPage";
import InstructorCoursesPage from "../pages/InstructorCoursesPage";
import InstructorDashboard from "../pages/InstructorDashboard";
import InstructorQuizzesPage from "../pages/InstructorQuizzesPage";
import InstructorSettingsPage from "../pages/InstructorSettingsPage";
import InstructorStudentsPage from "../pages/InstructorStudentsPage";
import InterviewPrepPage from "../pages/InterviewPrepPage";
import JobReadinessPage from "../pages/JobReadinessPage";
import LearningPathPage from "../pages/LearningPathPage";
import LoginPage from "../pages/LoginPage";
import MockInterviewPage from "../pages/MockInterviewPage";
import MyCertificatesPage from "../pages/MyCertificatesPage";
import MyCoursesPage from "../pages/MyCoursesPage";
import ProfilePage from "../pages/ProfilePage";
import QuizAttemptPage from "../pages/QuizAttemptPage";
import QuizzesPage from "../pages/QuizzesPage";
import RegisterPage from "../pages/RegisterPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import ResumeAnalyzerPage from "../pages/ResumeAnalyzerPage";
import SettingsPage from "../pages/SettingsPage";
import SkillTrackingPage from "../pages/SkillTrackingPage";
import StudentDashboard from "../pages/StudentDashboard";
import StudyPlannerPage from "../pages/StudyPlannerPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import VerifyEmailPage from "../pages/VerifyEmailPage";
import AIFeaturesPage from "../pages/AIFeaturesPage";

import AdminAnalyticsPage from "../components/admin/AdminAnalyticsPage";
import AdminCoursesPage from "../components/admin/AdminCoursesPage";
import AdminMonitoringPage from "../components/admin/AdminMonitoringPage";
import AdminQuizzesPage from "../components/admin/AdminQuizzesPage";
import AdminRevenuePage from "../components/admin/AdminRevenuePage";
import AdminSettingsPage from "../components/admin/AdminSettingsPage";
import AdminUsersPage from "../components/admin/AdminUsersPage";

import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />

        <Route path="courses" element={<CoursesPage />} />
        <Route path="courses/:id" element={<CourseDetailsPage />} />

        <Route path="ai-features" element={<AIFeaturesPage />} />
        <Route path="career-roadmap" element={<CareerRoadmapPage />} />
        <Route path="learning-path" element={<LearningPathPage />} />
        <Route path="skills" element={<SkillTrackingPage />} />
        <Route path="study-planner" element={<StudyPlannerPage />} />
        <Route path="interview-prep" element={<InterviewPrepPage />} />
        <Route path="resume-analyzer" element={<ResumeAnalyzerPage />} />
        <Route path="mock-interview" element={<MockInterviewPage />} />
        <Route path="job-readiness" element={<JobReadinessPage />} />

        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="verify-email" element={<VerifyEmailPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password/:token" element={<ResetPasswordPage />} />

        <Route
          path="certificates/verify/:certificateId"
          element={<CertificateVerificationPage />}
        />

        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="unauthorized" element={<UnauthorizedPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="dashboard/student" element={<StudentDashboard />} />
          <Route path="my-courses" element={<MyCoursesPage />} />
          <Route path="my-certificates" element={<MyCertificatesPage />} />
          <Route path="quizzes" element={<QuizzesPage />} />
          <Route path="quizzes/:quizId/attempt" element={<QuizAttemptPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["instructor"]} />}>
        <Route element={<DashboardLayout />}>
          <Route
            path="dashboard/instructor"
            element={<InstructorDashboard />}
          />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="dashboard/admin" element={<AdminDashboardPage />} />
          <Route path="admin/users" element={<AdminUsersPage />} />
          <Route path="admin/courses" element={<AdminCoursesPage />} />
          <Route path="admin/revenue" element={<AdminRevenuePage />} />
          <Route path="admin/monitoring" element={<AdminMonitoringPage />} />
          <Route path="admin/analytics" element={<AdminAnalyticsPage />} />
          <Route path="admin/quizzes" element={<AdminQuizzesPage />} />
          <Route path="admin/settings" element={<AdminSettingsPage />} />
        </Route>
      </Route>

      <Route
        element={<ProtectedRoute allowedRoles={["instructor", "admin"]} />}
      >
        <Route element={<DashboardLayout />}>
          <Route
            path="instructor/courses"
            element={<InstructorCoursesPage />}
          />

          <Route
            path="instructor/settings"
            element={<InstructorSettingsPage />}
          />

          <Route
            path="instructor/analytics"
            element={<InstructorAnalyticsPage />}
          />

          <Route
            path="instructor/create-course"
            element={<CreateCoursePage />}
          />

          <Route
            path="instructor/students"
            element={<InstructorStudentsPage />}
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
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
