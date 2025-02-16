
import { Routes, Route } from "react-router-dom";
import Complaints from "@/pages/Complaints";
import Dashboard from "@/pages/Dashboard";
import Help from "@/pages/Help";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import NewComplaint from "@/pages/NewComplaint";
import ComplaintDetail from "@/pages/ComplaintDetail";
import Community from "@/pages/Community";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/complaints" element={<Complaints />} />
      <Route path="/complaints/new" element={<NewComplaint />} />
      <Route path="/complaints/:id" element={<ComplaintDetail />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/help" element={<Help />} />
      <Route path="/community" element={<Community />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
