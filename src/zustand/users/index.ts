// store/useUserFilterStore.ts
import { AccountStatus } from "@prisma/client"; // import enum if using Prisma
import { create } from "zustand";

interface UserFilterState {
  searchQuery: string;
  page: number;
  serviceId: string;
  teamId: string;
  accountStatus: AccountStatus | ""; // empty string for no filter
  setSearchQuery: (value: string) => void;
  setPage: (value: number) => void;
  setServiceId: (value: string) => void;
  setTeamId: (value: string) => void;
  setAccountStatus: (value: AccountStatus | "") => void;
  resetFilters: () => void;
}

export const useUserFilterStore = create<UserFilterState>((set) => ({
  searchQuery: "",
  page: 1,
  serviceId: "",
  teamId: "",
  accountStatus: "",

  setSearchQuery: (value) => set({ searchQuery: value }),
  setPage: (value) => set({ page: value }),
  setServiceId: (value) => set({ serviceId: value }),
  setTeamId: (value) => set({ teamId: value }),
  setAccountStatus: (value) => set({ accountStatus: value }),

  resetFilters: () =>
    set({
      searchQuery: "",
      page: 1,
      serviceId: "",
      teamId: "",
      accountStatus: "",
    }),
}));
