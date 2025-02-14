import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChartBar, Languages, Mic, MicOff, Upload, HelpCircle, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";
import type { LanguageCode, SubmissionType } from "@/types/complaints";
import { TRANSLATIONS } from "@/pages/NewComplaint";
import { useState, useMemo } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Sector = Database["public"]["Tables"]["sectors"]["Row"];

// Indian states and districts data
const STATES_DISTRICTS: { [key: string]: string[] } = {
  "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Prakasam", "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"],
  "Arunachal Pradesh": ["Anjaw", "Changlang", "East Siang", "Kurung Kumey", "Lohit", "Lower Dibang Valley", "Lower Subansiri", "Papum Pare", "Tawang", "Tirap", "Upper Siang", "Upper Subansiri", "West Kameng", "West Siang"],
  "Assam": ["Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup", "Kamrup Metropolitan", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "South Salmara-Mankachar", "Tinsukia", "Udalguri", "West Karbi Anglong"],
  "Bihar": ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"],
  // ... Add more states and their districts
};

const STATES = Object.keys(STATES_DISTRICTS);

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

interface SectorSpecificFields {
  [key: string]: { label: string; type: "text" | "select"; options?: string[] }[];
}

const sectorSpecificFields: SectorSpecificFields = {
  "banking": [
    { label: "Bank Name", type: "text" },
    { 
      label: "Issue Type", 
      type: "select", 
      options: ["Account Issues", "Card Problems", "Loan Related", "Digital Banking", "Other"] 
    }
  ],
  // Add more sector-specific fields as needed
};

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
  onSubmit: parentOnSubmit,
}: ComplaintFormProps) {
  const navigate = useNavigate();
  const t = TRANSLATIONS[language];
  const { toast } = useToast();
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pincode, setPincode] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [additionalDetails, setAdditionalDetails] = useState<{[key: string]: string}>({});

  // Get districts based on selected state
  const availableDistricts = useMemo(() => {
    return state ? STATES_DISTRICTS[state] || [] : [];
  }, [state]);

  // Reset district when state changes
  const handleStateChange = (newState: string) => {
    setState(newState);
    setDistrict(""); // Reset district when state changes
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const validSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload images (JPG, PNG), PDFs, or Word documents only",
          variant: "destructive",
        });
        return false;
      }
      
      if (!validSize) {
        toast({
          title: "File too large",
          description: "Files must be under 5MB",
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });
    
    setFiles(prev => [...prev, ...validFiles]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Upload files first
      const uploadedFiles = [];
      
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('complaint_attachments')
          .upload(fileName, file);
          
        if (uploadError) throw uploadError;
        
        if (data) {
          uploadedFiles.push({
            name: file.name,
            path: data.path,
            type: file.type,
            size: file.size
          });
        }
      }
      
      // Add the uploaded files info to the form data
      const formData = new FormData(e.target as HTMLFormElement);
      formData.append('attachments', JSON.stringify(uploadedFiles));
      formData.append('additional_details', JSON.stringify(additionalDetails));
      
      // Call parent submit handler
      await parentOnSubmit(e);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit complaint",
        variant: "destructive",
      });
    }
  };

  const selectedSector = sectors.find(s => s.id === sectorId);
  const sectorFields = selectedSector ? sectorSpecificFields[selectedSector.name.toLowerCase()] : undefined;

  // Get unique sectors by name to avoid duplicates
  const uniqueSectors = sectors.reduce((acc, current) => {
    const x = acc.find(item => item.name === current.name);
    if (!x) {
      return acc.concat([current]);
    }
    return acc;
  }, [] as Sector[]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="outline"
          onClick={onShowLanguageDialog}
          className="flex items-center gap-2"
        >
          <Globe className="w-4 h-4" />
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                      className="w-full"
                    />
                    <HelpCircle className="w-4 h-4 absolute right-3 top-3 text-gray-400" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Enter your full name as per official documents</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              required
              pattern="[0-9]{10}"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pincode">Pincode *</Label>
            <Input
              id="pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="Enter your pincode"
              required
              pattern="[0-9]{6}"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State *</Label>
            <Select value={state} onValueChange={handleStateChange} required>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select your state" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                {STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="district">District *</Label>
            <Select 
              value={district} 
              onValueChange={setDistrict} 
              required
              disabled={!state}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder={state ? "Select your district" : "Please select a state first"} />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                {availableDistricts.map((district) => (
                  <SelectItem key={district} value={district}>
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
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
          <Label htmlFor="sector">Department/Sector *</Label>
          <Select
            value={sectorId}
            onValueChange={setSectorId}
            disabled={loading}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select a sector" />
            </SelectTrigger>
            <SelectContent className="bg-white z-50">
              {uniqueSectors.map((sector) => (
                <SelectItem key={sector.id} value={sector.id}>
                  {sector.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {sectorFields && (
          <div className="space-y-4">
            {sectorFields.map((field, index) => (
              <div key={index} className="space-y-2">
                <Label htmlFor={field.label.toLowerCase().replace(/\s+/g, '-')}>
                  {field.label}
                </Label>
                {field.type === 'select' ? (
                  <Select
                    value={additionalDetails[field.label] || ''}
                    onValueChange={(value) => 
                      setAdditionalDetails(prev => ({...prev, [field.label]: value}))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={field.label.toLowerCase().replace(/\s+/g, '-')}
                    value={additionalDetails[field.label] || ''}
                    onChange={(e) => 
                      setAdditionalDetails(prev => ({...prev, [field.label]: e.target.value}))
                    }
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="description">Description *</Label>
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

        <div className="space-y-2">
          <Label htmlFor="attachments">Attachments (Optional)</Label>
          <div className="flex flex-col gap-4">
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
          <p className="text-sm text-gray-500">
            Supported formats: JPG, PNG, PDF, DOC, DOCX (Max 5MB per file)
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Submitting..." : t.submit}
        </Button>
      </form>
    </div>
  );
}
