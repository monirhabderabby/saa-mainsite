import { UpdateSheetFilter } from "@/schemas/update-sheet/filter";
import { UpdateTo } from "@prisma/client";
import { create } from "zustand";

type ProfileState = {
  profileId?: string[];
  page: number;
  updateTo: UpdateTo | "All" | undefined | string;
  tl?: string;
  done?: string;
  updateById?: string;
  tlId?: string;
  doneById?: string;
  sendFrom?: string;
  sendTo?: string;
  createdFrom?: string;
  createdTo?: string;
  clientName?: string;
  orderId?: string;

  // ✅ ADD SERVICE ID
  serviceId?: string;

  // (teamId needs adding later if you want)
  setServiceId: (id: string) => void;

  setProfileId: (ids: string[]) => void;
  setPage: (page: number) => void;
  setAllValues: (
    data: UpdateSheetFilter & { page?: number; serviceId?: string }
  ) => void;
  clearFilters: () => void;
};

export const useUpdateSheetFilterState = create<ProfileState>((set) => ({
  profileId: undefined,
  page: 1,
  updateTo: undefined,
  tl: undefined,
  done: "notDone",
  updateById: undefined,
  tlId: undefined,
  doneById: undefined,
  sendFrom: undefined,
  sendTo: undefined,
  createdFrom: undefined,
  createdTo: undefined,
  clientName: undefined,
  orderId: undefined,

  // ✅ DEFAULT serviceId
  serviceId: undefined,

  setProfileId: (ids) => set({ profileId: ids }),
  setPage: (page) => set({ page }),

  setAllValues: (data) =>
    set((state) => ({
      profileId: data.profileId,
      page: data.page ?? state.page,
      updateTo:
        (data.updateTo as UpdateTo | "All" | undefined) ?? state.updateTo,
      tl: data.tl ?? state.tl,
      done: data.done ?? state.done,
      updateById: data.updateById ?? state.updateById,
      tlId: data.tlId ?? state.tlId,
      doneById: data.doneById ?? state.doneById,
      sendFrom: (data.sendFrom as string | undefined) ?? state.sendFrom,
      sendTo: data.sendTo ?? state.sendTo,
      createdFrom:
        (data.createdFrom as string | undefined) ?? state.createdFrom,
      createdTo: (data.createdTo as string | undefined) ?? state.createdTo,
      clientName: data.clientName ?? state.clientName,
      orderId: data.orderId ?? state.orderId,

      // ✅ Apply serviceId
      serviceId: data.serviceId ?? state.serviceId,
    })),

  setServiceId: (id: string) => set({ serviceId: id }),

  clearFilters: () =>
    set({
      profileId: undefined,
      page: 1,
      updateTo: undefined,
      tl: undefined,
      done: "notDone",
      updateById: undefined,
      tlId: undefined,
      doneById: undefined,
      sendFrom: undefined,
      sendTo: undefined,
      createdFrom: undefined,
      createdTo: undefined,
      clientName: undefined,
      orderId: undefined,

      // ✅ Reset serviceId on clear
      serviceId: undefined,
    }),
}));
