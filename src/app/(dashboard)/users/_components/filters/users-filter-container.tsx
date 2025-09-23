"use client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserFilterStore } from "@/zustand/users";
interface Props {
  services: { id: string; name: string }[];
}

const UserFilterContainer = ({ services }: Props) => {
  const { searchQuery, setSearchQuery, setServiceId, serviceId } =
    useUserFilterStore();

  return (
    <div className="flex items-center gap-5">
      <Select value={serviceId} onValueChange={(val) => setServiceId(val)}>
        <SelectTrigger>
          <SelectValue placeholder="Select Service" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All</SelectItem>
          {services.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        className="max-w-[400px] min-w-[300px]"
        placeholder="Enter Employee ID, Name, email here..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
};

export default UserFilterContainer;
