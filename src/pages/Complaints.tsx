
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PlusCircle, Filter } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Complaint = Database["public"]["Tables"]["complaints"]["Row"] & {
  sectors: Database["public"]["Tables"]["sectors"]["Row"];
  profiles: Database["public"]["Tables"]["profiles"]["Row"];
};

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
];

const Complaints = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ["complaints", search, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("complaints")
        .select(`
          *,
          sectors (
            id,
            name
          ),
          profiles (
            id,
            name,
            email
          )
        `)
        .order("created_at", { ascending: false });

      if (search) {
        query = query.ilike("title", `%${search}%`);
      }

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data as Complaint[]) || [];
    },
  });

  const getStatusColor = (status: string | null) => {
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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Complaints</h1>
          <Link to="/complaints/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Complaint
            </Button>
          </Link>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search complaints..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="grid gap-6">
            {complaints.map((complaint) => (
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
            ))}
            {complaints.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No complaints found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Complaints;
