// src/lib/stores/bottomSheetStore.ts
import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import type { ComponentType } from 'svelte';
import { DEFAULTS } from '$lib/utils/constants';

interface IData {
	show?: boolean;
	children?: ComponentType | null;
	handleClose?: () => void;
	props?: Record<string, any>;
	heightOffset?: number;
}

interface IUseBottomSheet extends Writable<IData> {
	setSheet: (obj: IData) => void;
	reset: () => void;
}

const createBottomSheetStore = (): IUseBottomSheet => {
	const { subscribe, set, update } = writable<IData>({
		show: false,
		children: null,
		handleClose: DEFAULTS.noop,
		props: DEFAULTS.emptyObject,
		heightOffset: DEFAULTS.bottomSheetHeightOffset,
	});

	return {
		subscribe,
		set,
		update,
		setSheet: (newState: IData) => {
			update((prev) => ({
				show: newState.show ?? prev.show,
				children: newState.children ?? null,
				handleClose: newState.handleClose ?? DEFAULTS.noop,
				props: newState.props ?? DEFAULTS.emptyObject,
				heightOffset: newState.heightOffset ?? DEFAULTS.bottomSheetHeightOffset,
			}));
		},
		reset: () =>
			set({
				show: false,
				children: null,
				handleClose: DEFAULTS.noop,
				props: DEFAULTS.emptyObject,
			}),
	};
};

export const bottomSheetStore = createBottomSheetStore();
