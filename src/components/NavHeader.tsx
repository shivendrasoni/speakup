
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { HomeIcon, LogOutIcon } from "lucide-react";

export const NavHeader = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
      return;
    }
    navigate("/");
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
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
