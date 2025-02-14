
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
  common: {
    welcome: string;
    login: string;
    signup: string;
    email: string;
    password: string;
    help: string;
    dashboard: string;
    complaints: string;
    community: string;
    logout: string;
    submit: string;
    cancel: string;
  };
  placeholders: {
    title: string;
    description: string;
  };
};

export type TranslationsType = {
  [key in LanguageCode]: TranslationType;
};
