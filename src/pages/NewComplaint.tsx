import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Mic, 
  MicOff, 
  Search, 
  MessageSquare, 
  Users, 
  Calendar, 
  Newspaper,
  Building2, 
  HelpCircle,
  Book,
  Globe
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";
import { TRANSLATIONS, LANGUAGE_CODES } from "./translations";

type LanguageCode = keyof typeof LANGUAGE_CODES;

const NewComplaint = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>("english");
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [complaintText, setComplaintText] = useState("");

  const t = TRANSLATIONS[currentLanguage];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const base64Audio = await blobToBase64(audioBlob);
        
        try {
          const { data, error } = await supabase.functions.invoke('voice-to-text', {
            body: { audio: base64Audio, language: currentLanguage }
          });

          if (error) throw error;
          setComplaintText(data.text);
          
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to convert speech to text",
            variant: "destructive",
          });
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not access microphone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result.split(',')[1]);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Add your submission logic here
    toast({
      title: "Success",
      description: "Your complaint has been submitted",
    });
  };

  const handleSectionClick = (section: string) => {
    switch (section) {
      case "forum":
        navigate("/community");
        break;
      case "tips":
        navigate("/help");
        break;
      case "ngos":
        navigate("/ngos");
        break;
      case "events":
        navigate("/events");
        break;
      case "webinars":
        navigate("/webinars");
        break;
      case "news":
        navigate("/news");
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Speak Up</h1>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <Button onClick={() => setShowComplaintForm(true)}>Voice Your Concern</Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowLanguageDialog(true)}
              >
                <Globe className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {showComplaintForm ? (
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>{t.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="title">{t.complaint}</Label>
                  <Input
                    id="title"
                    value={complaintText}
                    onChange={(e) => setComplaintText(e.target.value)}
                    placeholder={t.placeholders.title}
                  />
                </div>

                <div>
                  <Label htmlFor="description">{t.description}</Label>
                  <Textarea
                    id="description"
                    placeholder={t.placeholders.description}
                    className="h-32"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <Button type="submit">{t.submit}</Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={isRecording ? stopRecording : startRecording}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="w-4 h-4 mr-2" />
                        {t.stopRecording}
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 mr-2" />
                        {t.startRecording}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Featured Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg mb-1">Community Forum</CardTitle>
                    <CardDescription>Join discussions and share experiences</CardDescription>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <HelpCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg mb-1">User Tips</CardTitle>
                    <CardDescription>Helpful guides and best practices</CardDescription>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg mb-1">NGO Partners</CardTitle>
                    <CardDescription>Connect with organizations</CardDescription>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <Calendar className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg mb-1">Events</CardTitle>
                    <CardDescription>Upcoming workshops and trainings</CardDescription>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-pink-100 p-3 rounded-lg">
                    <Book className="h-6 w-6 text-pink-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg mb-1">Webinars</CardTitle>
                    <CardDescription>Learn from experts</CardDescription>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-teal-100 p-3 rounded-lg">
                    <Newspaper className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg mb-1">News & Updates</CardTitle>
                    <CardDescription>Latest community news</CardDescription>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Featured Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Discussions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Discussions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <MessageSquare className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">How to effectively raise concerns</h3>
                        <p className="text-sm text-gray-500">Started by @user{i} • 2h ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <Calendar className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Community Workshop #{i}</h3>
                        <p className="text-sm text-gray-500">Next Tuesday • 2:00 PM</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Language Selection Dialog */}
      <Dialog open={showLanguageDialog} onOpenChange={setShowLanguageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.languageSelect}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            {Object.keys(LANGUAGE_CODES).map((lang) => (
              <Button
                key={lang}
                variant={currentLanguage === lang ? "default" : "outline"}
                onClick={() => {
                  setCurrentLanguage(lang as LanguageCode);
                  setShowLanguageDialog(false);
                }}
                className="justify-start"
              >
                {lang}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewComplaint;
