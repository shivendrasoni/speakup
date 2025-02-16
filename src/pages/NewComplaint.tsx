import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LanguageSelectionDialog } from "@/components/complaints/LanguageSelectionDialog";
import { ComplaintForm } from "@/components/complaints/ComplaintForm";
import { InfoCards } from "@/components/complaints/InfoCards";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ComplaintsNav } from "@/components/complaints/ComplaintsNav";
import { AIComplaintBot } from "@/components/complaints/AIComplaintBot";
import { HeroSection } from "@/components/complaints/HeroSection";
import type { Sector, SubmissionType, LanguageCode } from "@/types/complaints";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

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
      description: "Detailed description",
      date: "Pick a date"
    },
    error: "Error",
    required: "Please fill in all required fields",
    success: "Success",
    complaintSubmitted: "Your submission has been received successfully",
    complaintFailed: "Failed to submit"
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
      description: "विस्तृत विवरण",
      date: "दिनांक चुनें"
    },
    error: "Error",
    required: "Please fill in all required fields",
    success: "Success",
    complaintSubmitted: "Your submission has been received successfully",
    complaintFailed: "Failed to submit"
  },
  bengali: {
    title: "আপনার ভয়েস জমা দিন",
    languageSelect: "ভাষা নির্বাচন করুন",
    complaint: "অভিযোগ দাখিল করুন",
    feedback: "মতামত শেয়ার করুন",
    compliment: "প্রশংসা করুন",
    sector: "বিভাগ/সেক্টর",
    description: "বি঵রণ",
    submit: "জমা দিন",
    recording: "রেকর্ডিং চলছে...",
    startRecording: "ভয়েস ইনপুট শুরু করুন",
    stopRecording: "রেকর্ডিং বন্ধ করুন",
    viewDashboard: "পাবলিক ড্যাশবোর্ড দেখুন",
    changeLanguage: "ভাষা পরিবর্তন করুন",
    placeholders: {
      title: "আপনার জমার সংক্ষিপ্ত শিরোনাম",
      description: "বিস্তারিত বি঵রণ",
      date: "দিনাংক চেয়ে চালু করুন"
    },
    error: "Error",
    required: "Please fill in all required fields",
    success: "Success",
    complaintSubmitted: "Your submission has been received successfully",
    complaintFailed: "Failed to submit"
  },
  telugu: {
    title: "మీ స్వరాన్ని సమర్పించండి",
    languageSelect: "భ��ష ఎంచుకోండి",
    complaint: "ఫిర్య���ద�������� నమోదు చేయండి",
    feedback: "అభిప్రాయాన్న�� పం���ుకోండి",
    compliment: "ప్రశంస ఇవ్వండి",
    sector: "విభాగం/రంగం",
    description: "వివరణ",
    submit: "సమర్పించండి",
    recording: "రికార్డింగ్...",
    startRecording: "వ౉इస్ ఇన్పుట్ ప్రారंಭించండి",
    stopRecording: "రికార్డింగ్ ఆపండి",
    viewDashboard: "పొతు డాష్బోర్డైக் காண்க",
    changeLanguage: "భాష మార్చండి",
    placeholders: {
      title: "మీ సమర్పణ యొక్క సంక్షిప్త శీర్షికె",
      description: "వివరణాత్మక వివరణ",
      date: "దినాంక చేయండి"
    },
    error: "Error",
    required: "Please fill in all required fields",
    success: "Success",
    complaintSubmitted: "Your submission has been received successfully",
    complaintFailed: "Failed to submit"
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
    startRecording: "வ௉इస் இந்புட்ட் ஆரम்பிக்கவும்",
    stopRecording: "பதிவை நிறுத்தவும்",
    viewDashboard: "పొతు డాష్బోర్డైக் காண்க",
    changeLanguage: "மொழியை மாற்றவும்",
    placeholders: {
      title: "உங்கள் சமர்ப்பிப்பின் சுருக்கமான தலைப்பு",
      description: "விழான விளக்கம்",
      date: "திருமண்டி செய்யுங்கள்"
    },
    error: "Error",
    required: "Please fill in all required fields",
    success: "Success",
    complaintSubmitted: "Your submission has been received successfully",
    complaintFailed: "Failed to submit"
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
    startRecording: "વૉइસ ઇનપુટ શરૂ કરો",
    stopRecording: "રેકોર્ડિંગ બંધ કરો",
    viewDashboard: "પબલિક ડેશબોર્ડ જુઓ",
    changeLanguage: "ભાષા બદલો",
    placeholders: {
      title: "તમારી સબમિશનનું ટૂંકું શીર્ષક",
      description: "વિગતવાર વર્ણન",
      date: "તિરુમાં ചેയો"
    },
    error: "Error",
    required: "Please fill in all required fields",
    success: "Success",
    complaintSubmitted: "Your submission has been received successfully",
    complaintFailed: "Failed to submit"
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
    viewDashboard: "ಸ���ರ���ವಜನಿಕ ಡ್ಯಾಶ್ಬೋರ್ಡ್ ವೀಕ್ಷಿಸಿ",
    changeLanguage: "ಭಾಷೆ ಬದಲಾಯಿಸಿ",
    placeholders: {
      title: "ನಿಮ್ಮ ಸಲ್ಲಿ��ೆಯ ಸಂಕ���ಷಿಪ್ತ ಶೀರ್ಷಿಕೆ",
      description: "ವಿವರವಾದ ವಿವರಣೆ",
      date: "ದಿನಾಂಕ ಚெய்யಿ"
    },
    error: "Error",
    required: "Please fill in all required fields",
    success: "Success",
    complaintSubmitted: "Your submission has been received successfully",
    complaintFailed: "Failed to submit"
  },
  malayalam: {
    title: "നിങ്ങളുടെ ശബ്ദം സമർപ്പിക്കുക",
    languageSelect: "ഭാഷ തിരഞ്ഞെടുക്കുക",
    complaint: "പരാതി റിപ്പോർട്ട് ചെയ്യുക",
    feedback: "ഫീഡ്‌ബാക്ക് പകிரവുക",
    compliment: "പ്രശംസ നൽകുക",
    sector: "വകുപ്പ്/മേഖല",
    description: "വിവരണം",
    submit: "സമർപ്പിക്കുക",
    recording: "റെക്കോർഡ് ചെയ്കிறതு...",
    startRecording: "വോയ്‌സ് ഇൻപുട്ട് ആരംഭിക്കുക",
    stopRecording: "റെക്കോർഡിംഗ് നില്ILLിസി",
    viewDashboard: "പൊതു ഡാഷ്‌ബോର୍ଡ് ଦେଖନ୍ତୁ",
    changeLanguage: "ഭാഷ മാറ്റുക",
    placeholders: {
      title: "നിങ്ങളുടെ സമർപ്പണത്തിന്റെ ചുരുക്കമായ തലക്കെട്ട്",
      description: "വിശദമായ വിവരണം",
      date: "തിരുമാം ചെയ്യോ"
    },
    error: "Error",
    required: "Please fill in all required fields",
    success: "Success",
    complaintSubmitted: "Your submission has been received successfully",
    complaintFailed: "Failed to submit"
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
      description: "सविस्तर वर्णन",
      date: "दिनांक चुनें"
    },
    error: "Error",
    required: "Please fill in all required fields",
    success: "Success",
    complaintSubmitted: "Your submission has been received successfully",
    complaintFailed: "Failed to submit"
  },
  punjabi: {
    title: "ਆਪਣੀ ਆਵਾਜ਼ ਜਮ੍ਹਾਂ ਕਰੋ",
    languageSelect: "ਭਾਸ਼ਾ ਚੁਣੋ",
    complaint: "ਸ਼ਿਕਾਇਤ ਦਰਜ ਕਰੋ",
    feedback: "ਫੀਡਬੈਕ ਸਾਂਝਾ ਕਰੋ",
    compliment: "ਸ਼ਾਬਾਸ਼ੀ ਨਲਕੁਕ",
    sector: "ਵਿਭਾग/ਖੇਤਰ",
    description: "ਵੇਰਵਾ",
    submit: "ਜਮ੍ਹਾਂ ਕਰੋ",
    recording: "ਰਿਕਾਰਡਿੰਗ...",
    startRecording: "ਵੌਇਸ ਇਨਪੁੱਟ ਸ਼ੁਰੂ ਕਰੋ",
    stopRecording: "ਰਿਕਾਰਡਿੰग ਰੋਕੋ",
    viewDashboard: "ਪਬਲਿਕ ࡭ാസ്‌ബോର୍ଡ ଦେଖନ୍ତୁ",
    changeLanguage: "ਭਾਸ਼ਾ ਬਦਲੋ",
    placeholders: {
      title: "ਆਪਣੀ ਸਬਮਿਸ਼ਨ ਦਾ ਸੰਖੇਪ ਸਿਰਲੇਖ",
      description: "ਵਿਸਥਾਰਪੂਰਵਕ ਵੇਰਵਾ",
      date: "दिनांक ଚେଯନ୍ତୁ"
    },
    error: "Error",
    required: "Please fill in all required fields",
    success: "Success",
    complaintSubmitted: "Your submission has been received successfully",
    complaintFailed: "Failed to submit"
  },
  odia: {
    title: "ଆପଣଙ୍କର ସ୍ୱର ଦାଖଲ କରନ୍ତୁ",
    languageSelect: "ଭାଷ ବାଛନ୍ତୁ",
    complaint: "ଅଭିଯୋଗ ଦାଖଲ କରନ୍ତୁ",
    feedback: "ମତାମତ ସେୟାର କରନ୍ତୁ",
    compliment: "ପ୍ରଶଂସା କରନ୍ତୁ",
    sector: "ବିଭାગ/କ୍ଷେତ୍ର",
    description: "ବ��ବରଣୀ",
    submit: "ଦାଖଲ କରନ୍ତୁ",
    recording: "ରେକର୍ଡ���ଂ...",
    startRecording: "ଭ��ସ��� ଇନପୁଟ୍ ଆରମ୍ଭ କରନ୍ତୁ",
    stopRecording: "ର��କର୍���ିଂ ବନ୍ଦ କରନ୍ତୁ",
    viewDashboard: "ପବ୍ଲିକ୍ ଡ୍ୟାସବୋର୍ଡ ଦେଖନ୍ତୁ",
    changeLanguage: "ଭାଷା ପରିବର୍ତ୍ତନ କରନ୍ତୁ",
    placeholders: {
      title: "ଆପଣଙ୍କ ଦାଖଲର ସଂକ୍ଷିପ୍ତ ଶୀର୍ଷକ",
      description: "ବିସ୍ତୃତ ଵିବରଣୀ",
      date: "ଦିନାଂକ ଚେଯନ୍ତୁ"
    },
    error: "Error",
    required: "Please fill in all required fields",
    success: "Success",
    complaintSubmitted: "Your submission has been received successfully",
    complaintFailed: "Failed to submit"
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
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    const fetchSectors = async () => {
      const { data, error } = await supabase
        .from("sectors")
        .select("*")
        .order("name");
      
      if (error) {
        toast({
          title: TRANSLATIONS[language].error,
          description: "Failed to load sectors. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setSectors(data || []);
    };

    fetchSectors();
  }, [toast, language]);

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
        title: TRANSLATIONS[language].startRecording,
        description: TRANSLATIONS[language].recording,
      });
    } catch (error) {
      toast({
        title: TRANSLATIONS[language].error,
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
            title: TRANSLATIONS[language].error,
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
        title: TRANSLATIONS[language].error,
        description: TRANSLATIONS[language].required,
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

      const { data: { user } } = await supabase.auth.getUser();
      
      const formData = {
        title,
        description,
        sector_id: sectorId,
        language,
        submission_type: submissionType,
        is_public: true,
        attachments: uploadedFiles,
        state_id: selectedState ? parseInt(selectedState) : null,
        district_id: selectedDistrict ? parseInt(selectedDistrict) : null,
        user_id: user?.id || null,
        date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null,
        ...(submissionType === "feedback" && {
          feedback_category: feedbackCategory,
          user_name: userName || null,
          email: userEmail || null,
        }),
        ...(submissionType === "compliment" && {
          compliment_recipient: complimentRecipient,
          user_name: userName || null,
          email: userEmail || null,
        }),
        ...(submissionType === "complaint" && {
          user_name: userName,
          email: userEmail || null,
        }),
      };

      const { error } = await supabase
        .from("complaints")
        .insert(formData);

      if (error) throw error;

      toast({
        title: TRANSLATIONS[language].success,
        description: TRANSLATIONS[language].complaintSubmitted,
      });
      
      setTitle("");
      setDescription("");
      setSectorId("");
      setFiles([]);
      setUserName("");
      setUserEmail("");
      setFeedbackCategory("");
      setComplimentRecipient("");
      setSelectedState("");
      setSelectedDistrict("");
      setSelectedDate(undefined);
      setShowComplaintForm(false);
    } catch (error: any) {
      toast({
        title: TRANSLATIONS[language].error,
        description: error.message || TRANSLATIONS[language].complaintFailed,
        variant: "destructive",
      });
      console.error('Submission error:', error);
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

      <HeroSection />

      <div className="container mx-auto px-4 -mt-20 pb-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <InfoCards onVoiceConcernsClick={() => setShowComplaintForm(true)} />
        </div>
        
        <div className="mt-8">
          <AIComplaintBot />
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
                selectedState={selectedState}
                setSelectedState={setSelectedState}
                selectedDistrict={selectedDistrict}
                setSelectedDistrict={setSelectedDistrict}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewComplaint;
