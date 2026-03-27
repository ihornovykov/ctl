import type { ReactNode } from "react";
import { create } from "zustand";

export type DialogButton = {
	icon?: ReactNode;
	loading?: boolean;
	text: string;
	variant?: "primary" | "secondary";
	onClick: () => void | Promise<void>;
};

export type DialogContent =
	| ReactNode
	| ((controls: { close: () => void }) => ReactNode);

export type DialogOpenOptions = {
	title?: string;
	titleIcon?: ReactNode;
	description?: string;
	buttons?: DialogButton[];
	content?: DialogContent;
};

export type DialogItem = DialogOpenOptions & {
	id: string;
	visible: boolean;
};

type State = {
	stack: DialogItem[];
	open: (item: DialogOpenOptions) => string;
	close: () => void;
};

export const useDialogsStore = create<State>((set, get) => ({
	stack: [],
	open: (item) => {
		const id = crypto.randomUUID();
		set((s) => ({ stack: [...s.stack, { ...item, id, visible: true }] }));
		return id;
	},
	close: () => {
		const { stack } = get();
		const lastVisibleIndex = stack.reduce(
			(acc, dialog, index) => (dialog.visible ? index : acc),
			-1
		);
		if (lastVisibleIndex === -1) {
			return;
		}
		set({
			stack: stack.map((dialog, index) =>
				index === lastVisibleIndex ? { ...dialog, visible: false } : dialog
			),
		});
	},
}));

export const dialogs = {
	open: (options: DialogOpenOptions) =>
		useDialogsStore.getState().open(options),
	close: () => useDialogsStore.getState().close(),
};
