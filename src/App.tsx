import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { NavHeader } from "@/components/NavHeader";
import Index from "@/pages/Index";
import Welcome from "@/pages/Welcome";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import ProtectedRoute from "@/components/ProtectedRoute";
import NewComplaint from "@/pages/NewComplaint";
import Complaints from "@/pages/Complaints";
import ComplaintDetail from "@/pages/ComplaintDetail";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from '@/contexts/LanguageContext';
import { VapiWidget } from '@/components/VapiWidget';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <NavHeader />
          <Routes>
            <Route path="/" element={<NewComplaint />} />
            <Route path="/home" element={<NewComplaint />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
            <Route path="/complaints/:id" element={<ProtectedRoute><ComplaintDetail /></ProtectedRoute>} />
          </Routes>
          <VapiWidget />
          <Toaster />
        </Router>
      </QueryClientProvider>
    </LanguageProvider>
  );
};

export default App;
