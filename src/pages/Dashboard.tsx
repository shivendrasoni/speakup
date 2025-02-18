import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle, Clock, Activity, CheckCircle, RefreshCw } from "lucide-react";
import { useLanguage } from '@/contexts/LanguageContext';
import { TRANSLATIONS } from '@/pages/NewComplaint';

type ComplaintStats = {
  sector_name: string;
  count: number;
};

const COLORS = {
  pending: '#FDB022',     // Amber
  in_progress: '#3B82F6',  // Blue
  closed: '#10B981',      // Green
  reopened: '#EF4444'     // Red
};

const STATUS_ICONS = {
  pending: Clock,
  in_progress: Activity,
  closed: CheckCircle,
  reopened: RefreshCw
};

export const Dashboard = () => {
  const { language } = useLanguage();
  const t = TRANSLATIONS[language].dashboard;
  const [activeTab, setActiveTab] = useState<"public" | "private">("public");

  // Get current user session
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  // Query for status-based statistics
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

      // Initialize all status categories
      const statusCounts = {
        pending: 0,
        in_progress: 0,
        closed: 0,
        reopened: 0
      };

      // Count the statuses manually
      complaints?.forEach(complaint => {
        let status = complaint.status || 'pending';
        
        // Convert resolved and rejected to closed
        if (status === 'resolved' || status === 'rejected') {
          status = 'closed';
        }
        
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

  const isLoading = isLoadingSectorStats || isLoadingStatusStats;
  const totalComplaints = statusStats.reduce((sum, stat) => sum + stat.value, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {activeTab === "public" ? t.publicDashboard : t.privateDashboard}
          </h1>
          <Link to="/">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t.registerComplaint}
            </Button>
          </Link>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "public" | "private")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="public">{t.publicComplaints}</TabsTrigger>
            <TabsTrigger value="private">{t.myComplaints}</TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              {t.loadingStats}
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
                      {activeTab === "public" ? t.complaintsBySector : t.myComplaintsBySector}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px] w-full">
                      {sectorStats.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          {t.noComplaints}
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
                            <Bar dataKey="count" fill="#4f46e5" name={t.numberOfComplaints} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>
                      {activeTab === "public" ? t.complaintStatus : t.myComplaintStatus}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px] w-full">
                      {statusStats.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          {t.noComplaints}
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
      </div>
    </div>
  );
};

export default Dashboard;
