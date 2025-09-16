import { IssueStatus } from "@prisma/client";
import { create } from "zustand";

type IssueSheetFilterState = {
  profileId?: string;
  serviceId?: string;
  teamId?: string;
  page: number;
  status?: IssueStatus | "All" | undefined;
  clientName?: string;
  orderId?: string;
  createdFrom?: string;
  createdTo?: string;

  setProfileId: (id: string) => void;
  setServiceId: (id: string) => void;
  setTeamId: (id: string) => void;
  setPage: (page: number) => void;
  setAllValues: (data: Partial<IssueSheetFilterState>) => void;
  clearFilters: () => void;
};

export const useIssueSheetFilterState = create<IssueSheetFilterState>(
  (set) => ({
    profileId: undefined,
    serviceId: undefined,
    teamId: undefined,
    page: 1,
    status: "All",
    clientName: undefined,
    orderId: undefined,
    createdFrom: undefined,
    createdTo: undefined,

    setProfileId: (id) => set({ profileId: id }),
    setServiceId: (id) => set({ serviceId: id }),
    setTeamId: (id) => set({ teamId: id }),
    setPage: (page) => set({ page }),

    setAllValues: (data) =>
      set((state) => ({
        profileId: data.profileId ?? state.profileId,
        serviceId: data.serviceId ?? state.serviceId,
        teamId: data.teamId ?? state.teamId,
        page: data.page ?? state.page,
        status: data.status ?? state.status,
        clientName: data.clientName ?? state.clientName,
        orderId: data.orderId ?? state.orderId,
        createdFrom: data.createdFrom ?? state.createdFrom,
        createdTo: data.createdTo ?? state.createdTo,
      })),

    clearFilters: () =>
      set({
        profileId: undefined,
        serviceId: undefined,
        teamId: undefined,
        page: 1,
        status: "All",
        clientName: undefined,
        orderId: undefined,
        createdFrom: undefined,
        createdTo: undefined,
      }),
  })
);
