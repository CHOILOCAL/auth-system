// =============================================================================
// App root
// =============================================================================
// Provider order (outermost first):
//   ErrorBoundary → QueryClientProvider → ThemeProvider → AuthProvider →
//   TooltipProvider → Toaster + Router
// AuthProvider depends on the Supabase client only, so QueryClientProvider can
// safely wrap it from outside (queries declared inside hooks still pull session
// from the auth context).
// =============================================================================

import { lazy, Suspense } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ROUTES } from "./lib/routes";
import { queryClient } from "./lib/queryClient";

// ── Lazy pages (code splitting) ──────────────────────────────────────────────
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Security = lazy(() => import("./pages/Security"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const BoardListPage = lazy(() =>
  import("./features/board/pages/BoardListPage")
);
const BoardDetailPage = lazy(() =>
  import("./features/board/pages/BoardDetailPage")
);

const PageLoader = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <div className="relative w-10 h-10">
      <div className="absolute inset-0 rounded-full border-2 border-sky-100" />
      <div className="absolute inset-0 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
    </div>
  </div>
);

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* Public */}
        <Route path={ROUTES.HOME} component={Home} />
        <Route path={ROUTES.LOGIN} component={Login} />
        <Route path={ROUTES.REGISTER} component={Register} />
        <Route path={ROUTES.FORGOT_PASSWORD} component={ForgotPassword} />
        <Route path={ROUTES.RESET_PASSWORD} component={ResetPassword} />
        <Route path={ROUTES.AUTH_CALLBACK} component={AuthCallback} />

        {/* Protected (route guards live inside each page) */}
        <Route path={ROUTES.DASHBOARD} component={Dashboard} />
        <Route path={ROUTES.PROFILE} component={Profile} />
        <Route path={ROUTES.SECURITY} component={Security} />
        <Route path={ROUTES.SETTINGS} component={SettingsPage} />
        <Route path={ROUTES.BOARD} component={BoardListPage} />
        <Route path={ROUTES.BOARD_DETAIL} component={BoardDetailPage} />

        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light">
          <AuthProvider>
            <TooltipProvider>
              <Toaster position="top-right" richColors />
              <Router />
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
