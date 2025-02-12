
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavHeader } from "@/components/NavHeader";
import { Complaints } from "@/components/ComplaintTabs/Complaints";

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<"public" | "private">("public");

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "public" | "private")} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="public">Public Complaints</TabsTrigger>
              <TabsTrigger value="private">Private Complaints</TabsTrigger>
            </TabsList>
            <TabsContent value="public">
              <Complaints isPublic={true} />
            </TabsContent>
            <TabsContent value="private">
              <Complaints isPublic={false} />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
