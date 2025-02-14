
import { Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ProtectedRoute from "@/components/ProtectedRoute";
import Complaints from "@/pages/Complaints";
import Dashboard from "@/pages/Dashboard";
import Community from "@/pages/Community";
import NewComplaint from "@/pages/NewComplaint";
import ComplaintDetail from "@/pages/ComplaintDetail";
import Help from "@/pages/Help";

const Routes = () => {
  return (
    <RouterRoutes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/complaints"
        element={
          <ProtectedRoute>
            <Complaints />
          </ProtectedRoute>
        }
      />
      <Route
        path="/complaints/:id"
        element={
          <ProtectedRoute>
            <ComplaintDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/new-complaint"
        element={
          <ProtectedRoute>
            <NewComplaint />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/community"
        element={
          <ProtectedRoute>
            <Community />
          </ProtectedRoute>
        }
      />
      <Route path="/help" element={<Help />} />
    </RouterRoutes>
  );
};

export default Routes;
