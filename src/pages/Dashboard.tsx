import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavHeader } from "@/components/NavHeader";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from "@/components/ui/button";
import { PlusCircle, Clock, Activity, CheckCircle, RefreshCw } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card as ComplaintCard } from "@/components/ui/card";
import { ComplaintForm } from "@/components/complaints/ComplaintForm";
import { TRANSLATIONS } from "@/pages/NewComplaint";
import type { FeedbackCategory } from "@/types/complaints";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

type ComplaintStats = {
  sector_name: string;
  count: number;
};

const COLORS = {
  pending: '#FDB022',     // Amber
  in_process: '#3B82F6',  // Blue
  closed: '#10B981',      // Green
  reopened: '#EF4444'     // Red
};

const STATUS_ICONS = {
  pending: Clock,
  in_process: Activity,
  closed: CheckCircle,
  reopened: RefreshCw
};

export const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"public" | "private">("public");
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sectorId, setSectorId] = useState("");
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [feedbackCategory, setFeedbackCategory] = useState<FeedbackCategory>("platform_experience");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [complimentRecipient, setComplimentRecipient] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [submissionType, setSubmissionType] = useState<"complaint" | "feedback" | "compliment">("complaint");
  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState<keyof typeof TRANSLATIONS>("english");

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (!session) {
        throw new Error("No session found");
      }
      return session;
    },
    retry: false,
    meta: {
      onSettled: (_data, error) => {
        if (error) {
          queryClient.clear();
          toast({
            title: "Session expired",
            description: "Please log in again",
            variant: "destructive",
          });
          navigate("/login");
        }
      }
    }
  });

  const { data: statusStats = [], isLoading: isLoadingStatusStats } = useQuery({
    queryKey: ["status-stats", activeTab, session?.user?.id],
    queryFn: async () => {
      let query = supabase
        .from('complaints')
        .select('status');

      if (activeTab === "private" && session?.user?.id) {
        query = query.eq('user_id', session.user.id);
      } else {
        query = query.eq('is_public', true);
      }

      const { data: complaints, error: complaintsError } = await query;

      if (complaintsError) throw complaintsError;

      const statusCounts = {
        pending: 0,
        in_process: 0,
        closed: 0,
        reopened: 0
      };

      complaints?.forEach(complaint => {
        const status = complaint.status || 'pending';
        if (status in statusCounts) {
          statusCounts[status as keyof typeof statusCounts]++;
        }
      });

      return Object.entries(statusCounts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
        value,
        color: COLORS[name as keyof typeof COLORS]
      }));
    }
  });

  const { data: sectorStats = [], isLoading: isLoadingSectorStats } = useQuery({
    queryKey: ["complaint-stats", activeTab, session?.user?.id],
    queryFn: async () => {
      let query = supabase
        .from('complaints')
        .select(`
          sector_id,
          sectors (name)
        `);

      if (activeTab === "private" && session?.user?.id) {
        query = query.eq('user_id', session.user.id);
      } else {
        query = query.eq('is_public', true);
      }

      const { data: complaints, error: complaintsError } = await query;

      if (complaintsError) throw complaintsError;

      const sectorCounts = complaints.reduce((acc: { [key: string]: number }, complaint) => {
        const sectorName = complaint.sectors?.name || 'Unknown';
        acc[sectorName] = (acc[sectorName] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(sectorCounts).map(([sector_name, count]) => ({
        sector_name,
        count
      })) as ComplaintStats[];
    }
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSectorId("");
    setFiles([]);
    setUserName("");
    setUserEmail("");
    setFeedbackCategory("platform_experience");
    setComplimentRecipient("");
    setSelectedState("");
    setSelectedDistrict("");
    setSelectedDate(undefined);
  };

  useEffect(() => {
    const fetchSectors = async () => {
      const { data, error } = await supabase
        .from("sectors")
        .select("*")
        .order("name");
      
      if (error) {
        console.error("Failed to load sectors:", error);
        return;
      }

      setSectors(data || []);
    };

    fetchSectors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!session?.user) {
        throw new Error("No session found");
      }

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

      const formData = {
        title,
        description,
        sector_id: sectorId,
        language,
        submission_type: submissionType,
        is_public: true,
        attachments: uploadedFiles,
        state_id: selectedState ? parseInt(selectedState) : null,
        district_id: selectedDistrict ? parseInt(selectedDistrict) : null,
        user_id: session.user.id,
        date: selectedDate ? selectedDate.toISOString() : null,
        ...(submissionType === "feedback" && {
          feedback_category: feedbackCategory,
          user_name: userName || null,
          email: userEmail || null,
        }),
        ...(submissionType === "compliment" && {
          compliment_recipient: complimentRecipient,
          user_name: userName || null,
          email: userEmail || null,
        }),
        ...(submissionType === "complaint" && {
          user_name: userName,
          email: userEmail || null,
        }),
      };

      const { error } = await supabase
        .from("complaints")
        .insert(formData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your complaint has been submitted successfully",
      });

      setShowComplaintForm(false);
      resetForm();
    } catch (error: any) {
      console.error('Submission error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit complaint",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {activeTab === "public" ? "Public Complaints Dashboard" : "My Complaints Dashboard"}
          </h1>
          <Button onClick={() => setShowComplaintForm(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Register Complaint
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "public" | "private")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="public">Public Complaints</TabsTrigger>
            <TabsTrigger value="private">My Complaints</TabsTrigger>
          </TabsList>

          <Dialog open={showComplaintForm} onOpenChange={setShowComplaintForm}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <ComplaintCard className="border-0 shadow-none">
                <CardHeader>
                  <CardTitle>{TRANSLATIONS[language].title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ComplaintForm
                    title={title}
                    setTitle={setTitle}
                    description={description}
                    setDescription={setDescription}
                    sectorId={sectorId}
                    setSectorId={setSectorId}
                    sectors={sectors}
                    loading={loading}
                    language={language}
                    submissionType={submissionType}
                    setSubmissionType={setSubmissionType}
                    isRecording={isRecording}
                    onStartRecording={() => setIsRecording(true)}
                    onStopRecording={() => setIsRecording(false)}
                    onShowLanguageDialog={() => {}}
                    onSubmit={handleSubmit}
                    files={files}
                    setFiles={setFiles}
                    feedbackCategory={feedbackCategory}
                    setFeedbackCategory={(value: FeedbackCategory) => setFeedbackCategory(value)}
                    userName={userName}
                    setUserName={setUserName}
                    userEmail={userEmail}
                    setUserEmail={setUserEmail}
                    complimentRecipient={complimentRecipient}
                    setComplimentRecipient={setComplimentRecipient}
                    selectedState={selectedState}
                    setSelectedState={setSelectedState}
                    selectedDistrict={selectedDistrict}
                    setSelectedDistrict={setSelectedDistrict}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                  />
                </CardContent>
              </ComplaintCard>
            </DialogContent>
          </Dialog>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
