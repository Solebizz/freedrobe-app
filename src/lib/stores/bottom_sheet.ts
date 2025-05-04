// src/lib/stores/bottomSheetStore.ts
import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import type { ComponentType } from 'svelte';

interface IData {
	show?: boolean;
	children?: ComponentType | null;
	handleClose?: () => void;
	props?: Record<string, any>;
}

function noop() {}

interface IUseBottomSheet extends Writable<IData> {
	setSheet: (obj: IData) => void;
	reset: () => void;
}

const createBottomSheetStore = (): IUseBottomSheet => {
	const { subscribe, set, update } = writable<IData>({
		show: false,
		children: null,
		handleClose: noop,
		props: {},
	});

	return {
		subscribe,
		set,
		update,
		setSheet: (newState: IData) => {
			update((prev) => ({
				show: newState.show ?? prev.show,
				children: newState.children ?? null,
				handleClose: newState.handleClose ?? noop,
				props: newState.props ?? {},
			}));
		},
		reset: () =>
			set({
				show: false,
				children: null,
				handleClose: noop,
				props: {},
			}),
	};
};

export const bottomSheetStore = createBottomSheetStore();
