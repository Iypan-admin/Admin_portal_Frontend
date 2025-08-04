export const ROLE_CONFIG = {
  admin: {
    allowedRoles: ["manager", "financial", "academic", "state", "center", "teacher", "cardadmin"]
  },
  manager: {
    allowedRoles: ["state", "center"]
  },
  academic: {
    allowedRoles: ["teacher"]
  }
  // Add other roles as needed
};