
import { Button } from "@/components/ui/button";
import { MegaphoneIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: session, error: sessionError } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    },
    retry: false
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (sessionError) {
      console.error('Session error:', sessionError);
      toast({
        title: "Session expired",
        description: "Please sign in again",
        variant: "destructive",
      });
      navigate('/login');
    }
  }, [sessionError, navigate, toast]);

  if (session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-6">Welcome Back!</h1>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Wave Pattern Header */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-400 to-blue-300">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQ0MCIgaGVpZ2h0PSI0MDAiIHZpZXdCb3g9IjAgMCAxNDQwIDQwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAzMDBDMjAwIDIwMCA0MDAgNDAwIDcyMCAzMDBDMTA0MCAyMDAgMTI0MCAzMDAgMTQ0MCAyMDBWMEgwVjMwMFoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] bg-center bg-no-repeat bg-cover opacity-20"></div>
        <div className="container mx-auto px-4 pt-12 pb-24 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="mb-8 relative">
              <MegaphoneIcon className="w-20 h-20 text-white mx-auto transform -rotate-12 transition-transform hover:rotate-0 hover:scale-110" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Speak Up India
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Your voice matters. India's first unified public complaint platform.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 200L60 181.3C120 163 240 125 360 106.7C480 88 600 88 720 100C840 112 960 137 1080 143.3C1200 150 1320 137 1380 131.3L1440 125V200H1380C1320 200 1200 200 1080 200C960 200 840 200 720 200C600 200 480 200 360 200C240 200 120 200 60 200H0Z" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 -mt-20 pb-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MegaphoneIcon className="w-6 h-6 text-blue-600" />
                </div>
                Submit a Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Report issues, provide feedback, or share your concerns with relevant authorities.</p>
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                <Link to="/complaints/new">Report Without Login</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MegaphoneIcon className="w-6 h-6 text-green-600" />
                </div>
                Join Our Community
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Create an account to track your reports and join our community of active citizens.</p>
              <Button asChild className="w-full">
                <Link to="/signup">Register / Sign Up</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <footer className="container mx-auto px-4 py-8 text-center text-gray-600">
        <p>© 2024 Speak Up India. Together for a better tomorrow.</p>
      </footer>
    </div>
  );
};

export default Index;
