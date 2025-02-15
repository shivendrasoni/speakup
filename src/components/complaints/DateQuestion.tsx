
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
              // Only restrict future dates for complaints
              if (submissionType === 'complaint') {
                return date > today;
              }
              return false;
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
