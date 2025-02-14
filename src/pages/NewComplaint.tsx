import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MegaphoneIcon, ChartBar, Languages, ArrowRight } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { LanguageSelectionDialog } from "@/components/complaints/LanguageSelectionDialog";
import { ComplaintForm } from "@/components/complaints/ComplaintForm";
import { InfoCards } from "@/components/complaints/InfoCards";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ComplaintsNav } from "@/components/complaints/ComplaintsNav";

type Sector = Database["public"]["Tables"]["sectors"]["Row"];
export type SubmissionType = "complaint" | "feedback" | "compliment";
export type LanguageCode = "english" | "hindi" | "bengali" | "telugu" | "marathi" | "tamil" | "gujarati" | "kannada" | "odia" | "punjabi" | "malayalam";

export const LANGUAGE_CODES = {
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

export const TRANSLATIONS = {
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
    complaint: "ఫిర్యాద�������� నమోదు చేయండి",
    feedback: "అభిప్రాయాన్ని పంచుకోండి",
    compliment: "ప్రశంస ఇవ్వండి",
    sector: "విభాగం/రంగం",
    description: "వివరణ",
    submit: "సమర్పించండి",
    recording: "రికార్డింగ్...",
    startRecording: "వాయిస్ ఇన్పుట్ ప్రారंಭించండి",
    stopRecording: "రికార్డింగ్ ఆపండి",
    viewDashboard: "పబ్లిక్ డ్యాష్బోర్డ్ చూడండి",
    changeLanguage: "భాష మార్చండి",
    placeholders: {
      title: "మీ సమర్పణ యొక్క సంక్షిప్త శీర్షికె",
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
    viewDashboard: "பொது ஡ாஷ்போர்டைக் காண்க",
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
    viewDashboard: "પબલિક ડેશબોર્ડ જુઓ",
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
    stopRecording: "റെക്കോർഡിംഗ് നില്ILLിസി",
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
    viewDashboard: "पब्लिक डॅशबॉर्ड पहा",
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
    sector: "ਵਿਭਾग/ਖੇਤਰ",
    description: "ਵੇਰਵਾ",
    submit: "ਜਮ੍ਹਾਂ ਕਰੋ",
    recording: "ਰਿਕਾਰਡਿੰਗ...",
    startRecording: "ਵੌਇਸ ਇਨਪੁੱਟ ਸ਼ੁਰੂ ਕਰੋ",
    stopRecording: "ਰਿਕਾਰਡਿੰग ਰੋਕੋ",
    viewDashboard: "ਪਬਲਿਕ ࡭ാസ്‌ബോർഡ ଦେଖନ୍ତୁ",
    changeLanguage: "ਭਾਸ਼ਾ ਬਦਲੋ",
    placeholders: {
      title: "ਆਪਣੀ ਸਬਮਿਸ਼ਨ ਦਾ ਸੰਖੇਪ ਸਿਰਲੇਖ",
      description: "ਵਿਸਥਾਰਪੂਰਵਕ ਵੇਰਵਾ"
    }
  },
  odia: {
    title: "ଆପଣଙ୍କର ସ୍ୱର ଦାଖଲ କରନ୍ତୁ",
    languageSelect: "ଭାଷ ବାଛନ୍ତୁ",
    complaint: "ଅଭିଯୋଗ ଦାଖଲ କରନ୍ତୁ",
    feedback: "ମତାମତ ସେୟାର କରନ୍ତୁ",
    compliment: "ପ୍ରଶଂସା କରନ୍ତୁ",
    sector: "ବିଭାગ/କ୍ଷେତ୍ର",
    description: "ବିବରଣୀ",
    submit: "ଦାଖଲ କରନ୍ତୁ",
    recording: "ରେକର୍ଡିଂ...",
    startRecording: "ଭ��ସ��� ଇନପୁଟ୍ ଆରମ୍ଭ କରନ୍ତୁ",
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
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [feedbackCategory, setFeedbackCategory] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [complimentRecipient, setComplimentRecipient] = useState("");

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
        description: TRANSLATIONS[language].recording,
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
    
    if (!title.trim() || !description.trim() || (submissionType === "complaint" && !sectorId)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const uploadedFiles = [];
      
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('complaint_attachments')
          .upload(fileName, file);
          
        if (uploadError) throw uploadError;
        
        if (data) {
          uploadedFiles.push({
            name: file.name,
            path: data.path,
            type: file.type,
            size: file.size
          });
        }
      }
      
      const formData = {
        title,
        description,
        sector_id: sectorId,
        language,
        submission_type: submissionType,
        is_public: true,
        attachments: uploadedFiles,
        ...(submissionType === "feedback" && {
          feedback_category: feedbackCategory as Database["public"]["Enums"]["feedback_category"],
          user_name: userName || null,
          email: userEmail || null,
        }),
        ...(submissionType === "compliment" && {
          compliment_recipient: complimentRecipient,
          user_name: userName || null,
          email: userEmail || null,
        }),
      };

      const { error } = await supabase
        .from("complaints")
        .insert(formData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your submission has been received successfully",
      });
      
      setTitle("");
      setDescription("");
      setSectorId("");
      setFiles([]);
      setUserName("");
      setUserEmail("");
      setFeedbackCategory("");
      setComplimentRecipient("");
      setShowComplaintForm(false);
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
      <LanguageSelectionDialog
        open={showLanguageDialog}
        onOpenChange={setShowLanguageDialog}
        language={language}
        onLanguageChange={setLanguage}
      />

      <ComplaintsNav
        language={language}
        onLanguageClick={() => setShowLanguageDialog(true)}
        onVoiceConcernsClick={() => setShowComplaintForm(true)}
      />

      <div className="relative bg-gradient-to-r from-blue-600 via-blue-400 to-blue-300 pt-16">
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500 rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-300 rounded-full opacity-20 translate-x-1/3 -translate-y-1/3"></div>
        
        <div className="container mx-auto px-4 pt-12 pb-32 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="mb-8 relative">
              <MegaphoneIcon className="w-20 h-20 text-white mx-auto transform -rotate-12 transition-transform hover:rotate-0 hover:scale-110" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Welcome to Speak Up India</h1>
            <p className="text-xl text-white/90 mb-8">Your Platform for Change and Community Engagement</p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 200L60 181.3C120 163 240 125 360 106.7C480 88 600 88 720 100C840 112 960 137 1080 143.3C1200 150 1320 137 1380 131.3L1440 125V200H1380C1320 200 1200 200 1080 200C960 200 840 200 720 200C600 200 480 200 360 200C240 200 120 200 60 200H0Z" fill="white"/>
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-20 pb-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <InfoCards onVoiceConcernsClick={() => setShowComplaintForm(true)} />
        </div>
      </div>

      <Dialog open={showComplaintForm} onOpenChange={setShowComplaintForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <Card className="border-0 shadow-none">
            <CardHeader>
              <CardTitle>{TRANSLATIONS[language].title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ComplaintForm
                title={title}
                setTitle={setTitle}
                description={description}
                setDescription={setDescription}
                sectorId={sectorId}
                setSectorId={setSectorId}
                sectors={sectors}
                loading={loading}
                language={language}
                submissionType={submissionType}
                setSubmissionType={setSubmissionType}
                isRecording={isRecording}
                onStartRecording={startRecording}
                onStopRecording={stopRecording}
                onShowLanguageDialog={() => setShowLanguageDialog(true)}
                onSubmit={handleSubmit}
                files={files}
                setFiles={setFiles}
                feedbackCategory={feedbackCategory}
                setFeedbackCategory={setFeedbackCategory}
                userName={userName}
                setUserName={setUserName}
                userEmail={userEmail}
                setUserEmail={setUserEmail}
                complimentRecipient={complimentRecipient}
                setComplimentRecipient={setComplimentRecipient}
              />
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewComplaint;
