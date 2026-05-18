export function getRoleRedirectPath(role) {
  const dashboardByRole = {
    student: "/dashboard/student",
    instructor: "/dashboard/instructor",
  };

  return dashboardByRole[role] || "/profile";
}
