
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
      <Label>
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
            type="button" // Prevent form submission on click
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "yyyy-MM-dd") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDateSelect}
            disabled={(date) => {
              const currentDate = new Date();
              currentDate.setHours(23, 59, 59, 999);
              return date > currentDate;
            }}
            initialFocus
            captionLayout="dropdown-buttons"
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
