
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
import { SectorQuestions } from "./SectorQuestions";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";

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
  const [formProgress, setFormProgress] = useState(0);
  const [sectorAnswers, setSectorAnswers] = useState<Record<string, any>>({});

  // Calculate form progress
  const calculateProgress = () => {
    let totalFields = 0;
    let filledFields = 0;

    // Common fields
    totalFields += 2; // title and description
    if (title) filledFields++;
    if (description) filledFields++;

    if (submissionType === "complaint") {
      totalFields += 4; // sector, state, district, personal info
      if (sectorId) filledFields++;
      if (selectedState) filledFields++;
      if (selectedDistrict) filledFields++;
      if (userName && userEmail) filledFields++;
    } else if (submissionType === "feedback") {
      totalFields += 3; // category and personal info
      if (feedbackCategory) filledFields++;
      if (userName) filledFields++;
      if (userEmail) filledFields++;
    } else if (submissionType === "compliment") {
      totalFields += 3; // recipient and personal info
      if (complimentRecipient) filledFields++;
      if (userName) filledFields++;
      if (userEmail) filledFields++;
    }

    setFormProgress((filledFields / totalFields) * 100);
  };

  // Update progress when form fields change
  React.useEffect(() => {
    calculateProgress();
  }, [
    title,
    description,
    sectorId,
    selectedState,
    selectedDistrict,
    userName,
    userEmail,
    feedbackCategory,
    complimentRecipient,
    submissionType,
  ]);

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
    <div className="space-y-6">
      <div className="mb-6">
        <div className="mb-2 flex justify-between items-center">
          <span className="text-sm text-gray-600">Form Progress</span>
          <span className="text-sm text-gray-600">{Math.round(formProgress)}%</span>
        </div>
        <Progress value={formProgress} className="w-full" />
      </div>

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

            {sectorId && (
              <SectorQuestions
                sectorId={sectorId}
                answers={sectorAnswers}
                setAnswers={setSectorAnswers}
              />
            )}
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

        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              Submitting...
            </div>
          ) : (
            "Submit"
          )}
        </Button>
      </form>
    </div>
  );
}
