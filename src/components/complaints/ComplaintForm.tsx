import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Mic, MicOff, Info } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import type { Sector } from "@/types/complaints";
import type { SubmissionType, LanguageCode } from "@/types/complaints";

const FEEDBACK_CATEGORIES = [
  { label: "Platform Experience", value: "platform_experience" },
  { label: "Response Time", value: "response_time" },
  { label: "Accessibility", value: "accessibility" },
  { label: "Other", value: "other" },
];

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
  files: File[];
  setFiles: (files: File[]) => void;
  feedbackCategory: string;
  setFeedbackCategory: (category: string) => void;
  userName: string;
  setUserName: (name: string) => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
  complimentRecipient: string;
  setComplimentRecipient: (recipient: string) => void;
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
  files,
  setFiles,
  feedbackCategory,
  setFeedbackCategory,
  userName,
  setUserName,
  userEmail,
  setUserEmail,
  complimentRecipient,
  setComplimentRecipient,
}: ComplaintFormProps) {
  
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

  const renderFieldHint = (hint: string) => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Info className="h-4 w-4 text-gray-500 cursor-help inline-block ml-1" />
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-3 text-sm">
        {hint}
      </HoverCardContent>
    </HoverCard>
  );

  const renderFormFields = () => {
    switch (submissionType) {
      case "feedback":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="userName">Name (Optional)</Label>
                <Input
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userEmail">Email (Optional)</Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedbackCategory">Feedback Category *</Label>
              <Select 
                value={feedbackCategory} 
                onValueChange={setFeedbackCategory}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select feedback category" />
                </SelectTrigger>
                <SelectContent>
                  {FEEDBACK_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        );
      case "compliment":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="userName">Name (Optional)</Label>
                <Input
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userEmail">Email (Optional)</Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="complimentRecipient">Who/What is this compliment for? *</Label>
              <Input
                id="complimentRecipient"
                value={complimentRecipient}
                onChange={(e) => setComplimentRecipient(e.target.value)}
                placeholder="Enter the name of person, department, or service"
                required
                className="w-full"
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <RadioGroup
          defaultValue="complaint"
          onValueChange={(value) => setSubmissionType(value as SubmissionType)}
          className="flex flex-col md:flex-row gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="complaint" id="complaint" />
            <Label htmlFor="complaint">Complaint</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="feedback" id="feedback" />
            <Label htmlFor="feedback">Feedback</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="compliment" id="compliment" />
            <Label htmlFor="compliment">Compliment</Label>
          </div>
        </RadioGroup>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {renderFormFields()}
        
        {submissionType === "complaint" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="userName">
                  Full Name *
                  {renderFieldHint("Enter your full name as per official documents")}
                </Label>
                <Input
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userEmail">
                  Email Address (Optional)
                  {renderFieldHint("We'll send updates about your complaint to this email")}
                </Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sector">
                Department/Sector *
                {renderFieldHint("Select the department or sector related to your complaint")}
              </Label>
              <Select
                value={sectorId}
                onValueChange={setSectorId}
              >
                <SelectTrigger className="bg-white">
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
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="title">
            Title *
            {renderFieldHint("A brief title that describes your submission")}
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief title of your submission"
            required
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="description">
              Description *
              {renderFieldHint("Provide detailed information about your complaint")}
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

        <div className="space-y-2">
          <Label htmlFor="attachments">
            Attachments (Optional)
            {renderFieldHint("Upload relevant documents or images (max 5MB each)")}
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

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </div>
  );
}
