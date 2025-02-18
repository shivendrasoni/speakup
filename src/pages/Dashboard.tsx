import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavHeader } from "@/components/NavHeader";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from "@/components/ui/button";
import { PlusCircle, Clock, Activity, CheckCircle, RefreshCw } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card as ComplaintCard } from "@/components/ui/card";
import { ComplaintForm } from "@/components/complaints/ComplaintForm";
import { TRANSLATIONS } from "@/pages/NewComplaint";
import type { FeedbackCategory } from "@/types/complaints";

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
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
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

  const startRecording = () => {
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
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
        user_id: user?.id || null,
        date: selectedDate ? selectedDate.toISOString() : null,
        ...(submissionType === "feedback" && {
          feedback_category: feedbackCategory as FeedbackCategory,
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

      setShowComplaintForm(false);
      resetForm();
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSectorId("");
    setFiles([]);
    setUserName("");
    setUserEmail("");
    setFeedbackCategory("");
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

  const isLoading = isLoadingSectorStats || isLoadingStatusStats;
  const totalComplaints = statusStats.reduce((sum, stat) => sum + stat.value, 0);

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

          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              Loading statistics...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statusStats.map((stat) => {
                  const IconComponent = STATUS_ICONS[stat.name.toLowerCase().replace(' ', '_') as keyof typeof STATUS_ICONS];
                  return (
                    <Card key={stat.name} className="transition-all hover:shadow-md">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          {stat.name}
                        </CardTitle>
                        <IconComponent 
                          className="h-4 w-4" 
                          style={{ color: stat.color }}
                        />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {totalComplaints > 0 
                            ? `${((stat.value / totalComplaints) * 100).toFixed(1)}% of total`
                            : 'No complaints yet'
                          }
                        </p>
                        <div 
                          className="mt-2 h-1 rounded-full" 
                          style={{ 
                            backgroundColor: stat.color,
                            opacity: totalComplaints > 0 ? stat.value / totalComplaints : 0.2
                          }}
                        />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {activeTab === "public" ? "Public Complaints by Sector" : "My Complaints by Sector"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px] w-full">
                      {sectorStats.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          No complaints found for this category.
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={sectorStats}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="sector_name" 
                              angle={-45}
                              textAnchor="end"
                              height={80}
                            />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#4f46e5" name="Number of Complaints" />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>
                      {activeTab === "public" ? "Public Complaints Status" : "My Complaints Status"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px] w-full">
                      {statusStats.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          No complaints found for this category.
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={statusStats}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                              outerRadius={150}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {statusStats.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % Object.keys(COLORS).length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </Tabs>

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
                  onStartRecording={startRecording}
                  onStopRecording={stopRecording}
                  onShowLanguageDialog={() => {}}
                  onSubmit={handleSubmit}
                  files={files}
                  setFiles={setFiles}
                  feedbackCategory={feedbackCategory}
                  setFeedbackCategory={setFeedbackCategory}
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
      </div>
    </div>
  );
};

export default Dashboard;
