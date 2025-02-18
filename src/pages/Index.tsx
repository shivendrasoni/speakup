import { Button } from "@/components/ui/button";
import { MegaphoneIcon, ChevronRight, Globe2, Users2, CheckCircle, Building2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: session, error: sessionError } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      try {
        // First try to get the current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          // If there's an error getting the session, clear it
          await supabase.auth.signOut();
          throw error;
        }
        
        if (!session) {
          return null;
        }
        
        return session;
      } catch (error) {
        console.error('Session error:', error);
        return null;
      }
    },
    retry: false,
    staleTime: 0 // Don't cache the session
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      if (event === 'SIGNED_IN' && session) {
        navigate('/');
      } else if (event === 'SIGNED_OUT') {
        // Clear any stored session data
        await supabase.auth.signOut();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (sessionError) {
      console.error('Session error:', sessionError);
      toast({
        title: "Session error",
        description: "Please sign in again",
        variant: "destructive",
      });
      // Clear any invalid session
      supabase.auth.signOut();
    }
  }, [sessionError, toast]);

  // Only redirect if we have a valid session
  if (session?.user) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/5 backdrop-blur-3xl">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>

        <div className="container mx-auto px-4 pt-20 pb-32 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-8 relative inline-block">
              <div className="absolute inset-0 bg-blue-200 rounded-full blur-2xl opacity-30 animate-pulse"></div>
              <MegaphoneIcon className="w-24 h-24 text-blue-600 mx-auto transform -rotate-12 transition-all duration-300 hover:rotate-0 hover:scale-110 relative z-10" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Speak Up <span className="text-blue-600">India</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              Your voice matters. Join India's first unified public complaint platform and be part of the change.
            </p>

            <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-16">
              <Button
                asChild
                className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 rounded-full group w-full md:w-auto"
              >
                <Link to="/signup">
                  Register / Sign Up
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="text-lg px-8 py-6 rounded-full border-2 hover:bg-blue-50 w-full md:w-auto"
              >
                <Link to="/complaints/new">Report Without Login</Link>
              </Button>
            </div>

            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <MegaphoneIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Voice Your Concerns</h3>
                <p className="text-gray-600">Submit complaints, feedback, or compliments easily and securely.</p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Globe2 className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Multi-language Support</h3>
                <p className="text-gray-600">Access the platform in your preferred language for better communication.</p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Users2 className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Community Support</h3>
                <p className="text-gray-600">Connect with others, share experiences, and drive positive change together.</p>
              </div>
            </div>

            {/* Statistics Section */}
            <div className="max-w-7xl mx-auto mt-24 mb-16">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Complaints Resolved Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-blue-600 opacity-75" />
                  </div>
                  <h3 className="text-4xl font-bold text-blue-600 text-center mb-2">25,000+</h3>
                  <p className="text-gray-600 text-center">Complaints Resolved</p>
                </div>

                {/* Active Users Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-center mb-4">
                    <Users2 className="w-8 h-8 text-blue-600 opacity-75" />
                  </div>
                  <h3 className="text-4xl font-bold text-blue-600 text-center mb-2">50,000+</h3>
                  <p className="text-gray-600 text-center">Active Users</p>
                </div>

                {/* Resolution Rate Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-center mb-4">
                    <ChevronRight className="w-8 h-8 text-blue-600 opacity-75" />
                  </div>
                  <h3 className="text-4xl font-bold text-blue-600 text-center mb-2">95%</h3>
                  <p className="text-gray-600 text-center">Resolution Rate</p>
                </div>

                {/* States Covered Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-center mb-4">
                    <Building2 className="w-8 h-8 text-blue-600 opacity-75" />
                  </div>
                  <h3 className="text-4xl font-bold text-blue-600 text-center mb-2">28</h3>
                  <p className="text-gray-600 text-center">States Covered</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="container mx-auto px-4 py-8 text-center text-gray-600">
        <p>© 2024 Speak Up India. Together for a better tomorrow.</p>
      </footer>
    </div>
  );
};

export default Index;
