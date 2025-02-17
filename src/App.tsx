import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { NavHeader } from "@/components/NavHeader";
import Index from "@/pages/Index";
import Welcome from "@/pages/Welcome";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import ProtectedRoute from "@/components/ProtectedRoute";
import NewComplaint from "@/pages/complaints/NewComplaint";
import Complaints from "@/pages/Complaints";

const App = () => {
  return (
    <Router>
      <NavHeader />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/complaints/new" element={<NewComplaint />} />
        <Route path="/complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
      </Routes>
      <Toaster />
    </Router>
  );
};

export default App;
