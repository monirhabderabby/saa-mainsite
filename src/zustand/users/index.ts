// store/useUserFilterStore.ts
import { create } from "zustand";

interface UserFilterState {
  searchQuery: string;
  page: number;
  serviceId: string;
  teamId: string;
  setSearchQuery: (value: string) => void;
  setPage: (value: number) => void;
  setServiceId: (value: string) => void;
  setTeamId: (value: string) => void;
  resetFilters: () => void;
}

export const useUserFilterStore = create<UserFilterState>((set) => ({
  searchQuery: "",
  page: 1,
  serviceId: "",
  teamId: "",

  setSearchQuery: (value) => set({ searchQuery: value }),
  setPage: (value) => set({ page: value }),
  setServiceId: (value) => set({ serviceId: value }),
  setTeamId: (value) => set({ teamId: value }),

  resetFilters: () =>
    set({
      searchQuery: "",
      page: 1,
      serviceId: "",
      teamId: "",
    }),
}));
