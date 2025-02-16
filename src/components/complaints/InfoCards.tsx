
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Calendar, Users, ArrowRight, MegaphoneIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { LanguageCode } from "@/types/complaints";
import { TRANSLATIONS } from "@/pages/NewComplaint";

interface InfoCardsProps {
  onVoiceConcernsClick: () => void;
  language: LanguageCode;
}

export function InfoCards({
  onVoiceConcernsClick,
  language
}: InfoCardsProps) {
  const navigate = useNavigate();
  const t = TRANSLATIONS[language];

  return <>
      {/* Voice Your Concerns Card */}
      <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={onVoiceConcernsClick}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MegaphoneIcon className="w-6 h-6 text-blue-600" />
            </div>
            {t.recordComplaint}
          </CardTitle>
          <CardDescription>
            {t.descriptionLabel}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              {t.helpStep1Content}
            </p>
            <Button className="w-full group">
              {t.submitButton}
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
            {t.peerSupport}
          </CardTitle>
          <CardDescription>
            {t.helpTitle}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              {t.helpStep2Content}
            </p>
            <Button onClick={() => navigate("/community")} className="w-full group">
              {t.submit}
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
            {t.successStories}
          </CardTitle>
          <CardDescription>
            {t.helpTipsTitle}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              {t.helpStep3Content}
            </p>
            <Button variant="outline" className="w-full group">
              {t.viewDashboard}
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
            {t.resources}
          </CardTitle>
          <CardDescription>
            {t.helpStep2Title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              {t.helpTipsItems[0]}
            </p>
            <Button variant="outline" className="w-full group">
              {t.resources}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </>;
}
