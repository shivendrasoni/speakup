
import { Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { DateQuestion } from "./DateQuestion";
import type { Question } from "./types";

interface DynamicQuestionProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
}

export function DynamicQuestion({ question, value, onChange }: DynamicQuestionProps) {
  return (
    <div className="space-y-2">
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
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={question.required}
        />
      )}

      {question.type === 'select' && question.options && (
        <Select
          value={value || ''}
          onValueChange={onChange}
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
          value={value || ''}
          onValueChange={onChange}
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
                checked={value?.includes(option)}
                onCheckedChange={(checked) => {
                  const currentValues = value || [];
                  const newValues = checked
                    ? [...currentValues, option]
                    : currentValues.filter((v: string) => v !== option);
                  onChange(newValues);
                }}
              />
              <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
            </div>
          ))}
        </div>
      )}

      {question.type === 'date' && (
        <DateQuestion
          label=""
          value={value}
          onChange={onChange}
          questionId={question.id}
        />
      )}
    </div>
  );
}
