// Centralized route registry for the app
// Pages → PascalCase per project rules; routes defined here

export type AppRoute = {
  path: string; // URL path
  name: string; // Human-friendly label
  showInNavbar?: boolean; // Whether to display in navbar
};

// Initial routes; extend as new pages are added
export const APP_ROUTES: AppRoute[] = [
  { path: '/', name: 'Home', showInNavbar: true },
  { path: '/Search', name: 'Search', showInNavbar: true },
  { path: '/Search/Results', name: 'Results', showInNavbar: false },
  { path: '/Profile', name: 'Profile', showInNavbar: true },
  { path: '/Admin', name: 'Admin', showInNavbar: true },
  { path: '/History', name: 'History', showInNavbar: true },
  { path: '/Pricing', name: 'Pricing', showInNavbar: true },
  { path: '/Auth/Login', name: 'Login', showInNavbar: false },
  { path: '/Auth/Signup', name: 'Signup', showInNavbar: false },
];

// Utility to get route by path (helps avoid undefined lookups)
export function getRouteByPath(path: string): AppRoute | undefined {
  return APP_ROUTES.find((route) => route.path === path);
}

// Utility to list visible routes for navbar
export function getNavbarRoutes(): AppRoute[] {
  return APP_ROUTES.filter((route) => route.showInNavbar);
}

export default APP_ROUTES;


