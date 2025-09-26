"use client";
import { Input } from "@/components/ui/input";
import { useProfileStore } from "@/zustand/profiles/userProfileStore";
import { Search } from "lucide-react";
import { useEffect } from "react";
import ProfileCard from "./profile-card";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profiles: any[];
}

const ProfileContainer = ({ profiles }: Props) => {
  const { setProfiles, filtered, search } = useProfileStore();

  useEffect(() => {
    setProfiles(profiles);
  }, [profiles, setProfiles]);

  return (
    <div>
      {/* Search Input */}
      <div className="mb-6 flex justify-end">
        <div className="relative max-w-md min-w-[350px]">
          <Input
            startIcon={Search}
            placeholder="Search profiles..."
            className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
            onChange={(e) => search(e.target.value)}
          />
        </div>
      </div>

      {/* Render Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filtered.map((p) => (
          <ProfileCard key={p.id} data={p} />
        ))}
      </div>
    </div>
  );
};

export default ProfileContainer;
