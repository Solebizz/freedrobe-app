<script lang="ts">
	import { onDestroy, SvelteComponent } from 'svelte';
	import { bottomSheetStore } from '$lib/stores/bottom_sheet';

	let show = false;
	let children: typeof SvelteComponent | null | undefined = null;
	let handleClose = () => {};
	let props = {};

	const unsubscribe = bottomSheetStore.subscribe((state) => {
		show = !!state.show;
		children = state.children;
		handleClose = state.handleClose ?? (() => {});
		props = state.props ?? {};
	});

	onDestroy(() => {
		unsubscribe();
	});

	function onClickClose() {
		handleClose();
		bottomSheetStore.reset();
	}
</script>

<div class:showSheetWrapper={show} class="sheetWrapper d-flex align-items-end">
	<div class:show class="contentWrapper h-75 overflow-hidden">
		<div class="d-flex justify-content-end">
			<i class="bi bi-x m-0 fs-2 text-black" on:click={onClickClose}></i>
		</div>
		<div class="overflow-auto h-100 mb-5 pb-4">
			<svelte:component this={children} {...props} on:close={onClickClose} />
		</div>
	</div>
</div>

<style lang="scss">
	.sheetWrapper {
		width: 100%;
		max-width: 30rem;
		z-index: 1000;
		position: fixed;
		&.showSheetWrapper {
			background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
			top: 0;
			bottom: 0;
		}
	}

	.contentWrapper {
		width: 100%;
		background-color: white;
		border-radius: 1rem 1rem 0 0;
		padding: 1rem;
		position: relative;
		bottom: 0;
		overflow: auto;
		transform: translateY(100%); /* Initially hidden offscreen */
		transition: transform 0.3s ease; /* Slide in animation */
	}

	.contentWrapper.show {
		transform: translateY(0); /* Slide into view */
	}

	button {
		cursor: pointer;
	}
</style>
