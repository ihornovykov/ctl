import type { ReactNode } from "react";
import { create } from "zustand";

import { randomId } from "@/shared/lib/random-id";

export type SheetOpenOptions = {
	title: string;
	content: ReactNode;
};

export type SheetItem = SheetOpenOptions & {
	id: string;
	visible: boolean;
};

type State = {
	stack: SheetItem[];
	open: (options: SheetOpenOptions) => string;
	close: () => void;
};

export const useSheetsStore = create<State>((set, get) => ({
	stack: [],
	open: (options) => {
		const id = randomId();
		set((s) => ({
			stack: [...s.stack, { ...options, id, visible: false }],
		}));
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				const { stack } = useSheetsStore.getState();
				if (!stack.some((sheet) => sheet.id === id && !sheet.visible)) {
					return;
				}
				set({
					stack: stack.map((sheet) =>
						sheet.id === id ? { ...sheet, visible: true } : sheet
					),
				});
			});
		});
		return id;
	},
	close: () => {
		const { stack } = get();
		const lastVisibleIndex = stack.reduce(
			(acc, sheet, index) => (sheet.visible ? index : acc),
			-1
		);
		if (lastVisibleIndex === -1) {
			return;
		}
		set({
			stack: stack.map((sheet, index) =>
				index === lastVisibleIndex ? { ...sheet, visible: false } : sheet
			),
		});
	},
}));

export const sheets = {
	open: (options: SheetOpenOptions) => useSheetsStore.getState().open(options),
	close: () => useSheetsStore.getState().close(),
};
