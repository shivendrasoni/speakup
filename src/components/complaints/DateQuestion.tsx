
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { SubmissionType, LanguageCode } from "@/types/complaints";
import { TRANSLATIONS } from "@/pages/NewComplaint";

interface DateQuestionProps {
  label: string;
  required?: boolean;
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  questionId: string;
  submissionType?: SubmissionType;
  language: LanguageCode;
}

export function DateQuestion({ 
  label, 
  required, 
  value, 
  onChange, 
  questionId,
  submissionType,
  language = "english"
}: DateQuestionProps) {
  const today = new Date();
  today.setHours(23, 59, 59, 999); // Set to end of day to allow selecting today

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Ensure the date is set to local midnight
      const localDate = new Date(date);
      localDate.setHours(0, 0, 0, 0);
      onChange(localDate);
    } else {
      onChange(undefined);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={questionId}>
        {label}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={questionId}
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal bg-white hover:bg-gray-50",
              !value && "text-muted-foreground"
            )}
            type="button"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP") : TRANSLATIONS[language].placeholders?.date || "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDateSelect}
            disabled={(date) => {
              // Convert both dates to midnight for accurate comparison
              const compareDate = new Date(date);
              compareDate.setHours(0, 0, 0, 0);
              const todayMidnight = new Date();
              todayMidnight.setHours(0, 0, 0, 0);
              
              // Allow today and past dates, disable future dates
              return compareDate > todayMidnight;
            }}
            initialFocus
            captionLayout="dropdown"
            fromYear={1900}
            toYear={new Date().getFullYear()}
            classNames={{
              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              day_today: "bg-accent text-accent-foreground",
              day: cn(
                "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
              ),
            }}
          />
        </PopoverContent>
      </Popover>
      <input 
        type="hidden" 
        name={questionId} 
        value={value ? format(value, 'yyyy-MM-dd') : ''} 
      />
    </div>
  );
}
