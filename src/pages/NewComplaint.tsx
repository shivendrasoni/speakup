import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LanguageSelectionDialog } from "@/components/complaints/LanguageSelectionDialog";
import { ComplaintForm } from "@/components/complaints/ComplaintForm";
import { InfoCards } from "@/components/complaints/InfoCards";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ComplaintsNav } from "@/components/complaints/ComplaintsNav";
import { HeroSection } from "@/components/complaints/HeroSection";
import type { Sector, SubmissionType, LanguageCode, FeedbackCategory, ComplaintInsert } from "@/types/complaints";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useLanguage } from '@/contexts/LanguageContext';
import { VapiWidget } from '@/components/VapiWidget';

export const TRANSLATIONS = {
  english: {
    title: "Submit Your Voice",
    languageSelect: "Select Language",
    complaint: "Report a Complaint",
    feedback: "Share Feedback",
    compliment: "Give Compliment",
    sector: "Department/Sector",
    submit: "Submit",
    required: "Please fill in all required fields",
    success: "Successfully submitted!",
    error: "Error",
    description: "We're here to help you be heard",
    complaintSubmitted: "Your complaint has been submitted successfully",
    complaintFailed: "Failed to submit",
    startRecording: "Recording Started",
    recording: "Recording in progress...",
    changeLanguage: "Change Language",
    viewDashboard: "View Dashboard",
    placeholders: {
      date: "Pick a date"
    },
    peerSupport: "Peer Support",
    helpTitle: "Get Help from the Community",
    helpStep2Content: "Connect with others who have similar experiences",
    successStories: "Success Stories",
    helpTipsTitle: "Learn from Others",
    helpStep3Content: "Read about successful resolutions",
    resources: "Resources",
    helpStep2Title: "Available Support",
    viewMore: "View More",
    dashboard: {
      publicDashboard: "Public Complaints Dashboard",
      privateDashboard: "My Complaints Dashboard",
      registerComplaint: "Register Complaint",
      publicComplaints: "Public Complaints",
      myComplaints: "My Complaints",
      loadingStats: "Loading statistics...",
      noComplaints: "No complaints found for this category.",
      complaintsBySector: "Public Complaints by Sector",
      myComplaintsBySector: "My Complaints by Sector",
      complaintStatus: "Public Complaints Status",
      myComplaintStatus: "My Complaints Status",
      numberOfComplaints: "Number of Complaints",
      ofTotal: "% of total"
    },
    form: {
      progress: "Form Progress",
      formTypes: {
        complaint: "Complaint",
        feedback: "Feedback",
        compliment: "Compliment"
      },
      title: "Title",
      titlePlaceholder: "Brief title of your submission",
      titleHelp: "A brief title that describes your submission",
      submitting: "Submitting...",
      feedbackCategories: {
        platform_experience: "Platform Experience",
        response_time: "Response Time",
        accessibility: "Accessibility",
        other: "Other"
      },
      feedbackCategory: "Feedback Category",
      selectFeedbackCategory: "Select feedback category",
      complimentRecipient: "Who/What is this compliment for?",
      complimentPlaceholder: "Enter the name of person, department, or service",
      sectorHelp: "Select the department or sector related to your complaint",
      selectSector: "Select a sector"
    }
  },
  hindi: {
    title: "अपनी आवाज़ दर्ज करें",
    languageSelect: "भाषा चुनें",
    complaint: "शिकायत दर्ज करें",
    feedback: "प्रतिक्रिया साझा करें",
    compliment: "प्रशंसा करें",
    sector: "विभाग/क्षेत्र",
    submit: "जमा करें",
    required: "कृपया सभी आवश्यक फ़ील्ड भरें",
    success: "सफलतापूर्वक जमा किया गया!",
    error: "त्रुटि",
    description: "हम आपकी बात सुनने के लिए यहाँ हैं",
    complaintSubmitted: "आपकी शिकायत सफलतापूर्वक दर्ज कर ली गई है",
    complaintFailed: "जमा करने में विफल",
    startRecording: "रिकॉर्डिंग शुरू हुई",
    recording: "रिकॉर्डिंग जारी है...",
    changeLanguage: "भाषा बदलें",
    viewDashboard: "डैशबोर्ड देखें",
    placeholders: {
      date: "तारीख चुनें"
    },
    peerSupport: "सहकर्मी सहायता",
    helpTitle: "समुदाय से मदद लें",
    helpStep2Content: "समान अनुभव वाले लोगों से जुड़ें",
    successStories: "सफलता की कहानियां",
    helpTipsTitle: "दूसरों से सीखें",
    helpStep3Content: "सफल समाधानों के बारे में पढ़ें",
    resources: "संसाधन",
    helpStep2Title: "उपलब्ध सहायता",
    viewMore: "और देखें",
    dashboard: {
      publicDashboard: "सार्वजनिक शिकायत डैशबोर्ड",
      privateDashboard: "मेरी शिकायत डैशबोर्ड",
      registerComplaint: "शिकायत दर्ज करें",
      publicComplaints: "सार्वजनिक शिकायतें",
      myComplaints: "मेरी शिकायतें",
      loadingStats: "आंकड़े लोड हो रहे हैं...",
      noComplaints: "इस श्रेणी के लिए कोई शिकायत नहीं मिली।",
      complaintsBySector: "क्षेत्र के अनुसार सार्वजनिक शिकायतें",
      myComplaintsBySector: "क्षेत्र के अनुसार मेरी शिकायतें",
      complaintStatus: "सार्वजनिक शिकायत स्थिति",
      myComplaintStatus: "मेरी शिकायत स्थिति",
      numberOfComplaints: "शिकायतों की संख्या",
      ofTotal: "कुल का %"
    },
    form: {
      progress: "फॉर्म प्रगति",
      formTypes: {
        complaint: "शिकायत",
        feedback: "प्रतिक्रिया",
        compliment: "प्रशंसा"
      },
      title: "शीर्षक",
      titlePlaceholder: "अपनी शिकायत का संक्षिप्त शीर्षक",
      titleHelp: "एक संक्षिप्त शीर्षक जो आपकी शिकायत का वर्णन करता है",
      submitting: "जमा किया जा रहा है...",
      feedbackCategories: {
        platform_experience: "प्लेटफॉर्म अनुभव",
        response_time: "प्रतिक्रिया समय",
        accessibility: "पहुंच",
        other: "अन्य"
      },
      feedbackCategory: "प्रतिक्रिया श्रेणी",
      selectFeedbackCategory: "प्रतिक्रिया श्रेणी चुनें",
      complimentRecipient: "यह प्रशंसा किसके लिए है?",
      complimentPlaceholder: "व्यक्ति, विभाग या सेवा का नाम दर्ज करें",
      sectorHelp: "अपनी शिकायत से संबंधित विभाग या क्षेत्र चुनें",
      selectSector: "क्षेत्र चुनें"
    }
  },
  bengali: {
    title: "আপনার ভয়েস জমা দিন",
    languageSelect: "ভাষা নির্বাচন করুন",
    complaint: "অভিযোগ দাখিল করুন",
    feedback: "মতামত শেয়ার করুন",
    compliment: "প্রশংসা করুন",
    sector: "বিভাগ/সেক্টর",
    description: "বিগত",
    submit: "জমা দিন",
    required: "Please fill in all required fields",
    success: "Success",
    error: "Error",
    complaintSubmitted: "Your complaint has been submitted successfully",
    complaintFailed: "Failed to submit",
    startRecording: "Recording Started",
    recording: "Recording in progress...",
    changeLanguage: "Change Language",
    viewDashboard: "View Dashboard",
    placeholders: {
      date: "Pick a date"
    },
    peerSupport: "Peer Support",
    helpTitle: "Get Help from the Community",
    helpStep2Content: "Connect with others who have similar experiences",
    successStories: "Success Stories",
    helpTipsTitle: "Learn from Others",
    helpStep3Content: "Read about successful resolutions",
    resources: "Resources",
    helpStep2Title: "Available Support",
    viewMore: "View More"
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
    required: "Please fill in all required fields",
    success: "Success",
    error: "Error",
    complaintSubmitted: "Your complaint has been submitted successfully",
    complaintFailed: "Failed to submit",
    startRecording: "Recording Started",
    recording: "Recording in progress...",
    changeLanguage: "Change Language",
    viewDashboard: "View Dashboard",
    placeholders: {
      date: "Pick a date"
    },
    peerSupport: "Peer Support",
    helpTitle: "Get Help from the Community",
    helpStep2Content: "Connect with others who have similar experiences",
    successStories: "Success Stories",
    helpTipsTitle: "Learn from Others",
    helpStep3Content: "Read about successful resolutions",
    resources: "Resources",
    helpStep2Title: "Available Support",
    viewMore: "View More"
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
    required: "Please fill in all required fields",
    success: "Success",
    error: "Error",
    complaintSubmitted: "Your complaint has been submitted successfully",
    complaintFailed: "Failed to submit",
    startRecording: "Recording Started",
    recording: "Recording in progress...",
    changeLanguage: "Change Language",
    viewDashboard: "View Dashboard",
    placeholders: {
      date: "Pick a date"
    },
    peerSupport: "Peer Support",
    helpTitle: "Get Help from the Community",
    helpStep2Content: "Connect with others who have similar experiences",
    successStories: "Success Stories",
    helpTipsTitle: "Learn from Others",
    helpStep3Content: "Read about successful resolutions",
    resources: "Resources",
    helpStep2Title: "Available Support",
    viewMore: "View More"
  },
  gujarati: {
    title: "તમારો અવાજ સબમિટ કરો",
    languageSelect: "ભાષા પસંદ કરો",
    complaint: "ફરિયાદ નોંધાવો",
    feedback: "પ્રતિસાદ શેર કરો",
    compliment: "વખાણ કરો",
    sector: "વિભાગ/ક્ષેત્ર",
    description: "વેરવા",
    submit: "સબમિટ કરો",
    required: "Please fill in all required fields",
    success: "Success",
    error: "Error",
    complaintSubmitted: "Your complaint has been submitted successfully",
    complaintFailed: "Failed to submit",
    startRecording: "Recording Started",
    recording: "Recording in progress...",
    changeLanguage: "Change Language",
    viewDashboard: "View Dashboard",
    placeholders: {
      date: "Pick a date"
    },
    peerSupport: "Peer Support",
    helpTitle: "Get Help from the Community",
    helpStep2Content: "Connect with others who have similar experiences",
    successStories: "Success Stories",
    helpTipsTitle: "Learn from Others",
    helpStep3Content: "Read about successful resolutions",
    resources: "Resources",
    helpStep2Title: "Available Support",
    viewMore: "View More"
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
    required: "Please fill in all required fields",
    success: "Success",
    error: "Error",
    complaintSubmitted: "Your complaint has been submitted successfully",
    complaintFailed: "Failed to submit",
    startRecording: "Recording Started",
    recording: "Recording in progress...",
    changeLanguage: "Change Language",
    viewDashboard: "View Dashboard",
    placeholders: {
      date: "Pick a date"
    },
    peerSupport: "Peer Support",
    helpTitle: "Get Help from the Community",
    helpStep2Content: "Connect with others who have similar experiences",
    successStories: "Success Stories",
    helpTipsTitle: "Learn from Others",
    helpStep3Content: "Read about successful resolutions",
    resources: "Resources",
    helpStep2Title: "Available Support",
    viewMore: "View More"
  },
  malayalam: {
    title: "നിങ്ങളുടെ ശബ്ദം സമർപ്പിക്കുക",
    languageSelect: "ഭാഷ തിരഞ്ഞെടുക്കുക",
    complaint: "പരാതി റിപ്പോർട്ട് ചെയ്യുക",
    feedback: "ഫീഡ്‌ബാക്ക് പകിരവുക",
    compliment: "പ്രശംസ നൽകുക",
    sector: "വകുപ്പ്/മേഖല",
    description: "വിവരണം",
    submit: "സമർപ്പിക്കുക",
    required: "Please fill in all required fields",
    success: "Success",
    error: "Error",
    complaintSubmitted: "Your complaint has been submitted successfully",
    complaintFailed: "Failed to submit",
    startRecording: "Recording Started",
    recording: "Recording in progress...",
    changeLanguage: "Change Language",
    viewDashboard: "View Dashboard",
    placeholders: {
      date: "Pick a date"
    },
    peerSupport: "Peer Support",
    helpTitle: "Get Help from the Community",
    helpStep2Content: "Connect with others who have similar experiences",
    successStories: "Success Stories",
    helpTipsTitle: "Learn from Others",
    helpStep3Content: "Read about successful resolutions",
    resources: "Resources",
    helpStep2Title: "Available Support",
    viewMore: "View More"
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
    required: "Please fill in all required fields",
    success: "Success",
    error: "Error",
    complaintSubmitted: "Your complaint has been submitted successfully",
    complaintFailed: "Failed to submit",
    startRecording: "Recording Started",
    recording: "Recording in progress...",
    changeLanguage: "Change Language",
    viewDashboard: "View Dashboard",
    placeholders: {
      date: "Pick a date"
    },
    peerSupport: "Peer Support",
    helpTitle: "Get Help from the Community",
    helpStep2Content: "Connect with others who have similar experiences",
    successStories: "Success Stories",
    helpTipsTitle: "Learn from Others",
    helpStep3Content: "Read about successful resolutions",
    resources: "Resources",
    helpStep2Title: "Available Support",
    viewMore: "View More"
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
    required: "Please fill in all required fields",
    success: "Success",
    error: "Error",
    complaintSubmitted: "Your complaint has been submitted successfully",
    complaintFailed: "Failed to submit",
    startRecording: "Recording Started",
    recording: "Recording in progress...",
    changeLanguage: "Change Language",
    viewDashboard: "View Dashboard",
    placeholders: {
      date: "Pick a date"
    },
    peerSupport: "Peer Support",
    helpTitle: "Get Help from the Community",
    helpStep2Content: "Connect with others who have similar experiences",
    successStories: "Success Stories",
    helpTipsTitle: "Learn from Others",
    helpStep3Content: "Read about successful resolutions",
    resources: "Resources",
    helpStep2Title: "Available Support",
    viewMore: "View More"
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
    required: "Please fill in all required fields",
    success: "Success",
    error: "Error",
    complaintSubmitted: "Your complaint has been submitted successfully",
    complaintFailed: "Failed to submit",
    startRecording: "Recording Started",
    recording: "Recording in progress...",
    changeLanguage: "Change Language",
    viewDashboard: "View Dashboard",
    placeholders: {
      date: "Pick a date"
    },
    peerSupport: "Peer Support",
    helpTitle: "Get Help from the Community",
    helpStep2Content: "Connect with others who have similar experiences",
    successStories: "Success Stories",
    helpTipsTitle: "Learn from Others",
    helpStep3Content: "Read about successful resolutions",
    resources: "Resources",
    helpStep2Title: "Available Support",
    viewMore: "View More"
  }
} as const;

const NewComplaint = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sectorId, setSectorId] = useState("");
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(false);
  const { language } = useLanguage();
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
      
      const formData: ComplaintInsert = {
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
          feedback_category: feedbackCategory as FeedbackCategory,
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
      />

      <ComplaintsNav
        onLanguageClick={() => setShowLanguageDialog(true)}
        onVoiceConcernsClick={() => setShowComplaintForm(true)}
      />

      <HeroSection />

      <div className="container mx-auto px-4 -mt-20 pb-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <InfoCards 
            onVoiceConcernsClick={() => setShowComplaintForm(true)} 
          />
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
