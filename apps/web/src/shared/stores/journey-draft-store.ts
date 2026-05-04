import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type JourneyDraftGraph = {
	nodes: Array<{
		id: string;
		type: string;
		position: { x: number; y: number };
		data: Record<string, unknown>;
	}>;
	edges: Array<{
		id: string;
		source: string;
		target: string;
		type?: string;
	}>;
};

export type JourneyDraftSnapshot = {
	presetId: string | null;
	title: string;
	graph: JourneyDraftGraph;
};

type JourneyDraftStore = {
	draft: JourneyDraftSnapshot | null;
	setDraft: (draft: JourneyDraftSnapshot) => void;
	patchGraph: (graph: JourneyDraftGraph) => void;
	patchTitle: (title: string) => void;
	clearDraft: () => void;
};

export const useJourneyDraftStore = create<JourneyDraftStore>()(
	persist(
		(set) => ({
			draft: null,
			setDraft: (draft) => set({ draft }),
			patchGraph: (graph) =>
				set((s) => (s.draft ? { draft: { ...s.draft, graph } } : s)),
			patchTitle: (title) =>
				set((s) => (s.draft ? { draft: { ...s.draft, title } } : s)),
			clearDraft: () => set({ draft: null }),
		}),
		{
			name: "ctl-journey-draft",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({ draft: state.draft }),
		}
	)
);
