
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { HomeIcon, LogOutIcon, ArrowLeftIcon } from "lucide-react";

export const NavHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear any cached session data
      queryClient.clear();
      
      // Show success message
      toast({
        title: "Signed out successfully",
        duration: 2000,
      });
      
      // Navigate to home page
      navigate("/");
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast({
        title: "Error signing out",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  const showBackButton = location.pathname !== "/";

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="mr-2"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Button>
            )}
            <Link to="/">
              <Button variant="ghost" size="icon">
                <HomeIcon className="h-5 w-5" />
              </Button>
            </Link>
            {session && (
              <Link to="/complaints">
                <Button variant="ghost">Complaints</Button>
              </Link>
            )}
          </div>
          {session && (
            <Button variant="ghost" onClick={handleLogout}>
              <LogOutIcon className="h-5 w-5 mr-2" />
              Sign Out
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
