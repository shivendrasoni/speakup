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
import { Mic, MicOff, ChartBar, Languages, Building2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Database } from "@/integrations/supabase/types";
import { TRANSLATIONS, LANGUAGE_CODES } from "./translations";

type LanguageCode = keyof typeof LANGUAGE_CODES;
type SubmissionType = "complaint" | "feedback" | "compliment";
type Sector = Database["public"]["Tables"]["sectors"]["Row"];
type NGOProfile = Database["public"]["Tables"]["ngo_profiles"]["Row"];
type WebinarSession = Database["public"]["Tables"]["webinar_sessions"]["Row"];

const NewComplaint = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sectorId, setSectorId] = useState("");
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<LanguageCode>("english");
  const [submissionType, setSubmissionType] = useState<SubmissionType>("complaint");
  const [isRecording, setIsRecording] = useState(false);
  const [showLanguageDialog, setShowLanguageDialog] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start();
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
    if (!mediaRecorderRef.current) return;

    return new Promise<void>((resolve) => {
      if (!mediaRecorderRef.current) return resolve();

      mediaRecorderRef.current.onstop = async () => {
        try {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();

          reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(',')[1];
            
            const { data, error } = await supabase.functions.invoke('voice-to-text', {
              body: { audio: base64Audio, language }
            });

            if (error) throw error;
            if (data.text) {
              setDescription(prev => prev + (prev ? '\n' : '') + data.text);
            }

            resolve();
          };

          reader.readAsDataURL(audioBlob);
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to process audio",
            variant: "destructive",
          });
          resolve();
        }
      };

      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    });
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
          user_id: null // Set to null for anonymous submissions
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

  const { data: ngoProfiles } = useQuery({
    queryKey: ["ngo-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ngo_profiles")
        .select("*");
      if (error) throw error;
      return data as NGOProfile[];
    },
  });

  const { data: upcomingWebinars } = useQuery({
    queryKey: ["upcoming-webinars"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("webinar_sessions")
        .select(`
          *,
          ngo_profiles (
            name,
            logo_url
          )
        `)
        .gte("scheduled_at", new Date().toISOString())
        .order("scheduled_at");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <div className="w-64 min-h-screen bg-white border-r border-gray-200 p-4">
          <div className="space-y-4">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setShowLanguageDialog(true)}
            >
              <Languages className="mr-2 h-4 w-4" />
              {t.changeLanguage}
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate("/complaints")}
            >
              <ChartBar className="mr-2 h-4 w-4" />
              {t.viewDashboard}
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              <Building2 className="mr-2 h-4 w-4" />
              NGO Partners
            </Button>
          </div>
        </div>

        <div className="flex-1 p-6">
          <Tabs defaultValue="submit">
            <TabsList className="mb-6">
              <TabsTrigger value="submit">Submit Your Voice</TabsTrigger>
              <TabsTrigger value="ngos">NGO Partners</TabsTrigger>
              <TabsTrigger value="webinars">Webinars</TabsTrigger>
            </TabsList>

            <TabsContent value="submit">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{t.title}</CardTitle>
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
            </TabsContent>

            <TabsContent value="ngos">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ngoProfiles?.map((ngo) => (
                  <Card key={ngo.id}>
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        {ngo.logo_url && (
                          <img
                            src={ngo.logo_url}
                            alt={`${ngo.name} logo`}
                            className="w-16 h-16 object-contain"
                          />
                        )}
                        <CardTitle>{ngo.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{ngo.description}</p>
                      {ngo.key_areas && (
                        <div className="mb-4">
                          <h4 className="font-medium mb-2">Key Areas:</h4>
                          <div className="flex flex-wrap gap-2">
                            {ngo.key_areas.map((area) => (
                              <span
                                key={area}
                                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                              >
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {ngo.website_url && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => window.open(ngo.website_url, '_blank')}
                        >
                          Visit Website
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="webinars">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Webinars</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {upcomingWebinars?.map((webinar) => (
                        <Card key={webinar.id}>
                          <CardHeader>
                            <CardTitle>{webinar.title}</CardTitle>
                            <CardDescription>
                              By {webinar.speaker_name}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-600 mb-4">
                              {webinar.description}
                            </p>
                            <div className="flex justify-between items-center">
                              <div className="text-sm text-gray-500">
                                {new Date(webinar.scheduled_at).toLocaleDateString()}
                                <br />
                                Duration: {webinar.duration_minutes} minutes
                              </div>
                              <Button>Register Now</Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={showLanguageDialog} onOpenChange={setShowLanguageDialog}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Your Preferred Language | भाषा चुनें</DialogTitle>
          </DialogHeader>
          <RadioGroup
            defaultValue={language}
            onValueChange={(value) => {
              setLanguage(value as LanguageCode);
              setShowLanguageDialog(false);
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {(Object.keys(TRANSLATIONS) as LanguageCode[]).map((lang) => (
              <div key={lang} className="flex items-center space-x-2">
                <RadioGroupItem value={lang} id={lang} />
                <Label htmlFor={lang}>
                  {TRANSLATIONS[lang].languageSelect}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewComplaint;
