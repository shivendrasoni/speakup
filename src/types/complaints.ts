
export type LanguageCode = "english" | "hindi" | "bengali" | "telugu" | "marathi" | "tamil" | "gujarati" | "kannada" | "odia" | "punjabi" | "malayalam";
export type SubmissionType = "complaint" | "feedback" | "compliment";

type TranslationType = {
  title: string;
  languageSelect: string;
  complaint: string;
  feedback: string;
  compliment: string;
  sector: string;
  description: string;
  submit: string;
  recording: string;
  startRecording: string;
  stopRecording: string;
  viewDashboard: string;
  changeLanguage: string;
  placeholders: {
    title: string;
    description: string;
  };
};

export type TranslationsType = {
  [key in LanguageCode]: TranslationType;
};
