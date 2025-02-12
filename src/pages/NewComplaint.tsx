
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Mic, MicOff, ChartBar } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Sector = Database["public"]["Tables"]["sectors"]["Row"];
type SubmissionType = "complaint" | "feedback" | "compliment";

const TRANSLATIONS = {
  english: {
    title: "Submit Your Voice",
    languageSelect: "Select Language",
    complaint: "Report a Complaint",
    feedback: "Share Feedback",
    compliment: "Give Compliment",
    sector: "Department/Sector",
    description: "Description",
    submit: "Submit",
    recording: "Recording...",
    startRecording: "Start Voice Input",
    stopRecording: "Stop Recording",
    viewDashboard: "View Public Dashboard",
    placeholders: {
      title: "Brief title of your submission",
      description: "Detailed description"
    }
  },
  hindi: {
    title: "अपनी आवाज़ दर्ज करें",
    languageSelect: "भाषा चुनें",
    complaint: "शिकायत दर्ज करें",
    feedback: "प्रतिक्रिया साझा करें",
    compliment: "प्रशंसा करें",
    sector: "विभाग/क्षेत्र",
    description: "विवरण",
    submit: "जमा करें",
    recording: "रिकॉर्डिंग जारी है...",
    startRecording: "आवाज़ से टाइप करें",
    stopRecording: "रिकॉर्डिंग बंद करें",
    viewDashboard: "सार्वजनिक डैशबोर्ड देखें",
    placeholders: {
      title: "अपने विषय का संक्षिप्त शीर्षक",
      description: "विस्तृत विवरण"
    }
  }
};

const NewComplaint = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sectorId, setSectorId] = useState("");
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<"english" | "hindi">("english");
  const [submissionType, setSubmissionType] = useState<SubmissionType>("complaint");
  const [isRecording, setIsRecording] = useState(false);
  const [showLanguageDialog, setShowLanguageDialog] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const t = TRANSLATIONS[language];

  useEffect(() => {
    const fetchSectors = async () => {
      const { data, error } = await supabase
        .from("sectors")
        .select("*")
        .order("name");
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to load sectors. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setSectors(data);
    };

    fetchSectors();
  }, [toast]);

  const startRecording = async () => {
    try {
      // Call the voice-to-text edge function here
      setIsRecording(true);
      toast({
        title: "Started Recording",
        description: t.recording,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start recording",
        variant: "destructive",
      });
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    // Stop recording logic here
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !sectorId) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from("complaints")
        .insert({
          title,
          description,
          sector_id: sectorId,
          language,
          submission_type: submissionType,
          is_public: true,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your submission has been received successfully",
      });
      
      navigate("/complaints");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-12">
      <Dialog open={showLanguageDialog} onOpenChange={setShowLanguageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Your Preferred Language</DialogTitle>
          </DialogHeader>
          <RadioGroup
            defaultValue="english"
            onValueChange={(value) => {
              setLanguage(value as "english" | "hindi");
              setShowLanguageDialog(false);
            }}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="english" id="english" />
              <Label htmlFor="english">English</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hindi" id="hindi" />
              <Label htmlFor="hindi">हिंदी</Label>
            </div>
          </RadioGroup>
        </DialogContent>
      </Dialog>

      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">{t.title}</CardTitle>
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => navigate("/complaints")}
              className="flex items-center gap-2"
            >
              <ChartBar className="w-4 h-4" />
              {t.viewDashboard}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <RadioGroup
              defaultValue="complaint"
              onValueChange={(value) => setSubmissionType(value as SubmissionType)}
              className="flex flex-col md:flex-row gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="complaint" id="complaint" />
                <Label htmlFor="complaint">{t.complaint}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="feedback" id="feedback" />
                <Label htmlFor="feedback">{t.feedback}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="compliment" id="compliment" />
                <Label htmlFor="compliment">{t.compliment}</Label>
              </div>
            </RadioGroup>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.placeholders.title}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sector">{t.sector}</Label>
              <Select
                value={sectorId}
                onValueChange={setSectorId}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a sector" />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map((sector) => (
                    <SelectItem key={sector.id} value={sector.id}>
                      {sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="description">{t.description}</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={isRecording ? stopRecording : startRecording}
                  className="flex items-center gap-2"
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-4 h-4" />
                      {t.stopRecording}
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      {t.startRecording}
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.placeholders.description}
                className="min-h-[150px]"
                disabled={loading}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : t.submit}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewComplaint;
