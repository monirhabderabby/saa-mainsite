// store/useUserFilterStore.ts
import { AccountStatus } from "@prisma/client";
import { create } from "zustand";

interface UserFilterState {
  searchQuery: string;
  page: number;
  serviceId: string;
  departmentId: string;
  accountStatus: AccountStatus | ""; // empty string for no filter
  setSearchQuery: (value: string) => void;
  setPage: (value: number) => void;
  setServiceId: (value: string) => void;
  setDepartmentId: (value: string) => void;
  setAccountStatus: (value: AccountStatus | "") => void;
  resetFilters: () => void;
}

export const useUserFilterStore = create<UserFilterState>((set) => ({
  searchQuery: "",
  page: 1,
  serviceId: "",
  departmentId: "",
  accountStatus: "",

  setSearchQuery: (value) => set({ searchQuery: value }),
  setPage: (value) => set({ page: value }),
  setServiceId: (value) => set({ serviceId: value }),
  setDepartmentId: (value) => set({ departmentId: value }),
  setAccountStatus: (value) => set({ accountStatus: value }),

  resetFilters: () =>
    set({
      searchQuery: "",
      page: 1,
      serviceId: "",
      departmentId: "",
      accountStatus: "",
    }),
}));
