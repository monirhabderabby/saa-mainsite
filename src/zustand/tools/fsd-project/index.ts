import { ProjectStatus } from "@prisma/client";
import { create } from "zustand";

type FsdProjectFilterState = {
  orderId?: string;
  clientName?: string;
  profileId?: string;
  teamId?: string[];
  shift?: string;
  status?: ProjectStatus[];
  review?: number;

  deadlineFrom?: string;
  deadlineTo?: string;

  lastUpdateFrom?: string;
  lastUpdateTo?: string;

  nextUpdateFrom?: string;
  nextUpdateTo?: string;

  page: number;

  setPage: (page: number) => void;
  setAllValues: (data: Partial<FsdProjectFilterState>) => void;
  clearFilters: () => void;
};

export const useFsdProjectFilterState = create<FsdProjectFilterState>(
  (set) => ({
    orderId: undefined,
    clientName: undefined,
    profileId: undefined,
    teamId: undefined,
    shift: undefined,
    status: undefined,
    review: undefined,

    deadlineFrom: undefined,
    deadlineTo: undefined,

    lastUpdateFrom: undefined,
    lastUpdateTo: undefined,

    nextUpdateFrom: undefined,
    nextUpdateTo: undefined,

    page: 1,

    setPage: (page) => set({ page }),

    setAllValues: (data) =>
      set((state) => ({
        ...state,
        ...data,
        page: data.page ?? state.page,
      })),

    clearFilters: () =>
      set({
        orderId: undefined,
        clientName: undefined,
        profileId: undefined,
        teamId: undefined,
        shift: undefined,
        status: undefined,
        review: undefined,

        deadlineFrom: undefined,
        deadlineTo: undefined,

        lastUpdateFrom: undefined,
        lastUpdateTo: undefined,

        nextUpdateFrom: undefined,
        nextUpdateTo: undefined,

        page: 1,
      }),
  }),
);
