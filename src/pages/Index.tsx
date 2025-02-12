
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MegaphoneIcon, HelpCircle, Eye } from "lucide-react";
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
          <div className="flex gap-4 justify-center mb-16">
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6"
            >
              <Link to="/signup">Register Now</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="text-lg px-8 py-6"
            >
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Report Without Login Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-white/80 backdrop-blur">
            <CardContent className="pt-6">
              <div className="text-center">
                <MegaphoneIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Report a Complaint</h3>
                <p className="text-gray-600 mb-4">
                  File your complaint without creating an account
                </p>
                <Button asChild className="w-full">
                  <Link to="/complaints/new">Report Now</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur">
            <CardContent className="pt-6">
              <div className="text-center">
                <Eye className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">View Public Complaints</h3>
                <p className="text-gray-600 mb-4">
                  Browse through existing public complaints
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/complaints">View Complaints</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur">
            <CardContent className="pt-6">
              <div className="text-center">
                <HelpCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Help Section</h3>
                <p className="text-gray-600 mb-4">
                  Learn how to effectively report your complaints
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/help">View Guide</Link>
                </Button>
              </div>
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
