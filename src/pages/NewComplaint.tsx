
import { useState, useEffect, useRef } from "react";
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
import { Mic, MicOff, ChartBar, Languages, MegaphoneIcon, Search } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Sector = Database["public"]["Tables"]["sectors"]["Row"];
type SubmissionType = "complaint" | "feedback" | "compliment";
type LanguageCode = "english" | "hindi" | "bengali" | "telugu" | "marathi" | "tamil" | "gujarati" | "kannada" | "odia" | "punjabi" | "malayalam";

const LANGUAGE_CODES = {
  english: 'en',
  hindi: 'hi',
  bengali: 'bn',
  telugu: 'te',
  marathi: 'mr',
  tamil: 'ta',
  gujarati: 'gu',
  kannada: 'kn',
  odia: 'or',
  punjabi: 'pa',
  malayalam: 'ml'
} as const;

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
    changeLanguage: "Change Language",
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
    changeLanguage: "भाषा बदलें",
    placeholders: {
      title: "अपने विषय का संक्षिप्त शीर्षक",
      description: "विस्तृत विवरण"
    }
  },
  bengali: {
    title: "আপনার ভয়েস জমা দিন",
    languageSelect: "ভাষা নির্বাচন করুন",
    complaint: "অভিযোগ দাখিল করুন",
    feedback: "মতামত শেয়ার করুন",
    compliment: "প্রশংসা করুন",
    sector: "বিভাগ/সেক্টর",
    description: "বিবরণ",
    submit: "জমা দিন",
    recording: "রেকর্ডিং চলছে...",
    startRecording: "ভয়েস ইনপুট শুরু করুন",
    stopRecording: "রেকর্ডিং বন্ধ করুন",
    viewDashboard: "পাবলিক ড্যাশবোর্ড দেখুন",
    changeLanguage: "ভাষা পরিবর্তন করুন",
    placeholders: {
      title: "আপনার জমার সংক্ষিপ্ত শিরোনাম",
      description: "বিস্তারিত বিবরণ"
    }
  },
  telugu: {
    title: "మీ స్వరాన్ని సమర్పించండి",
    languageSelect: "భాష ఎంచుకోండి",
    complaint: "ఫిర్యాదు నమోదు చేయండి",
    feedback: "అభిప్రాయాన్ని పంచుకోండి",
    compliment: "ప్రశంస ఇవ్వండి",
    sector: "విభాగం/రంగం",
    description: "వివరణ",
    submit: "సమర్పించండి",
    recording: "రికార్డింగ్...",
    startRecording: "వాయిస్ ఇన్పుట్ ప్రారంభించండి",
    stopRecording: "రికార్డింగ్ ఆపండి",
    viewDashboard: "పబ్లిక్ డాష్బోర్డ్ చూడండి",
    changeLanguage: "భాష మార్చండి",
    placeholders: {
      title: "మీ సమర్పణ యొక్క సంక్షిప్త శీర్షిక",
      description: "వివరణాత్మక వివరణ"
    }
  },
  tamil: {
    title: "உங்கள் குரலைச் சமர்ப்பிக்கவும்",
    languageSelect: "மொழியைத் தேர்ந்தெடுக்கவும்",
    complaint: "புகார் அளிக்கவும்",
    feedback: "கருத்தைப் பகிரவும்",
    compliment: "பாராட்டு தெரிவிக்கவும்",
    sector: "துறை/பிரிவு",
    description: "விவரம்",
    submit: "சமர்ப்பிக்கவும்",
    recording: "பதிவு செய்கிறது...",
    startRecording: "குரல் உள்ளீடு தொடங்கவும்",
    stopRecording: "பதிவை நிறுத்தவும்",
    viewDashboard: "பொது டாஷ்போர்டைக் காண்க",
    changeLanguage: "மொழியை மாற்றவும்",
    placeholders: {
      title: "உங்கள் சமர்ப்பிப்பின் சுருக்கமான தலைப்பு",
      description: "விரிவான விளக்கம்"
    }
  },
  gujarati: {
    title: "તમારો અવાજ સબમિટ કરો",
    languageSelect: "ભાષા પસંદ કરો",
    complaint: "ફરિયાદ નોંધાવો",
    feedback: "પ્રતિસાદ શેર કરો",
    compliment: "વખાણ કરો",
    sector: "વિભાગ/ક્ષેત્ર",
    description: "વિગત",
    submit: "સબમિટ કરો",
    recording: "રેકોર્ડિંગ...",
    startRecording: "વૉઇસ ઇનપુટ શરૂ કરો",
    stopRecording: "રેકોર્ડિંગ બંધ કરો",
    viewDashboard: "પબ્લિક ડેશબોર્ડ જુઓ",
    changeLanguage: "ભાષા બદલો",
    placeholders: {
      title: "તમારી સબમિશનનું ટૂંકું શીર્ષક",
      description: "વિગતવાર વર્ણન"
    }
  },
  kannada: {
    title: "ನಿಮ್ಮ ಧ್ವನಿಯನ್ನು ಸಲ್ಲಿಸಿ",
    languageSelect: "ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    complaint: "ದೂರು ದಾಖಲಿಸಿ",
    feedback: "ಪ್ರತಿಕ್ರಿಯೆ ಹಂಚಿಕೊಳ್ಳಿ",
    compliment: "ಹೊಗಳಿಕೆ ನೀಡಿ",
    sector: "ವಿಭಾಗ/ಕ್ಷೇತ್ರ",
    description: "ವಿವರಣೆ",
    submit: "ಸಲ್ಲಿಸು",
    recording: "ರೆಕಾರ್ಡಿಂಗ್...",
    startRecording: "ಧ್ವನಿ ಇನ್ಪುಟ್ ಪ್ರಾರಂಭಿಸಿ",
    stopRecording: "ರೆಕಾರ್ಡಿಂಗ್ ನಿಲ್ಲಿಸಿ",
    viewDashboard: "ಸಾರ್ವಜನಿಕ ಡ್ಯಾಶ್ಬೋರ್ಡ್ ವೀಕ್ಷಿಸಿ",
    changeLanguage: "ಭಾಷೆ ಬದಲಾಯಿಸಿ",
    placeholders: {
      title: "ನಿಮ್ಮ ಸಲ್ಲಿಕೆಯ ಸಂಕ್ಷಿಪ್ತ ಶೀರ್ಷಿಕೆ",
      description: "ವಿವರವಾದ ವಿವರಣೆ"
    }
  },
  malayalam: {
    title: "നിങ്ങളുടെ ശബ്ദം സമർപ്പിക്കുക",
    languageSelect: "ഭാഷ തിരഞ്ഞെടുക്കുക",
    complaint: "പരാതി റിപ്പോർട്ട് ചെയ്യുക",
    feedback: "ഫീഡ്‌ബാക്ക് പങ്കിടുക",
    compliment: "പ്രശംസ നൽകുക",
    sector: "വകുപ്പ്/മേഖല",
    description: "വിവരണം",
    submit: "സമർപ്പിക്കുക",
    recording: "റെക്കോർഡ് ചെയ്യുന്നു...",
    startRecording: "വോയ്‌സ് ഇൻപുട്ട് ആരംഭിക്കുക",
    stopRecording: "റെക്കോർഡിംഗ് നിർത്തുക",
    viewDashboard: "പൊതു ഡാഷ്‌ബോർഡ് കാണുക",
    changeLanguage: "ഭാഷ മാറ്റുക",
    placeholders: {
      title: "നിങ്ങളുടെ സമർപ്പണത്തിന്റെ ചുരുക്കമായ തലക്കെട്ട്",
      description: "വിശദമായ വിവരണം"
    }
  },
  marathi: {
    title: "तुमचा आवाज सबमिट करा",
    languageSelect: "भाषा निवडा",
    complaint: "तक्रार नोंदवा",
    feedback: "अभिप्राय शेअर करा",
    compliment: "कौतुक करा",
    sector: "विभाग/क्षेत्र",
    description: "वर्णन",
    submit: "सबमिट करा",
    recording: "रेकॉर्डिंग...",
    startRecording: "व्हॉइस इनपुट सुरू करा",
    stopRecording: "रेकॉर्डिंग थांबवा",
    viewDashboard: "पब्लिक डॅशबोर्ड पहा",
    changeLanguage: "भाषा बदला",
    placeholders: {
      title: "तुमच्या सबमिशनचे संक्षिप्त शीर्षक",
      description: "सविस्तर वर्णन"
    }
  },
  punjabi: {
    title: "ਆਪਣੀ ਆਵਾਜ਼ ਜਮ੍ਹਾਂ ਕਰੋ",
    languageSelect: "ਭਾਸ਼ਾ ਚੁਣੋ",
    complaint: "ਸ਼ਿਕਾਇਤ ਦਰਜ ਕਰੋ",
    feedback: "ਫੀਡਬੈਕ ਸਾਂਝਾ ਕਰੋ",
    compliment: "ਸ਼ਾਬਾਸ਼ੀ ਦਿਓ",
    sector: "ਵਿਭਾਗ/ਖੇਤਰ",
    description: "ਵੇਰਵਾ",
    submit: "ਜਮ੍ਹਾਂ ਕਰੋ",
    recording: "ਰਿਕਾਰਡਿੰਗ...",
    startRecording: "ਵੌਇਸ ਇਨਪੁੱਟ ਸ਼ੁਰੂ ਕਰੋ",
    stopRecording: "ਰਿਕਾਰਡਿੰਗ ਰੋਕੋ",
    viewDashboard: "ਪਬਲਿਕ ਡੈਸ਼ਬੋਰਡ ਦੇਖੋ",
    changeLanguage: "ਭਾਸ਼ਾ ਬਦਲੋ",
    placeholders: {
      title: "ਆਪਣੀ ਸਬਮਿਸ਼ਨ ਦਾ ਸੰਖੇਪ ਸਿਰਲੇਖ",
      description: "ਵਿਸਥਾਰਪੂਰਵਕ ਵੇਰਵਾ"
    }
  },
  odia: {
    title: "ଆପଣଙ୍କର ସ୍ୱର ଦାଖଲ କରନ୍ତୁ",
    languageSelect: "ଭାଷା ବାଛନ୍ତୁ",
    complaint: "ଅଭିଯୋଗ ଦାଖଲ କରନ୍ତୁ",
    feedback: "ମତାମତ ସେୟାର କରନ୍ତୁ",
    compliment: "ପ୍ରଶଂସା କରନ୍ତୁ",
    sector: "ବିଭାଗ/କ୍ଷେତ୍ର",
    description: "ବିବରଣୀ",
    submit: "ଦାଖଲ କରନ୍ତୁ",
    recording: "ରେକର୍ଡିଂ...",
    startRecording: "ଭଏସ୍ ଇନପୁଟ୍ ଆରମ୍ଭ କରନ୍ତୁ",
    stopRecording: "ରେକର୍ଡିଂ ବନ୍ଦ କରନ୍ତୁ",
    viewDashboard: "ପବ୍ଲିକ୍ ଡ୍ୟାସବୋର୍ଡ ଦେଖନ୍ତୁ",
    changeLanguage: "ଭାଷା ପରିବର୍ତ୍ତନ କରନ୍ତୁ",
    placeholders: {
      title: "ଆପଣଙ୍କ ଦାଖଲର ସଂକ୍ଷିପ୍ତ ଶୀର୍ଷକ",
      description: "ବିସ୍ତୃତ ବିବରଣୀ"
    }
  }
} as const;

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

  return (
    <div className="min-h-screen bg-white">
      {/* Language Selection Dialog */}
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

      {/* Wave Pattern Header */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-400 to-blue-300">
        {/* Geometric Shapes */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500 rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-300 rounded-full opacity-20 translate-x-1/3 -translate-y-1/3"></div>
        
        <div className="container mx-auto px-4 pt-12 pb-32 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="mb-8 relative">
              <MegaphoneIcon className="w-20 h-20 text-white mx-auto transform -rotate-12 transition-transform hover:rotate-0 hover:scale-110" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t.title}
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Your voice matters. Share your concerns with us.
            </p>
          </div>
        </div>
        {/* Wave SVG */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 200L60 181.3C120 163 240 125 360 106.7C480 88 600 88 720 100C840 112 960 137 1080 143.3C1200 150 1320 137 1380 131.3L1440 125V200H1380C1320 200 1200 200 1080 200C960 200 840 200 720 200C600 200 480 200 360 200C240 200 120 200 60 200H0Z" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 -mt-20 pb-16 relative z-10">
        <Card className="max-w-2xl mx-auto bg-white shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center mb-4">
              <Button
                variant="outline"
                onClick={() => setShowLanguageDialog(true)}
                className="flex items-center gap-2"
              >
                <Languages className="w-4 h-4" />
                {t.changeLanguage}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/complaints")}
                className="flex items-center gap-2"
              >
                <ChartBar className="w-4 h-4" />
                {t.viewDashboard}
              </Button>
            </div>
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
          </CardHeader>
          <CardContent>
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
                  className="w-full"
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
    </div>
  );
};

export default NewComplaint;
