
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Info } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface DescriptionFieldProps {
  description: string;
  setDescription: (description: string) => void;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export function DescriptionField({
  description,
  setDescription,
  isRecording,
  onStartRecording,
  onStopRecording,
}: DescriptionFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor="description">
          Description *
          <HoverCard>
            <HoverCardTrigger asChild>
              <Info className="h-4 w-4 text-gray-500 cursor-help inline-block ml-1" />
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-3 text-sm">
              Provide detailed information about your submission
            </HoverCardContent>
          </HoverCard>
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={isRecording ? onStopRecording : onStartRecording}
          className="flex items-center gap-2"
        >
          {isRecording ? (
            <>
              <MicOff className="w-4 h-4" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              Start Voice Input
            </>
          )}
        </Button>
      </div>
      <Textarea
        id="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Detailed description"
        className="min-h-[150px]"
        required
      />
    </div>
  );
}
