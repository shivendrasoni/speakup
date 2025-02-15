
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  const [filteredDistricts, setFilteredDistricts] = useState<District[]>([]);

  useEffect(() => {
    const fetchStatesAndDistricts = async () => {
      const { data: statesData, error: statesError } = await supabase
        .from('states')
        .select('*')
        .order('name');

      if (statesError) {
        console.error('Error fetching states:', statesError);
        return;
      }

      const { data: districtsData, error: districtsError } = await supabase
        .from('districts')
        .select('*')
        .order('name');

      if (districtsError) {
        console.error('Error fetching districts:', districtsError);
        return;
      }

      setStates(statesData);
      setDistricts(districtsData);
    };

    fetchStatesAndDistricts();
  }, []);

  useEffect(() => {
    if (selectedState && districts.length > 0) {
      const stateId = parseInt(selectedState);
      const filtered = districts.filter(district => district.state_id === stateId);
      setFilteredDistricts(filtered);
      if (!filtered.find(d => d.id.toString() === selectedDistrict)) {
        setSelectedDistrict("");
      }
    } else {
      setFilteredDistricts([]);
    }
  }, [selectedState, districts, selectedDistrict, setSelectedDistrict]);

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
          onValueChange={setSelectedState}
        >
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Select a state" />
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
          disabled={!selectedState}
        >
          <SelectTrigger className="bg-white">
            <SelectValue placeholder={selectedState ? "Select a district" : "First select a state"} />
          </SelectTrigger>
          <SelectContent>
            {filteredDistricts.map((district) => (
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
