import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Calendar, Users, ArrowRight, MegaphoneIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
interface InfoCardsProps {
  onVoiceConcernsClick: () => void;
}
export function InfoCards({
  onVoiceConcernsClick
}: InfoCardsProps) {
  const navigate = useNavigate();
  return <>
      {/* Voice Your Concerns Card */}
      <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={onVoiceConcernsClick}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MegaphoneIcon className="w-6 h-6 text-blue-600" />
            </div>
            Voice Your Concerns
          </CardTitle>
          <CardDescription>
            Submit a complaint, feedback, or compliment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              Share your experience and help improve public services. Your voice matters.
            </p>
            <Button className="w-full group">
              Submit Now
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            Community Forum
          </CardTitle>
          <CardDescription>
            Join discussions, share experiences, and connect with others
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              Engage with a community of active citizens working together for positive change.
            </p>
            <Button onClick={() => navigate("/community")} className="w-full group">
              Join the Discussion
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            Upcoming Webinars
          </CardTitle>
          <CardDescription>
            Learn from experts and stay informed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              Join our educational webinars on consumer rights, civic engagement, and more.
            </p>
            <Button variant="outline" className="w-full group">
              View Schedule
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            NGO Partners
          </CardTitle>
          <CardDescription>
            Connect with organizations making a difference
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              Discover and collaborate with NGOs working towards social improvement.
            </p>
            <Button variant="outline" className="w-full group">
              Explore NGOs
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </>;
}