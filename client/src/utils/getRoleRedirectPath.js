export function getRoleRedirectPath(role) {
  const dashboardByRole = {
    student: "/dashboard/student",
    instructor: "/dashboard/instructor",
    admin: "/dashboard/admin",
  };

  return dashboardByRole[role] || "/profile";
}
