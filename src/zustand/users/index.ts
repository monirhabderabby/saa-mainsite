// store/useUserFilterStore.ts
import { AccountStatus } from "@prisma/client";
import { create } from "zustand";

type UserFilterState = {
  searchQuery?: string;
  page: number;
  serviceId?: string;
  departmentId?: string;
  accountStatus?: AccountStatus | "";
  role?: string;
  teamId?: string;

  setSearchQuery: (value: string) => void;
  setPage: (value: number) => void;
  setServiceId: (value: string) => void;
  setDepartmentId: (value: string) => void;
  setAccountStatus: (value: AccountStatus | "") => void;
  setRole: (value: string) => void;
  setTeamId: (value: string) => void;
  setAllValues: (data: Partial<UserFilterState>) => void;
  resetFilters: () => void;
};

export const useUserFilterStore = create<UserFilterState>((set) => ({
  searchQuery: "",
  page: 1,
  serviceId: undefined,
  departmentId: undefined,
  accountStatus: "",
  role: undefined,
  teamId: undefined,

  setSearchQuery: (value) => set({ searchQuery: value }),
  setPage: (value) => set({ page: value }),
  setServiceId: (value) => set({ serviceId: value }),
  setDepartmentId: (value) => set({ departmentId: value }),
  setAccountStatus: (value) => set({ accountStatus: value }),
  setRole: (value) => set({ role: value }),
  setTeamId: (value) => set({ teamId: value }),

  setAllValues: (data) =>
    set((state) => ({
      searchQuery: data.searchQuery ?? state.searchQuery,
      page: data.page ?? state.page,
      serviceId: data.serviceId ?? state.serviceId,
      departmentId: data.departmentId ?? state.departmentId,
      accountStatus: data.accountStatus ?? state.accountStatus,
      role: data.role ?? state.role,
      teamId: data.teamId ?? state.teamId,
    })),

  resetFilters: () =>
    set({
      searchQuery: "",
      page: 1,
      serviceId: undefined,
      departmentId: undefined,
      accountStatus: "",
      role: undefined,
      teamId: undefined,
    }),
}));
