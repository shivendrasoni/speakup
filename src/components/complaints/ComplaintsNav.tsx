
import { Languages, ChartBar, Award, BookOpen, Users, Mic, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TRANSLATIONS } from "@/pages/NewComplaint";
import type { LanguageCode } from "@/types/complaints";

interface ComplaintsNavProps {
  language: LanguageCode;
  onLanguageClick: () => void;
  onVoiceConcernsClick: () => void;
}

export function ComplaintsNav({ language, onLanguageClick, onVoiceConcernsClick }: ComplaintsNavProps) {
  return (
    <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side navigation items */}
          <nav className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              className="flex items-center gap-2"
              onClick={() => window.location.href = "/community?tab=success_stories"}
            >
              <Award className="w-4 h-4 text-yellow-500" />
              <span className="hidden sm:inline">Success Stories</span>
            </Button>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2"
              onClick={() => window.location.href = "/resources"}
            >
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span className="hidden sm:inline">Resources</span>
            </Button>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2"
              onClick={() => window.location.href = "/community?tab=peer_support"}
            >
              <Users className="w-4 h-4 text-green-500" />
              <span className="hidden sm:inline">Peer Support</span>
            </Button>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2"
              onClick={() => window.location.href = "/live-qa"}
            >
              <Mic className="w-4 h-4 text-red-500" />
              <span className="hidden sm:inline">Live Q&A</span>
            </Button>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2"
              onClick={() => window.location.href = "/ai-help"}
            >
              <Bot className="w-4 h-4 text-purple-500" />
              <span className="hidden sm:inline">AI Help</span>
            </Button>
          </nav>

          {/* Right side buttons with enhanced styling */}
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={onLanguageClick}
              className="bg-white hover:bg-gray-50 border-2 border-blue-200 hover:border-blue-300 text-blue-700 shadow-sm flex items-center gap-2 transition-all"
            >
              <Languages className="w-4 h-4" />
              <span className="hidden sm:inline">{TRANSLATIONS[language].changeLanguage}</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = "/complaints"}
              className="bg-white hover:bg-gray-50 border-2 border-green-200 hover:border-green-300 text-green-700 shadow-sm flex items-center gap-2 transition-all"
            >
              <ChartBar className="w-4 h-4" />
              <span className="hidden sm:inline">{TRANSLATIONS[language].viewDashboard}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
