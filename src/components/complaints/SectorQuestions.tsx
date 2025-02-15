
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  question: string;
  type: "text" | "select" | "radio" | "checkbox" | "date";
  required: boolean;
  options?: string[];
  description?: string;
}

interface SubCategory {
  id: string;
  name: string;
  questions: Question[];
}

interface SectorQuestionsProps {
  sectorId: string;
  answers: Record<string, any>;
  setAnswers: (answers: Record<string, any>) => void;
}

export function SectorQuestions({ sectorId, answers, setAnswers }: SectorQuestionsProps) {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSectorData = async () => {
      try {
        const { data, error } = await supabase
          .from('sectors')
          .select('sub_categories, questions')
          .eq('id', sectorId)
          .single();

        if (error) throw error;

        // Handle sub-categories
        const rawSubCategories = data?.sub_categories as any[] || [];
        const validSubCategories = rawSubCategories.filter((sc): sc is SubCategory => {
          return (
            typeof sc?.id === 'string' &&
            typeof sc?.name === 'string' &&
            Array.isArray(sc?.questions)
          );
        });
        setSubCategories(validSubCategories);

        // Handle legacy questions (if any)
        const rawQuestions = data?.questions as any[] || [];
        if (Array.isArray(rawQuestions) && rawQuestions.length > 0) {
          const isValidQuestion = (q: any): q is Question => {
            return (
              typeof q?.id === 'string' &&
              typeof q?.question === 'string' &&
              ['text', 'select', 'radio', 'checkbox', 'date'].includes(q?.type) &&
              typeof q?.required === 'boolean' &&
              (!q?.options || Array.isArray(q?.options)) &&
              (!q?.description || typeof q?.description === 'string')
            );
          };
          setQuestions(rawQuestions.filter(isValidQuestion));
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching sector data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (sectorId) {
      fetchSectorData();
    }
  }, [sectorId]);

  useEffect(() => {
    if (selectedSubCategory) {
      const subCategory = subCategories.find(sc => sc.id === selectedSubCategory);
      setQuestions(subCategory?.questions || []);
    }
  }, [selectedSubCategory, subCategories]);

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  if (loading) return <div>Loading questions...</div>;
  if (error) return <div>Error loading questions: {error}</div>;

  return (
    <div className="space-y-6">
      {subCategories.length > 0 && (
        <div className="space-y-2">
          <Label>Sub-category</Label>
          <Select
            value={selectedSubCategory}
            onValueChange={setSelectedSubCategory}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select a sub-category" />
            </SelectTrigger>
            <SelectContent>
              {subCategories.map((subCategory) => (
                <SelectItem key={subCategory.id} value={subCategory.id}>
                  {subCategory.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Date of Incident/Concern */}
      <div className="space-y-2">
        <Label>Date of Incident/Concern *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !answers.incidentDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {answers.incidentDate ? format(answers.incidentDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={answers.incidentDate}
              onSelect={(date) => handleAnswerChange('incidentDate', date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Render questions based on selected sub-category */}
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

          {question.type === 'date' && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !answers[question.id] && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {answers[question.id] ? format(answers[question.id], "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={answers[question.id]}
                  onSelect={(date) => handleAnswerChange(question.id, date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      ))}
    </div>
  );
}
