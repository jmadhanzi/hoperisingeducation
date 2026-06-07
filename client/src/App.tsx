/* Hope Rising Education — App Router
 * Design: "Warm Authority" — Modern Corporate Nonprofit
 * Routes: Home, About, Programs, Impact, Donate, Get Involved, Team, Contact
 * Performance: lazy-loaded routes so the initial bundle stays small
 */
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Home is eagerly loaded — it's what every visitor sees first
import Home from "./pages/Home";

// All other pages are lazy-loaded to reduce initial JS bundle size
const About        = lazy(() => import("./pages/About"));
const Programs     = lazy(() => import("./pages/Programs"));
const Impact       = lazy(() => import("./pages/Impact"));
const Donate       = lazy(() => import("./pages/Donate"));
const GetInvolved  = lazy(() => import("./pages/GetInvolved"));
const Team         = lazy(() => import("./pages/Team"));
const Contact      = lazy(() => import("./pages/Contact"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const MyDonations  = lazy(() => import("./pages/MyDonations"));
const Privacy      = lazy(() => import("./pages/Privacy"));
const Terms        = lazy(() => import("./pages/Terms"));

// Minimal page-level loading skeleton — maintains layout while chunks download
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]" role="status" aria-label="Loading page">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-[#EE701E]/30 border-t-[#EE701E] animate-spin" />
        <p className="text-[#584237] text-sm" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
          Loading…
        </p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/programs" component={Programs} />
        <Route path="/impact" component={Impact} />
        <Route path="/donate" component={Donate} />
        <Route path="/get-involved" component={GetInvolved} />
        <Route path="/team" component={Team} />
        <Route path="/contact" component={Contact} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/my-donations" component={MyDonations} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
