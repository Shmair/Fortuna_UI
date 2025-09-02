// Utility to create page URLs for navigation
export function createPageUrl(page) {
  switch (page) {
    case "Wizard":
      return "/wizard";
    case "Dashboard":
      return "/dashboard";
    case "Profile":
      return "/profile";
    default:
      return "/";
  }
}
