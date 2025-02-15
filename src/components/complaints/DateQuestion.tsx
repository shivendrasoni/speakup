
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { SubmissionType } from "@/types/complaints";

interface DateQuestionProps {
  label: string;
  required?: boolean;
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  questionId: string;
  submissionType?: SubmissionType;
}

export function DateQuestion({ 
  label, 
  required, 
  value, 
  onChange, 
  questionId,
  submissionType 
}: DateQuestionProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={questionId}>
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={questionId}
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal bg-white",
              !value && "text-muted-foreground"
            )}
            type="button"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            disabled={(date) => {
              // Disable future dates
              return date > new Date();
            }}
            initialFocus
            fromYear={1900}
            toYear={new Date().getFullYear()}
          />
        </PopoverContent>
      </Popover>
      <input 
        type="hidden" 
        name={questionId} 
        value={value ? format(value, "yyyy-MM-dd") : ''} 
      />
    </div>
  );
}
