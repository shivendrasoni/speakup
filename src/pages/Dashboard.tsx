
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavHeader } from "@/components/NavHeader";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

type ComplaintStats = {
  sector_name: string;
  count: number;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<"public" | "private">("public");

  const { data: sectorStats = [], isLoading: isLoadingSectorStats } = useQuery({
    queryKey: ["complaint-stats", activeTab],
    queryFn: async () => {
      const { data: complaints, error: complaintsError } = await supabase
        .from('complaints')
        .select(`
          sector_id,
          sectors (name)
        `)
        .eq('is_public', activeTab === 'public');

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

  const { data: statusStats = [], isLoading: isLoadingStatusStats } = useQuery({
    queryKey: ["status-stats", activeTab],
    queryFn: async () => {
      const { data: complaints, error: complaintsError } = await supabase
        .from('complaints')
        .select('status')
        .eq('is_public', activeTab === 'public');

      if (complaintsError) throw complaintsError;

      const statusCounts = complaints.reduce((acc: { [key: string]: number }, complaint) => {
        const status = complaint.status || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(statusCounts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
        value
      }));
    }
  });

  const isLoading = isLoadingSectorStats || isLoadingStatusStats;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Complaint Dashboard</h1>
          <Link to="/complaints/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Register Complaint
            </Button>
          </Link>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "public" | "private")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="public">Public Complaints</TabsTrigger>
            <TabsTrigger value="private">Private Complaints</TabsTrigger>
          </TabsList>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Complaints by Sector</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      Loading statistics...
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
                <CardTitle>Resolution Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      Loading statistics...
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
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
