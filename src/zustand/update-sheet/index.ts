import { UpdateSheetFilter } from "@/schemas/update-sheet/filter";
import { create } from "zustand";

type ProfileState = {
  profileId: string | undefined;
  page: number;

  setProfileId: (id: string) => void;
  clearProfileId: () => void;

  setPage: (page: number) => void;
  setAllValues: (data: UpdateSheetFilter & { page?: number }) => void;
};

export const useUpdateSheetFilterState = create<ProfileState>((set) => ({
  profileId: undefined,
  page: 1,

  setProfileId: (id) => set({ profileId: id }),
  clearProfileId: () => set({ profileId: undefined }),

  setPage: (page) => set({ page }),

  setAllValues: ({ profileId, page }: UpdateSheetFilter & { page?: number }) =>
    set((state) => ({
      profileId,
      page: page ?? state.page, // keep current page if not provided
    })),
}));
