import { UpdateSheetFilter } from "@/schemas/update-sheet/filter";
import { create } from "zustand";

type ProfileState = {
  profileId: string | undefined;
  setProfileId: (id: string) => void;
  clearProfileId: () => void;
  setAllValues: (data: UpdateSheetFilter) => void;
};

export const useUpdateSheetFilterState = create<ProfileState>((set) => ({
  profileId: undefined,
  setProfileId: (id) => set({ profileId: id }),
  clearProfileId: () => set({ profileId: undefined }),

  setAllValues: ({ profileId }: UpdateSheetFilter) => set({ profileId }),
}));
