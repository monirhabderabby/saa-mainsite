import { UpdateSheetFilter } from "@/schemas/update-sheet/filter";
import { UpdateTo } from "@prisma/client";
import { create } from "zustand";

type ProfileState = {
  profileId?: string;
  page: number;
  updateTo: UpdateTo | "All" | undefined;
  tl?: "tlChecked" | "notTlCheck" | "All";
  done?: "done" | "notDone" | "All";
  updateById?: string;
  tlId?: string;
  doneById?: string;
  sendFrom?: string;
  sendTo?: string;
  createdFrom?: string; // renamed
  createdTo?: string; // optional range
  clientName?: string;
  orderId?: string;

  setProfileId: (id: string) => void;
  setPage: (page: number) => void;
  setAllValues: (data: UpdateSheetFilter & { page?: number }) => void;
};

export const useUpdateSheetFilterState = create<ProfileState>((set) => ({
  profileId: undefined,
  page: 1,
  updateTo: "All",

  setProfileId: (id) => set({ profileId: id }),
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
        (data.createdFrom as string | undefined) ?? state.createdFrom, // ✅ cast
      createdTo: (data.createdTo as string | undefined) ?? state.createdTo, // ✅ cast
      clientName: data.clientName ?? state.clientName,
      orderId: data.orderId ?? state.orderId,
    })),
}));
