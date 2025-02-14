
import type { Database } from "@/integrations/supabase/types";

export type LanguageCode = "english" | "hindi" | "bengali" | "telugu" | "marathi" | "tamil" | "gujarati" | "kannada" | "odia" | "punjabi" | "malayalam";

export type SubmissionType = Database["public"]["Enums"]["submission_type"];

export type Sector = Database["public"]["Tables"]["sectors"]["Row"];

export type FeedbackCategory = Database["public"]["Enums"]["feedback_category"];
