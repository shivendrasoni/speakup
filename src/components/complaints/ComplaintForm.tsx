
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Info } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import type { Sector } from "@/types/complaints";
import type { SubmissionType, LanguageCode } from "@/types/complaints";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { LocationSelector } from "./LocationSelector";
import { FileUploadField } from "./FileUploadField";
import { DescriptionField } from "./DescriptionField";

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
  selectedState: string;
  setSelectedState: (state: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
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
  selectedState,
  setSelectedState,
  selectedDistrict,
  setSelectedDistrict,
}: ComplaintFormProps) {
  const renderFormFields = () => {
    switch (submissionType) {
      case "feedback":
        return (
          <>
            <PersonalInfoFields
              userName={userName}
              setUserName={setUserName}
              userEmail={userEmail}
              setUserEmail={setUserEmail}
            />
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
            <PersonalInfoFields
              userName={userName}
              setUserName={setUserName}
              userEmail={userEmail}
              setUserEmail={setUserEmail}
            />
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
            <PersonalInfoFields
              userName={userName}
              setUserName={setUserName}
              userEmail={userEmail}
              setUserEmail={setUserEmail}
              required
            />

            <LocationSelector
              selectedState={selectedState}
              setSelectedState={setSelectedState}
              selectedDistrict={selectedDistrict}
              setSelectedDistrict={setSelectedDistrict}
            />

            <div className="space-y-2">
              <Label htmlFor="sector">
                Department/Sector *
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Info className="h-4 w-4 text-gray-500 cursor-help inline-block ml-1" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80 p-3 text-sm">
                    Select the department or sector related to your complaint
                  </HoverCardContent>
                </HoverCard>
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
            <HoverCard>
              <HoverCardTrigger asChild>
                <Info className="h-4 w-4 text-gray-500 cursor-help inline-block ml-1" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80 p-3 text-sm">
                A brief title that describes your submission
              </HoverCardContent>
            </HoverCard>
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

        <DescriptionField
          description={description}
          setDescription={setDescription}
          isRecording={isRecording}
          onStartRecording={onStartRecording}
          onStopRecording={onStopRecording}
        />

        <FileUploadField
          files={files}
          setFiles={setFiles}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </div>
  );
}
