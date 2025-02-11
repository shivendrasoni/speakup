
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MegaphoneIcon, Users2Icon, ShieldCheckIcon } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="mb-8">
            <MegaphoneIcon className="w-20 h-20 text-blue-600 mx-auto transform -rotate-12" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Speak Up India
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            Your voice matters. India's first unified public complaint platform for all sectors.
          </p>
          <div className="flex gap-4 justify-center">
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

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-white/80 backdrop-blur">
            <CardContent className="pt-6">
              <div className="text-center">
                <MegaphoneIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Voice Your Concerns</h3>
                <p className="text-gray-600">
                  File complaints across any sector - from public services to private organizations
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur">
            <CardContent className="pt-6">
              <div className="text-center">
                <ShieldCheckIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Transparent Tracking</h3>
                <p className="text-gray-600">
                  Track your complaint status in real-time with our transparent system
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur">
            <CardContent className="pt-6">
              <div className="text-center">
                <Users2Icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Community Support</h3>
                <p className="text-gray-600">
                  Join a community of citizens working together for a better India
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-600">
        <p>© 2024 Speak Up India. Together for a better tomorrow.</p>
      </footer>
    </div>
  );
};

export default Index;
