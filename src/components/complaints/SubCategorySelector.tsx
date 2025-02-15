
import { Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import type { SubCategory } from "./types";

interface SubCategorySelectorProps {
  subCategories: SubCategory[];
  selectedSubCategory: string;
  onSubCategoryChange: (value: string) => void;
}

export function SubCategorySelector({ 
  subCategories, 
  selectedSubCategory, 
  onSubCategoryChange 
}: SubCategorySelectorProps) {
  if (subCategories.length === 0) return null;

  return (
    <div className="space-y-2">
      <Label>
        Sub-category *
        <HoverCard>
          <HoverCardTrigger asChild>
            <Info className="h-4 w-4 text-gray-500 cursor-help inline-block ml-1" />
          </HoverCardTrigger>
          <HoverCardContent className="w-80 p-3 text-sm">
            Select a specific category to help us better understand your concern
          </HoverCardContent>
        </HoverCard>
      </Label>
      <Select
        value={selectedSubCategory}
        onValueChange={onSubCategoryChange}
      >
        <SelectTrigger className="bg-white">
          <SelectValue placeholder="Select a sub-category" />
        </SelectTrigger>
        <SelectContent>
          {subCategories.map((subCategory) => (
            <SelectItem key={subCategory.id} value={subCategory.id}>
              {subCategory.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
