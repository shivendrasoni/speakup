import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ComplaintForm } from "@/components/complaints/ComplaintForm";
import { LanguageSelectionDialog } from "@/components/complaints/LanguageSelectionDialog";
import { ComplaintsNav } from "@/components/complaints/ComplaintsNav";
import type { Database } from "@/integrations/supabase/types";
import type { LanguageCode, SubmissionType } from "@/types/complaints";
import { useLanguage } from "@/contexts/LanguageContext";

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
    // Navigation
    successStories: "Success Stories",
    resources: "Resources",
    peerSupport: "Peer Support",
    liveQA: "Live Q&A",
    aiHelp: "AI Help",
    // Help page
    helpTitle: "How to Report a Complaint",
    helpStep1Title: "Step 1: Choose Your Reporting Method",
    helpStep1Content: "You can report complaints either by creating an account or without logging in. Creating an account gives you additional features like tracking your complaints and receiving updates.",
    helpStep2Title: "Step 2: Provide Clear Information",
    helpStep2Items: [
      "Choose the relevant sector for your complaint",
      "Write a clear and concise title",
      "Provide detailed description of the issue",
      "Provide detailed description of the issue",
      "Include specific dates and locations if applicable"
    ],
    helpStep3Title: "Step 3: Submit and Track",
    helpStep3Content: "After submission, you'll receive a unique complaint ID. Keep this ID safe to track your complaint's status. Registered users can track their complaints directly from their dashboard.",
    helpTipsTitle: "Tips for Effective Reporting",
    helpTipsItems: [
      "Be specific and factual in your description",
      "Avoid using all caps or excessive punctuation",
      "Include relevant documentation if available",
      "Keep your complaint professional and objective"
    ]
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
    // Navigation
    successStories: "सफलता की कहानियाँ",
    resources: "संसाधन",
    peerSupport: "साथी सहायता",
    liveQA: "लाइव प्रश्नोत्तर",
    aiHelp: "एआई सहायता",
    // Help page
    helpTitle: "शिकायत कैसे दर्ज करें",
    helpStep1Title: "चरण 1: अपनी रिपोर्टिंग विधि चुनें",
    helpStep1Content: "आप खाता बनाकर या बिना लॉगिन किए शिकायतें दर्ज कर सकते हैं। खाता बनाने से आपको अपनी शिकायतों को ट्रैक करने और अपडेट प्राप्त करने जैसी अतिरिक्त सुविधाएं मिलती हैं।",
    helpStep2Title: "चरण 2: स्पष्ट जानकारी प्रदान करें",
    helpStep2Items: [
      "अपनी शिकायत के लिए प्रासंगिक क्षेत्र चुनें",
      "स्पष्ट और संक्षिप्त शीर्षक लिखें",
      "समस्या का विस्तृत विवरण प्रदान करें",
      "यदि लागू हो तो विशिष्ट तिथियां और स्थान शामिल करें"
    ],
    helpStep3Title: "चरण 3: जमा करें और ट्रैक करें",
    helpStep3Content: "जमा करने के बाद, आपको एक विशिष्ट शिकायत आईडी मिलेगी। अपनी शिकायत की स्थिति को ट्रैक करने के लिए इस आईडी को सुरक्षित रखें। पंजीकृत उपयोगकर्ता अपने डैशबोर्ड से सीधे अपनी शिकायतों को ट्रैक कर सकते हैं।",
    helpTipsTitle: "प्रभावी रिपोर्टिंग के लिए सुझाव",
    helpTipsItems: [
      "अपने विवरण में विशिष्ट और तथ्यात्मक रहें",
      "सभी कैप्स या अत्यधिक विराम चिह्नों का उपयोग न करें",
      "यदि उपलब्ध हो तो प्रासंगिक दस्तावेज़ शामिल करें",
      "अपनी शिकायत को पेशेवर और वस्तुनिष्ठ रखें"
    ]
  },
  bengali: {
    title: "আপনার মতামত পেশ করুন",
    languageSelect: "ভাষা নির্বাচন করুন",
    complaint: "অভিযোগ জানান",
    feedback: "মতামত দিন",
    compliment: "প্রশংসা করুন",
    sector: "বিভাগ/ক্ষেত্র",
    description: "বর্ণনা",
    submit: "জমা দিন",
    recording: "রেকর্ডিং চলছে...",
    startRecording: "ভয়েস ইনপুট শুরু করুন",
    stopRecording: "রেকর্ডিং বন্ধ করুন",
    viewDashboard: "পাবলিক ড্যাশবোর্ড দেখুন",
    changeLanguage: "ভাষা পরিবর্তন করুন",
     placeholders: {
      title: "আপনার বিষয়ের সংক্ষিপ্ত শিরোনাম",
      description: "বিস্তারিত বিবরণ",
      date: "তারিখ নির্বাচন করুন"
    },
    // Navigation
    successStories: "সাফল্যের গল্প",
    resources: "সংস্থান",
    peerSupport: "সমকক্ষ সহায়তা",
    liveQA: "সরাসরি প্রশ্নোত্তর",
    aiHelp: "এআই সহায়তা",
    // Help page
    helpTitle: "কীভাবে অভিযোগ জানাবেন",
    helpStep1Title: "ধাপ 1: আপনার রিপোর্টিং পদ্ধতি নির্বাচন করুন",
    helpStep1Content: "আপনি একটি অ্যাকাউন্ট তৈরি করে বা লগইন না করেও অভিযোগ জানাতে পারেন। একটি অ্যাকাউন্ট তৈরি করলে আপনি আপনার অভিযোগগুলি ট্র্যাক করতে এবং আপডেট পেতে অতিরিক্ত সুবিধা পাবেন।",
    helpStep2Title: "ধাপ ২: স্পষ্ট তথ্য প্রদান করুন",
    helpStep2Items: [
      "আপনার অভিযোগের জন্য প্রাসঙ্গিক ক্ষেত্র নির্বাচন করুন",
      "একটি স্পষ্ট এবং সংক্ষিপ্ত শিরোনাম লিখুন",
      "বিষয়টির বিস্তারিত বিবরণ দিন",
      "প্রযোজ্য হলে নির্দিষ্ট তারিখ এবং স্থান অন্তর্ভুক্ত করুন"
    ],
    helpStep3Title: "ধাপ 3: জমা দিন এবং ট্র্যাক করুন",
    helpStep3Content: "জমা দেওয়ার পরে, আপনি একটি অনন্য অভিযোগ আইডি পাবেন। আপনার অভিযোগের স্থিতি ট্র্যাক করতে এই আইডিটি নিরাপদে রাখুন। নিবন্ধিত ব্যবহারকারীরা তাদের ড্যাশবোর্ড থেকে সরাসরি তাদের অভিযোগগুলি ট্র্যাক করতে পারেন।",
    helpTipsTitle: "কার্যকর রিপোর্টিংয়ের জন্য টিপস",
    helpTipsItems: [
      "আপনার বর্ণনায় নির্দিষ্ট এবং তথ্যপূর্ণ হন",
      "সমস্ত ক্যাপস বা অতিরিক্ত বিরাম চিহ্ন ব্যবহার করা এড়িয়ে চলুন",
      "যদি পাওয়া যায় তবে প্রাসঙ্গিক ডকুমেন্টেশন অন্তর্ভুক্ত করুন",
      "আপনার অভিযোগ পেশাদার এবং উদ্দেশ্যমূলক রাখুন"
    ]
  },
  telugu: {
    title: "మీ స్వరాన్ని సమర్పించండి",
    languageSelect: "భాషను ఎంచుకోండి",
    complaint: "ఫిర్యాదును నివేదించండి",
    feedback: "అభిప్రాయాన్ని పంచుకోండి",
    compliment: "అభినందించండి",
    sector: "విభాగం/రంగం",
    description: "వివరణ",
    submit: "సమర్పించండి",
    recording: "రికార్డింగ్...",
    startRecording: "వాయిస్ ఇన్పుట్ ప్రారంభించండి",
    stopRecording: "రికార్డింగ్ ఆపండి",
    viewDashboard: "ప్రజా డాష్‌బోర్డ్‌ను చూడండి",
    changeLanguage: "భాష మార్చండి",
     placeholders: {
      title: "మీ సమర్పణ యొక్క సంక్షిప్త శీర్షిక",
      description: "వివరణాత్మక వివరణ",
      date: "తేదీని ఎంచుకోండి"
    },
    // Navigation
    successStories: "విజయ గాథలు",
    resources: "వనరులు",
    peerSupport: "సహచరుల మద్దతు",
    liveQA: "ప్రత్యక్ష ప్రశ్నలు & సమాధానాలు",
    aiHelp: "AI సహాయం",
    // Help page
    helpTitle: "ఫిర్యాదును ఎలా నివేదించాలి",
    helpStep1Title: "దశ 1: మీ రిపోర్టింగ్ పద్ధతిని ఎంచుకోండి",
    helpStep1Content: "మీరు ఖాతాను సృష్టించడం ద్వారా లేదా లాగిన్ చేయకుండా ఫిర్యాదులను నివేదించవచ్చు. ఖాతాను సృష్టించడం వలన మీ ఫిర్యాదులను ట్రాక్ చేయడం మరియు నవీకరణలను స్వీకరించడం వంటి అదనపు ఫీచర్లు మీకు లభిస్తాయి.",
    helpStep2Title: "దశ 2: స్పష్టమైన సమాచారాన్ని అందించండి",
    helpStep2Items: [
      "మీ ఫిర్యాదుకు సంబంధించిన రంగాన్ని ఎంచుకోండి",
      "స్పష్టమైన మరియు సంక్షిప్త శీర్షికను వ్రాయండి",
      "సమస్య యొక్క వివరణాత్మక వివరణను అందించండి",
      "వర్తించే చోట నిర్దిష్ట తేదీలు మరియు స్థానాలను చేర్చండి"
    ],
    helpStep3Title: "దశ 3: సమర్పించండి మరియు ట్రాక్ చేయండి",
    helpStep3Content: "సమర్పించిన తర్వాత, మీరు ఒక ప్రత్యేకమైన ఫిర్యాదు IDని అందుకుంటారు. మీ ఫిర్యాదు యొక్క స్థితిని ట్రాక్ చేయడానికి ఈ IDని సురక్షితంగా ఉంచుకోండి. నమోదు చేసుకున్న వినియోగదారులు వారి డాష్‌బోర్డ్ నుండి నేరుగా వారి ఫిర్యాదులను ట్రాక్ చేయవచ్చు.",
    helpTipsTitle: "సమర్థవంతమైన రిపోర్టింగ్ కోసం చిట్కాలు",
    helpTipsItems: [
      "మీ వివరణలో నిర్దిష్టంగా మరియు వాస్తవికంగా ఉండండి",
      "అన్ని క్యాప్స్ లేదా అధిక విరామ చిహ్నాలను ఉపయోగించడం మానుకోండి",
      "అందుబాటులో ఉంటే సంబంధిత డాక్యుమెంటేషన్‌ను చేర్చండి",
      "మీ ఫిర్యాదును వృత్తిపరంగా మరియు లక్ష్యంగా ఉంచండి"
    ]
  },
  marathi: {
    title: "आपली तक्रार नोंदवा",
    languageSelect: "भाषा निवडा",
    complaint: "तक्रार नोंदवा",
    feedback: "अभिप्राय द्या",
    compliment: "कौतुक करा",
    sector: "विभाग/क्षेत्र",
    description: "वर्णन",
    submit: "सबमिट करा",
    recording: "रेकॉर्डिंग...",
    startRecording: "व्हॉइस इनपुट सुरू करा",
    stopRecording: "रेकॉर्डिंग थांबवा",
    viewDashboard: "सार्वजनिक डॅशबोर्ड पहा",
    changeLanguage: "भाषा बदला",
    placeholders: {
      title: "आपल्या सबमिशनचे संक्षिप्त शीर्षक",
      description: "तपशीलवार वर्णन",
      date: "तारीख निवडा"
    },
    successStories: "यशोगाथा",
    resources: "संसाधने",
    peerSupport: "समकक्ष सहाय्य",
    liveQA: "थेट प्रश्नोत्तरे",
    aiHelp: "AI मदत",
    helpTitle: "तक्रार कशी नोंदवावी",
    helpStep1Title: "पहिले पाऊल: आपली नोंदणी पद्धत निवडा",
    helpStep1Content: "आपण खाते तयार करून किंवा लॉगिन न करता तक्रारी नोंदवू शकता. खाते तयार केल्याने आपल्याला आपल्या तक्रारींचा मागोवा घेणे आणि अपडेट्स प्राप्त करणे यासारख्या अतिरिक्त सुविधा मिळतील.",
    helpStep2Title: "दुसरे पाऊल: स्पष्ट माहिती द्या",
    helpStep2Items: [
      "आपल्या तक्रारीसाठी संबंधित क्षेत्र निवडा",
      "स्पष्ट आणि संक्षिप्त शीर्षक लिहा",
      "समस्येचे तपशीलवार वर्णन द्या",
      "लागू असल्यास विशिष्ट तारखा आणि स्थाने समाविष्ट करा"
    ],
    helpStep3Title: "तिसरे पाऊल: सबमिट करा आणि मागोवा घ्या",
    helpStep3Content: "सबमिट केल्यानंतर, आपल्याला एक अद्वितीय तक्रार ID मिळेल. आपल्या तक्रारीची स्थिती ट्रॅक करण्यासाठी ही ID सुरक्षित ठेवा. नोंदणीकृत वापरकर्ते त्यांच्या डॅशबोर्डवरून थेट त्यांच्या तक्रारींचा मागोवा घेऊ शकतात.",
    helpTipsTitle: "प्रभावी नोंदणीसाठी टिप्स",
    helpTipsItems: [
      "आपल्या वर्णनात विशिष्ट आणि तथ्यात्मक रहा",
      "सर्व कॅप्स किंवा अतिरिक्त विरामचिन्हांचा वापर टाळा",
      "उपलब्ध असल्यास संबंधित कागदपत्रे समाविष्ट करा",
      "आपली तक्रार व्यावसायिक आणि उद्देशपूर्ण ठेवा"
    ]
  },
  tamil: {
    title: "உங்கள் குரலைப் பதிவு செய்யுங்கள்",
    languageSelect: "மொழியைத் தேர்ந்தெடுக்கவும்",
    complaint: "புகார் அளிக்கவும்",
    feedback: "கருத்து தெரிவிக்கவும்",
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
      description: "விரிவான விளக்கம்",
      date: "தேதியைத் தேர்ந்தெடுக்கவும்"
    },
    successStories: "வெற்றிக் கதைகள்",
    resources: "வளங்கள்",
    peerSupport: "சக ஆதரவு",
    liveQA: "நேரடி கேள்வி & பதில்",
    aiHelp: "AI உதவி",
    helpTitle: "புகார் எப்படி அளிப்பது",
    helpStep1Title: "படி 1: உங்கள் அறிக்கை முறையைத் தேர்ந்தெடுக்கவும்",
    helpStep1Content: "கணக்கை உருவாக்குவதன் மூலமோ அல்லது உள்நுழையாமலோ புகார்களை அளிக்கலாம். கணக்கை உருவாக்குவதால் உங்கள் புகார்களைக் கண்காணித்தல் மற்றும் புதுப்பிப்புகளைப் பெறுதல் போன்ற கூடுதல் அம்சங்கள் கிடைக்கும்.",
    helpStep2Title: "படி 2: தெளிவான தகவலை வழங்கவும்",
    helpStep2Items: [
      "உங்கள் புகாருக்கான தொடர்புடைய துறையைத் தேர்ந்தெடுக்கவும்",
      "தெளிவான மற்றும் சுருக்கமான தலைப்பை எழுதவும்",
      "பிரச்சனையின் விரிவான விளக்கத்தை வழங்கவும்",
      "பொருந்தக்கூடிய தேதிகள் மற்றும் இடங்களை சேர்க்கவும்"
    ],
    helpStep3Title: "படி 3: சமர்ப்பித்து கண்காணிக்கவும்",
    helpStep3Content: "சமர்ப்பித்த பிறகு, நீங்கள் ஒரு தனித்துவமான புகார் IDஐப் பெறுவீர்கள். உங்கள் புகாரின் நிலையைக் கண்காணிக்க இந்த IDஐப் பாதுகாப்பாக வைத்திருக்கவும். பதிவுசெய்த பயனர்கள் தங்கள் டாஷ்போர்டில் இருந்து நேரடியாக தங்கள் புகார்களைக் கண்காணிக்கலாம்.",
    helpTipsTitle: "சிறந்த அறிக்கைக்கான உதவிக்குறிப்புகள்",
    helpTipsItems: [
      "உங்கள் விளக்கத்தில் குறிப்பிட்டதாகவும் உண்மையாகவும் இருக்கவும்",
      "அனைத்து கேப்ஸ் அல்லது அதிக நிறுத்தற்குறிகளைப் பயன்படுத்துவதைத் தவிர்க்கவும்",
      "கிடைக்கும் தொடர்புடைய ஆவணங்களை சேர்க்கவும்",
      "உங்கள் புகாரை தொழில்முறையாகவும் நோக்கம் கொண்டதாகவும் வைத்திருக்கவும்"
    ]
  },
  gujarati: {
    title: "તમારો અવાજ રજૂ કરો",
    languageSelect: "ભાષા પસંદ કરો",
    complaint: "ફરિયાદ નોંધાવો",
    feedback: "પ્રતિસાદ આપો",
    compliment: "વખાણ કરો",
    sector: "વિભાગ/ક્ષેત્ર",
    description: "વર્ણન",
    submit: "સબમિટ કરો",
    recording: "રેકોર્ડિંગ...",
    startRecording: "વૉઇસ ઇનપુટ શરૂ કરો",
    stopRecording: "રેકોર્ડિંગ બંધ કરો",
    viewDashboard: "પબ્લિક ડેશબોર્ડ જુઓ",
    changeLanguage: "ભાષા બદલો",
    placeholders: {
      title: "તમારી સબમિશનનું ટૂંકું શીર્ષક",
      description: "વિગતવાર વર્ણન",
      date: "તારીખ પસંદ કરો"
    },
    successStories: "સફળતાની વાતો",
    resources: "સંસાધનો",
    peerSupport: "સાથી સહાય",
    liveQA: "લાઇવ પ્રશ્નોત્તરી",
    aiHelp: "AI મદદ",
    helpTitle: "ફરિયાદ કેવી રીતે નોંધાવવી",
    helpStep1Title: "પગલું 1: તમારી રિપોર્ટિંગ પદ્ધતિ પસંદ કરો",
    helpStep1Content: "તમે એકાઉન્ટ બનાવીને અથવા લૉગિન કર્યા વિના ફરિયાદો નોંધાવી શકો છો. એકાઉન્ટ બનાવવાથી તમને તમારી ફરિયાદોને ટ્રૅક કરવી અને અપડેટ્સ મેળવવા જેવી વધારાની સુવિધાઓ મળે છે.",
    helpStep2Title: "પગલું 2: સ્પષ્ટ માહિતી આપો",
    helpStep2Items: [
      "તમારી ફરિયાદ માટે સંબંધિત ક્ષેત્ર પસંદ કરો",
      "સ્પષ્ટ અને ટૂંકું શીર્ષક લખો",
      "સમસ્યાનું વિગતવાર વર્ણન આપો",
      "લાગુ પડતી તારીખો અને સ્થળો શામેલ કરો"
    ],
    helpStep3Title: "પગલું 3: સબમિટ કરો અને ટ્રૅક કરો",
    helpStep3Content: "સબમિટ કર્યા પછી, તમને એક વિશિષ્ટ ફરિયાદ ID મળશે. તમારી ફરિયાદની સ્થિતિને ટ્રૅક કરવા માટે આ ID સુરક્ષિત રાખો. નોંધાયેલા વપરાશકર્તાઓ તેમના ડેશબોર્ડમાંથી સીધી જ તેમની ફરિયાદોને ટ્રૅક કરી શકે છે.",
    helpTipsTitle: "અસરકારક રિપોર્ટિંગ માટેની ટિપ્સ",
    helpTipsItems: [
      "તમારા વર્ણનમાં ચોક્કસ અને હકીકતલક્ષી રહો",
      "બધા કેપ્સ અથવા વધારે પડતા વિરામચિહ્નોનો ઉપયોગ ટાળો",
      "જો ઉપલબ્ધ હોય તો સંબંધિત દસ્તાવેજીકરણ શામેલ કરો",
      "તમારી ફરિયાદને વ્યાવસાયિક અને હેતુલક્ષી રાખો"
    ]
  },
  kannada: {
    title: "ನಿಮ್ಮ ಧ್ವನಿಯನ್ನು ಸಲ್ಲಿಸಿ",
    languageSelect: "ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    complaint: "ದೂರು ದಾಖಲಿಸಿ",
    feedback: "ಪ್ರತಿಕ್ರಿಯೆ ನೀಡಿ",
    compliment: "ಹೊಗಳಿಕೆ ನೀಡಿ",
    sector: "ವಿಭಾಗ/ಕ್ಷೇತ್ರ",
    description: "ವಿವರಣೆ",
    submit: "ಸಲ್ಲಿಸಿ",
    recording: "ರೆಕಾರ್ಡಿಂಗ್...",
    startRecording: "ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಪ್ರಾರಂಭಿಸಿ",
    stopRecording: "ರೆಕಾರ್ಡಿಂಗ್ ನಿಲ್ಲಿಸಿ",
    viewDashboard: "ಸಾರ್ವಜನಿಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ವೀಕ್ಷಿಸಿ",
    changeLanguage: "ಭಾಷೆ ಬದಲಾಯಿಸಿ",
    placeholders: {
      title: "ನಿಮ್ಮ ಸಲ್ಲಿಕೆಯ ಸಂಕ್ಷಿಪ್ತ ಶೀರ್ಷಿಕೆ",
      description: "ವಿವರವಾದ ವಿವರಣೆ",
      date: "ದಿನಾಂಕವನ್ನು ಆಯ್ಕೆಮಾಡಿ"
    },
    successStories: "ಯಶಸ್ಸಿನ ಕಥೆಗಳು",
    resources: "ಸಂಪನ್ಮೂಲಗಳು",
    peerSupport: "ಸಹವರ್ತಿ ಬೆಂಬಲ",
    liveQA: "ನೇರ ಪ್ರಶ್ನೆ & ಉತ್ತರ",
    aiHelp: "AI ಸಹಾಯ",
    helpTitle: "ದೂರು ಹೇಗೆ ದಾಖಲಿಸಬೇಕು",
    helpStep1Title: "ಹಂತ 1: ನಿಮ್ಮ ವರದಿ ವಿಧಾನವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    helpStep1Content: "ಖಾತೆಯನ್ನು ರಚಿಸುವ ಮೂಲಕ ಅಥವಾ ಲಾಗಿನ್ ಮಾಡದೆ ನೀವು ದೂರುಗಳನ್ನು ದಾಖಲಿಸಬಹುದು. ಖಾತೆಯನ್ನು ರಚಿಸುವುದರಿಂದ ನಿಮ್ಮ ದೂರುಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡುವುದು ಮತ್ತು ನವೀಕರಣಗಳನ್ನು ಸ್ವೀಕರಿಸುವಂತಹ ಹೆಚ್ಚುವರಿ ವೈಶಿಷ್ಟ್ಯಗಳನ್ನು ನೀವು ಪಡೆಯುತ್ತೀರಿ.",
    helpStep2Title: "ಹಂತ 2: ಸ್ಪಷ್ಟ ಮಾಹಿತಿಯನ್ನು ಒದಗಿಸಿ",
    helpStep2Items: [
      "ನಿಮ್ಮ ದೂರಿಗೆ ಸಂಬಂಧಿಸಿದ ಕ್ಷೇತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
      "ಸ್ಪಷ್ಟ ಮತ್ತು ಸಂಕ್ಷಿಪ್ತ ಶೀರ್ಷಿಕೆಯನ್ನು ಬರೆಯಿರಿ",
      "ಸಮಸ್ಯೆಯ ವಿವರವಾದ ವಿವರಣೆಯನ್ನು ನೀಡಿ",
      "ಅನ್ವಯಿಸುವ ದಿನಾಂಕಗಳು ಮತ್ತು ಸ್ಥಳಗಳನ್ನು ಸೇರಿಸಿ"
    ],
    helpStep3Title: "ಹಂತ 3: ಸಲ್ಲಿಸಿ ಮತ್ತು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ",
    helpStep3Content: "ಸಲ್ಲಿಸಿದ ನಂತರ, ನೀವು ಅನನ್ಯ ದೂರು ID ಯನ್ನು ಸ್ವೀಕರಿಸುತ್ತೀರಿ. ನಿಮ್ಮ ದೂರಿನ ಸ್ಥಿತಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು ಈ ID ಯನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಇರಿಸಿ. ನೋಂದಾಯಿತ ಬಳಕೆದಾರರು ತಮ್ಮ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಿಂದ ನೇರವಾಗಿ ತಮ್ಮ ದೂರುಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಬಹುದು.",
    helpTipsTitle: "ಪರಿಣಾಮಕಾರಿ ವರದಿಮಾಡುವಿಕೆಗಾಗಿ ಸಲಹೆಗಳು",
    helpTipsItems: [
      "ನಿಮ್ಮ ವಿವರಣೆಯಲ್ಲಿ ನಿರ್ದಿಷ್ಟ ಮತ್ತು ವಾಸ್ತವಿಕವಾಗಿರಿ",
      "ಎಲ್ಲಾ ಕ್ಯಾಪ್ಸ್ ಅಥವಾ ಅತಿಯಾದ ವಿರಾಮಚಿಹ್ನೆಗಳ ಬಳಕೆಯನ್ನು ತಪ್ಪಿಸಿ",
      "ಲಭ್ಯವಿದ್ದರೆ ಸಂಬಂಧಿತ ದಾಖಲೆಗಳನ್ನು ಸೇರಿಸಿ",
      "ನಿಮ್ಮ ದೂರನ್ನು ವೃತ್ತಿಪರ ಮತ್ತು ಉದ್ದೇಶಪೂರ್ವಕವಾಗಿರಿಸಿ"
    ]
  }
} as const;

const NewComplaint = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sectorId, setSectorId] = useState("");
  const [sectors, setSectors] = useState<Database["public"]["Tables"]["sectors"]["Row"][]>([]);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [submissionType, setSubmissionType] = useState<SubmissionType>("complaint");
  const [languageDialog, setLanguageDialog] = useState(false);
  const [feedbackCategory, setFeedbackCategory] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [complimentRecipient, setComplimentRecipient] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { language } = useLanguage();

  useEffect(() => {
    const fetchSectors = async () => {
      const { data, error } = await supabase
        .from("sectors")
        .select("*")
        .order("name");

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load sectors",
          variant: "destructive",
        });
      } else {
        setSectors(data || []);
      }
    };

    fetchSectors();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to submit a complaint.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("complaints").insert([
        {
          title,
          description,
          sector_id: sectorId,
          user_id: user.id,
        },
      ]);

      if (error) {
        console.error("Error submitting complaint:", error);
        toast({
          title: "Error",
          description: "Failed to submit complaint. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Complaint submitted successfully!",
        });
        navigate("/complaints");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    // Implement your recording logic here
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // Implement your stop recording logic here
  };

  const handleShowLanguageDialog = () => {
    setLanguageDialog(true);
  };

  return (
    <div>
      <ComplaintsNav
        onLanguageClick={handleShowLanguageDialog}
        onVoiceConcernsClick={() => console.log("Voice Concerns Clicked")}
      />
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>{TRANSLATIONS[language].title}</CardTitle>
          </CardHeader>
          <CardContent>
            <LanguageSelectionDialog
              open={languageDialog}
              onOpenChange={setLanguageDialog}
            />
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
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              onShowLanguageDialog={handleShowLanguageDialog}
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
      </div>
    </div>
  );
};

export default NewComplaint;
