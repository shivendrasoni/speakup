import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { LanguageCode } from "@/types/complaints";
import { TRANSLATIONS } from "@/pages/NewComplaint";
import { useLanguage } from "@/contexts/LanguageContext";

interface LanguageSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LanguageSelectionDialog({
  open,
  onOpenChange,
}: LanguageSelectionDialogProps) {
  const { language, setLanguage } = useLanguage();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Your Preferred Language | भाषा चुनें</DialogTitle>
        </DialogHeader>
        <RadioGroup
          defaultValue={language}
          onValueChange={(value) => {
            setLanguage(value as LanguageCode);
            onOpenChange(false);
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {(Object.keys(TRANSLATIONS) as LanguageCode[]).map((lang) => (
            <div key={lang} className="flex items-center space-x-2">
              <RadioGroupItem value={lang} id={lang} />
              <Label htmlFor={lang}>{TRANSLATIONS[lang].languageSelect}</Label>
            </div>
          ))}
        </RadioGroup>
      </DialogContent>
    </Dialog>
  );
}
