// stores/useProfileStore.ts
"use client";
import Fuse from "fuse.js";
import { create } from "zustand";

interface Profile {
  id: string;
  name: string;
  stats: {
    delivery: number;
    updates: number;
    issues: number;
    wip: number;
  };
}

interface ProfileState {
  profiles: Profile[];
  filtered: Profile[];
  setProfiles: (p: Profile[]) => void;
  search: (query: string) => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profiles: [],
  filtered: [],
  setProfiles: (p) => set({ profiles: p, filtered: p }),
  search: (query) => {
    if (!query) return set({ filtered: get().profiles });

    const fuse = new Fuse(get().profiles, { keys: ["name"], threshold: 0.3 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = fuse.search(query).map((r: any) => r.item);
    set({ filtered: result });
  },
}));
