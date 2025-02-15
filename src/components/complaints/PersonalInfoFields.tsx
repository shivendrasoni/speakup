
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface PersonalInfoFieldsProps {
  userName: string;
  setUserName: (name: string) => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
  required?: boolean;
}

export function PersonalInfoFields({
  userName,
  setUserName,
  userEmail,
  setUserEmail,
  required = false,
}: PersonalInfoFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="userName">
          {required ? "Full Name *" : "Name (Optional)"}
          {required && (
            <HoverCard>
              <HoverCardTrigger asChild>
                <Info className="h-4 w-4 text-gray-500 cursor-help inline-block ml-1" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80 p-3 text-sm">
                Enter your full name as per official documents
              </HoverCardContent>
            </HoverCard>
          )}
        </Label>
        <Input
          id="userName"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Enter your full name"
          required={required}
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="userEmail">
          Email Address (Optional)
          {required && (
            <HoverCard>
              <HoverCardTrigger asChild>
                <Info className="h-4 w-4 text-gray-500 cursor-help inline-block ml-1" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80 p-3 text-sm">
                We'll send updates about your complaint to this email
              </HoverCardContent>
            </HoverCard>
          )}
        </Label>
        <Input
          id="userEmail"
          type="email"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          placeholder="Enter your email address"
          className="w-full"
        />
      </div>
    </div>
  );
}
