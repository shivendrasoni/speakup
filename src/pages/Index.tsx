
import { Button } from "@/components/ui/button";
import { MegaphoneIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="mb-8 relative">
            <MegaphoneIcon className="w-20 h-20 text-blue-600 mx-auto transform -rotate-12 transition-transform hover:rotate-0 hover:scale-110" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Speak Up India
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            Your voice matters. India's first unified public complaint platform.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-8">
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 w-full md:w-auto"
            >
              <Link to="/signup">Register / Sign Up</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="text-lg px-8 py-6 w-full md:w-auto"
            >
              <Link to="/complaints/new">Report Without Login</Link>
            </Button>
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
