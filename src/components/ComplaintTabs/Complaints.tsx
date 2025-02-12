
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type ComplaintStatus = Database["public"]["Enums"]["complaint_status"];

type Complaint = {
  id: string;
  title: string;
  description: string;
  status: ComplaintStatus;
  created_at: string;
  sectors: {
    name: string;
  };
  profiles: {
    name: string;
  };
};

interface ComplaintsProps {
  isPublic: boolean;
}

export const Complaints = ({ isPublic }: ComplaintsProps) => {
  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ["complaints", isPublic],
    queryFn: async () => {
      let query = supabase
        .from("complaints")
        .select(`
          *,
          sectors (*),
          profiles (*)
        `)
        .order("created_at", { ascending: false });

      // Add privacy filter based on isPublic prop
      // Note: You'll need to add an 'is_public' column to your complaints table

      const { data, error } = await query;
      if (error) throw error;
      return (data as unknown as Complaint[]) || [];
    },
  });

  const getStatusColor = (status: ComplaintStatus | null) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Link to="/complaints/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Complaint
          </Button>
        </Link>
      </div>
      
      {complaints.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No complaints found
        </div>
      ) : (
        complaints.map((complaint) => (
          <Card key={complaint.id}>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex-1">
                  <Link
                    to={`/complaints/${complaint.id}`}
                    className="text-xl font-semibold text-gray-900 hover:text-blue-600"
                  >
                    {complaint.title}
                  </Link>
                  <div className="mt-2 text-sm text-gray-500">
                    Sector: {complaint.sectors.name}
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    By: {complaint.profiles.name}
                  </div>
                  <div className="mt-2 line-clamp-2 text-gray-700">
                    {complaint.description}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      complaint.status
                    )}`}
                  >
                    {complaint.status || "Pending"}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(complaint.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
