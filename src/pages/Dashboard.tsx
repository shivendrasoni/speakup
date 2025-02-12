
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavHeader } from "@/components/NavHeader";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

type ComplaintStats = {
  sector_name: string;
  count: number;
};

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<"public" | "private">("public");

  const { data: sectorStats = [], isLoading } = useQuery({
    queryKey: ["complaint-stats", activeTab],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          sectors (name),
          count
        `, { count: 'exact' })
        .eq('is_public', activeTab === 'public')
        .group('sectors.name');

      if (error) throw error;
      
      return data.map(item => ({
        sector_name: item.sectors?.name || 'Unknown',
        count: parseInt(item.count as unknown as string)
      })) as ComplaintStats[];
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Complaint Dashboard</h1>
          <Link to="/complaints">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Register Complaint
            </Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Complaint Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "public" | "private")} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="public">Public Complaints</TabsTrigger>
                <TabsTrigger value="private">Private Complaints</TabsTrigger>
              </TabsList>
              
              <TabsContent value="public" className="mt-0">
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
              </TabsContent>
              
              <TabsContent value="private" className="mt-0">
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
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
