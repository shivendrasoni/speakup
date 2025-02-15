
export interface Question {
  id: string;
  question: string;
  type: "text" | "select" | "radio" | "checkbox" | "date";
  required: boolean;
  options?: string[];
  description?: string;
}

export interface SubCategory {
  id: string;
  name: string;
  questions: Question[];
}

export interface SectorQuestionsProps {
  sectorId: string;
  answers: Record<string, any>;
  setAnswers: (answers: Record<string, any>) => void;
}
