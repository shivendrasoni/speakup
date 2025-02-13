
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChartBar, Languages, Mic, MicOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";
import type { LanguageCode, SubmissionType } from "@/types/complaints";
import { TRANSLATIONS } from "@/pages/NewComplaint";

type Sector = Database["public"]["Tables"]["sectors"]["Row"];

interface ComplaintFormProps {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  sectorId: string;
  setSectorId: (sectorId: string) => void;
  sectors: Sector[];
  loading: boolean;
  language: LanguageCode;
  submissionType: SubmissionType;
  setSubmissionType: (type: SubmissionType) => void;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onShowLanguageDialog: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ComplaintForm({
  title,
  setTitle,
  description,
  setDescription,
  sectorId,
  setSectorId,
  sectors,
  loading,
  language,
  submissionType,
  setSubmissionType,
  isRecording,
  onStartRecording,
  onStopRecording,
  onShowLanguageDialog,
  onSubmit,
}: ComplaintFormProps) {
  const navigate = useNavigate();
  const t = TRANSLATIONS[language];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="outline"
          onClick={onShowLanguageDialog}
          className="flex items-center gap-2"
        >
          <Languages className="w-4 h-4" />
          {t.changeLanguage}
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate("/complaints")}
          className="flex items-center gap-2"
        >
          <ChartBar className="w-4 h-4" />
          {t.viewDashboard}
        </Button>
      </div>

      <div className="mb-6">
        <RadioGroup
          defaultValue="complaint"
          onValueChange={(value) => setSubmissionType(value as SubmissionType)}
          className="flex flex-col md:flex-row gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="complaint" id="complaint" />
            <Label htmlFor="complaint">{t.complaint}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="feedback" id="feedback" />
            <Label htmlFor="feedback">{t.feedback}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="compliment" id="compliment" />
            <Label htmlFor="compliment">{t.compliment}</Label>
          </div>
        </RadioGroup>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.placeholders.title}
            disabled={loading}
            required
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sector">{t.sector}</Label>
          <Select
            value={sectorId}
            onValueChange={setSectorId}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a sector" />
            </SelectTrigger>
            <SelectContent>
              {sectors.map((sector) => (
                <SelectItem key={sector.id} value={sector.id}>
                  {sector.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="description">{t.description}</Label>
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
                  {t.stopRecording}
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  {t.startRecording}
                </>
              )}
            </Button>
          </div>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.placeholders.description}
            className="min-h-[150px]"
            disabled={loading}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Submitting..." : t.submit}
        </Button>
      </form>
    </div>
  );
}
