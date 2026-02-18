import { create } from "zustand";

type TeamState = {
  teamIds: string[];
  page: number;
  setPage: (page: number) => void;
  setTeamIds: (ids: string[]) => void;
};

export const useSupportPeriodState = create<TeamState>((set) => ({
  teamIds: [],
  page: 1,

  setPage: (page) => set({ page }),

  setTeamIds: (ids) => set({ teamIds: ids }),
}));
