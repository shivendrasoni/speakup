
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { NavHeader } from "@/components/NavHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Database } from "@/integrations/supabase/types";

type ComplaintStatus = Database["public"]["Enums"]["complaint_status"];

type Complaint = {
  ai_category: string | null;
  created_at: string;
  description: string;
  id: string;
  sector_id: string;
  shares: number | null;
  status: ComplaintStatus | null;
  title: string;
  updated_at: string;
  user_id: string;
  views: number | null;
  sectors: Database["public"]["Tables"]["sectors"]["Row"];
  profiles: Database["public"]["Tables"]["profiles"]["Row"] | null;
  complaint_updates: Array<{
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    profiles: Database["public"]["Tables"]["profiles"]["Row"] | null;
  }>;
};

const ComplaintDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newUpdate, setNewUpdate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus | null>(null);

  const { data: complaint, isLoading } = useQuery({
    queryKey: ["complaint", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaints")
        .select(`
          *,
          sectors (*),
          profiles (*),
          complaint_updates (
            id,
            content,
            created_at,
            user_id,
            profiles:user_id (*)
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as unknown as Complaint;
    },
  });

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
        
      if (error) throw error;
      return profile;
    },
  });

  const addUpdateMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("complaint_updates")
        .insert({
          complaint_id: id,
          user_id: user.id,
          content: newUpdate,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaint", id] });
      setNewUpdate("");
      toast({
        title: "Success",
        description: "Update added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add update",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: ComplaintStatus) => {
      const { error } = await supabase
        .from("complaints")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaint", id] });
      toast({
        title: "Success",
        description: "Status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!complaint) {
    return <div className="text-center py-8">Complaint not found</div>;
  }

  const isAdmin = currentUser?.role === "admin";
  const isOwner = currentUser?.id === complaint?.user_id;

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

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="outline"
            className="mb-6"
            onClick={() => navigate("/complaints")}
          >
            Back to Complaints
          </Button>

          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{complaint.title}</CardTitle>
                  <div className="mt-2 text-sm text-gray-500">
                    Sector: {complaint.sectors.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    By: {complaint.profiles?.name || "Anonymous"}
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Submitted on:{" "}
                    {new Date(complaint.created_at).toLocaleDateString()}
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
                  {(isAdmin || isOwner) && (
                    <Select
                      value={selectedStatus || complaint?.status || undefined}
                      onValueChange={(value: ComplaintStatus) => {
                        setSelectedStatus(value);
                        updateStatusMutation.mutate(value);
                      }}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">
                {complaint.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Updates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {complaint.complaint_updates
                  .sort(
                    (a, b) =>
                      new Date(b.created_at).getTime() -
                      new Date(a.created_at).getTime()
                  )
                  .map((update) => (
                    <div
                      key={update.id}
                      className="bg-white p-4 rounded-lg border"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">
                          {update.profiles?.name || "Anonymous"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(update.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {update.content}
                      </p>
                    </div>
                  ))}
              </div>

              <div className="space-y-4">
                <Textarea
                  placeholder="Add an update..."
                  value={newUpdate}
                  onChange={(e) => setNewUpdate(e.target.value)}
                />
                <Button
                  onClick={() => addUpdateMutation.mutate()}
                  disabled={!newUpdate.trim() || addUpdateMutation.isPending}
                >
                  {addUpdateMutation.isPending ? "Adding..." : "Add Update"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;
