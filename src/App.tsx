// Build trigger: 2026-04-30 17:26
// Trigger build 2
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./components/ThemeProvider";
import { StoreProvider } from "./lib/store";
import { AppLayout } from "./components/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";
import Transactions from "./pages/Transactions";
import Analytics from "./pages/Analytics";
import Reminders from "./pages/Reminders";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <StoreProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/customers/:id" element={<CustomerDetail />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/reminders" element={<Reminders />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </StoreProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
