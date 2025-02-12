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
  Globe,
  ArrowLeft,
  ChartBar
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";
import { TRANSLATIONS, LANGUAGE_CODES } from "./translations";

type LanguageCode = keyof typeof LANGUAGE_CODES;
type SubmissionType = 'complaint' | 'compliment' | 'feedback';

const NewComplaint = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [showComplaintForm, setShowComplaintForm] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>("english");
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [complaintText, setComplaintText] = useState("");
  const [submissionType, setSubmissionType] = useState<SubmissionType>("complaint");
  const [selectedSector, setSelectedSector] = useState("");

  const t = TRANSLATIONS[currentLanguage];

  const { data: sectors } = useQuery({
    queryKey: ["sectors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sectors")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

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
    
    if (!selectedSector) {
      toast({
        title: "Error",
        description: "Please select a sector",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("complaints").insert({
        title: complaintText,
        description: complaintText,
        sector_id: selectedSector,
        submission_type: submissionType,
        language: currentLanguage,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your submission has been recorded",
      });

      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit your concern",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                Speak Up
                <ChartBar className="h-6 w-6 text-blue-600" />
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowLanguageDialog(true)}
              >
                <Globe className="h-5 w-5" />
              </Button>
              <Button onClick={() => navigate("/dashboard")}>
                View Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{t.title}</CardTitle>
            <CardDescription>Choose your submission type and provide details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Submission Type</Label>
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    type="button"
                    variant={submissionType === "complaint" ? "default" : "outline"}
                    onClick={() => setSubmissionType("complaint")}
                    className="w-full"
                  >
                    {t.complaint}
                  </Button>
                  <Button
                    type="button"
                    variant={submissionType === "compliment" ? "default" : "outline"}
                    onClick={() => setSubmissionType("compliment")}
                    className="w-full"
                  >
                    {t.compliment}
                  </Button>
                  <Button
                    type="button"
                    variant={submissionType === "feedback" ? "default" : "outline"}
                    onClick={() => setSubmissionType("feedback")}
                    className="w-full"
                  >
                    {t.feedback}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="sector">{t.sector}</Label>
                <Select value={selectedSector} onValueChange={setSelectedSector}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectors?.map((sector) => (
                      <SelectItem key={sector.id} value={sector.id}>
                        {sector.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">{t.description}</Label>
                <Textarea
                  id="description"
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
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
