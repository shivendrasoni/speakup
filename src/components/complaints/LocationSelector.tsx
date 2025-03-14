
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface State {
  id: number;
  name: string;
}

interface District {
  id: number;
  name: string;
  state_id: number;
}

interface LocationSelectorProps {
  selectedState: string;
  setSelectedState: (state: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
}

export function LocationSelector({
  selectedState,
  setSelectedState,
  selectedDistrict,
  setSelectedDistrict,
}: LocationSelectorProps) {
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch states on component mount
  useEffect(() => {
    const fetchStates = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('states')
          .select('*')
          .order('name');

        if (error) {
          toast({
            title: "Error",
            description: "Failed to load states. Please try again.",
            variant: "destructive",
          });
          console.error('Error fetching states:', error);
          return;
        }

        setStates(data || []);
      } catch (error) {
        console.error('Error fetching states:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStates();
  }, [toast]);

  // Fetch districts when state changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!selectedState) {
        setDistricts([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('districts')
          .select('*')
          .eq('state_id', parseInt(selectedState))
          .order('name');

        if (error) {
          toast({
            title: "Error",
            description: "Failed to load districts. Please try again.",
            variant: "destructive",
          });
          console.error('Error fetching districts:', error);
          return;
        }

        setDistricts(data || []);
      } catch (error) {
        console.error('Error fetching districts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDistricts();
  }, [selectedState, toast]);

  const handleStateChange = (newStateId: string) => {
    setSelectedState(newStateId);
    setSelectedDistrict(''); // Reset district when state changes
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="state">
          State *
          <HoverCard>
            <HoverCardTrigger asChild>
              <Info className="h-4 w-4 text-gray-500 cursor-help inline-block ml-1" />
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-3 text-sm">
              Select your state
            </HoverCardContent>
          </HoverCard>
        </Label>
        <Select
          value={selectedState}
          onValueChange={handleStateChange}
          disabled={loading}
        >
          <SelectTrigger className="bg-white">
            <SelectValue placeholder={loading ? "Loading states..." : "Select a state"} />
          </SelectTrigger>
          <SelectContent>
            {states.map((state) => (
              <SelectItem key={state.id} value={state.id.toString()}>
                {state.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="district">
          District *
          <HoverCard>
            <HoverCardTrigger asChild>
              <Info className="h-4 w-4 text-gray-500 cursor-help inline-block ml-1" />
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-3 text-sm">
              Select your district
            </HoverCardContent>
          </HoverCard>
        </Label>
        <Select
          value={selectedDistrict}
          onValueChange={setSelectedDistrict}
          disabled={!selectedState || loading}
        >
          <SelectTrigger className="bg-white">
            <SelectValue 
              placeholder={
                loading ? "Loading districts..." : 
                !selectedState ? "First select a state" : 
                "Select a district"
              } 
            />
          </SelectTrigger>
          <SelectContent>
            {districts.map((district) => (
              <SelectItem key={district.id} value={district.id.toString()}>
                {district.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
