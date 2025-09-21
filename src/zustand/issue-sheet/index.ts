// zustand/issue-sheet.ts
import { create } from "zustand";

export type IssueSheetFilterState = {
  profileId?: string | null;
  serviceId?: string | null;
  teamId?: string | null;
  page: number;
  status?: string[] | null;
  clientName?: string | null;
  orderId?: string | null;
  // Persisted as ISO strings (serializable)
  createdFrom?: string | null;
  createdTo?: string | null;

  setProfileId: (id?: string | null) => void;
  setServiceId: (id?: string | null) => void;
  setTeamId: (id?: string | null) => void;
  setPage: (page: number) => void;
  setAllValues: (data: Partial<IssueSheetFilterState>) => void;
  clearFilters: (overrides?: Partial<IssueSheetFilterState>) => void;
};

export const useIssueSheetFilterState = create<IssueSheetFilterState>(
  (set) => ({
    profileId: null,
    serviceId: null,
    teamId: null,
    page: 1,
    status: ["open", "wip"],
    clientName: null,
    orderId: null,
    createdFrom: null,
    createdTo: null,

    setProfileId: (id) => set({ profileId: id ?? null }),
    setServiceId: (id) => set({ serviceId: id ?? null }),
    setTeamId: (id) => set({ teamId: id ?? null }),
    setPage: (page) => set({ page }),

    setAllValues: (data) =>
      set((state) => ({
        profileId:
          data.profileId === undefined
            ? state.profileId
            : (data.profileId ?? null),
        serviceId:
          data.serviceId === undefined
            ? state.serviceId
            : (data.serviceId ?? null),
        teamId:
          data.teamId === undefined ? state.teamId : (data.teamId ?? null),
        page: data.page ?? state.page,
        status:
          data.status === undefined ? state.status : (data.status ?? null),
        clientName:
          data.clientName === undefined
            ? state.clientName
            : (data.clientName ?? null),
        orderId:
          data.orderId === undefined ? state.orderId : (data.orderId ?? null),
        createdFrom:
          data.createdFrom === undefined
            ? state.createdFrom
            : (data.createdFrom ?? null),
        createdTo:
          data.createdTo === undefined
            ? state.createdTo
            : (data.createdTo ?? null),
      })),

    clearFilters: (overrides?: Partial<IssueSheetFilterState>) =>
      set({
        profileId: null,
        serviceId: null,
        teamId: null,
        page: 1,
        status: ["open", "wip"],
        clientName: null,
        orderId: null,
        createdFrom: null,
        createdTo: null,
        ...overrides,
      }),
  })
);
