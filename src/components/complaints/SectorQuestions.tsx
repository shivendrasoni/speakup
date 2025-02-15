
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Question {
  id: string;
  question: string;
  type: "text" | "select" | "radio" | "checkbox";
  required: boolean;
  options?: string[];
  description?: string;
}

interface SectorQuestionsProps {
  sectorId: string;
  answers: Record<string, any>;
  setAnswers: (answers: Record<string, any>) => void;
}

export function SectorQuestions({ sectorId, answers, setAnswers }: SectorQuestionsProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSectorQuestions = async () => {
      try {
        const { data, error } = await supabase
          .from('sectors')
          .select('questions')
          .eq('id', sectorId)
          .single();

        if (error) throw error;
        
        // Properly type and validate the questions data
        const questionsData = data?.questions as Question[] || [];
        
        // Validate that the data matches our Question interface
        const validQuestions = questionsData.filter((q): q is Question => {
          return (
            typeof q.id === 'string' &&
            typeof q.question === 'string' &&
            ['text', 'select', 'radio', 'checkbox'].includes(q.type) &&
            typeof q.required === 'boolean'
          );
        });

        setQuestions(validQuestions);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching sector questions:', err);
      } finally {
        setLoading(false);
      }
    };

    if (sectorId) {
      fetchSectorQuestions();
    }
  }, [sectorId]);

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  if (loading) return <div>Loading questions...</div>;
  if (error) return <div>Error loading questions: {error}</div>;
  if (!questions.length) return null;

  return (
    <div className="space-y-6">
      {questions.map((question) => (
        <div key={question.id} className="space-y-2">
          <Label className="flex items-center">
            {question.question}
            {question.required && <span className="text-red-500 ml-1">*</span>}
            {question.description && (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Info className="h-4 w-4 text-gray-500 cursor-help inline-block ml-1" />
                </HoverCardTrigger>
                <HoverCardContent className="w-80 p-3 text-sm">
                  {question.description}
                </HoverCardContent>
              </HoverCard>
            )}
          </Label>

          {question.type === 'text' && (
            <Input
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              required={question.required}
            />
          )}

          {question.type === 'select' && question.options && (
            <Select
              value={answers[question.id] || ''}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {question.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {question.type === 'radio' && question.options && (
            <RadioGroup
              value={answers[question.id] || ''}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
            >
              {question.options.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                  <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {question.type === 'checkbox' && question.options && (
            <div className="space-y-2">
              {question.options.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${question.id}-${option}`}
                    checked={answers[question.id]?.includes(option)}
                    onCheckedChange={(checked) => {
                      const currentValues = answers[question.id] || [];
                      const newValues = checked
                        ? [...currentValues, option]
                        : currentValues.filter((v: string) => v !== option);
                      handleAnswerChange(question.id, newValues);
                    }}
                  />
                  <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
