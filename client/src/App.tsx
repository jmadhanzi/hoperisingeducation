/* Hope Rising Education — App Router
 * Design: "Warm Authority" — Modern Corporate Nonprofit
 * Routes: Home, About, Programs, Impact, Donate, Get Involved, Team, Contact
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import About from "./pages/About";
import Programs from "./pages/Programs";
import Impact from "./pages/Impact";
import Donate from "./pages/Donate";
import GetInvolved from "./pages/GetInvolved";
import Team from "./pages/Team";
import Contact from "./pages/Contact";
import AdminDashboard from "./pages/AdminDashboard";
import MyDonations from "./pages/MyDonations";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
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
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
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
