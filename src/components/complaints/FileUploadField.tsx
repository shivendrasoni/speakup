
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface FileUploadFieldProps {
  files: File[];
  setFiles: (files: File[]) => void;
}

export function FileUploadField({ files, setFiles }: FileUploadFieldProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = selectedFiles.filter(file => {
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (!validTypes.includes(file.type)) {
          alert(`File ${file.name} is not a supported format. Please upload images (JPG/PNG), PDFs, or Word documents.`);
          return false;
        }
        if (file.size > maxSize) {
          alert(`File ${file.name} is too large. Maximum file size is 5MB.`);
          return false;
        }
        return true;
      });
      setFiles(validFiles);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="attachments">
        Attachments (Optional)
        <HoverCard>
          <HoverCardTrigger asChild>
            <Info className="h-4 w-4 text-gray-500 cursor-help inline-block ml-1" />
          </HoverCardTrigger>
          <HoverCardContent className="w-80 p-3 text-sm">
            Upload relevant documents or images (max 5MB each)
          </HoverCardContent>
        </HoverCard>
      </Label>
      <Input
        id="attachments"
        type="file"
        onChange={handleFileChange}
        className="w-full"
        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
        multiple
      />
      {files.length > 0 && (
        <div className="space-y-2">
          <Label>Selected Files:</Label>
          <ul className="list-disc pl-5">
            {files.map((file, index) => (
              <li key={index} className="text-sm text-gray-600">
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-2 text-red-500 hover:text-red-700"
                  onClick={() => setFiles(files.filter((_, i) => i !== index))}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
