<script lang="ts">
	import { Capacitor } from '@capacitor/core';
	import Notices from '$lib/components/notices.svelte';
	import { notices } from '$lib/stores/notices';
	import BottomSheet from '$lib/components/bottom_sheet.svelte';
	import { onDestroy, onMount } from 'svelte';
	import { App } from '@capacitor/app';
	import { bottomSheetStore } from '$lib/stores/bottom_sheet';

	let platform = Capacitor.getPlatform();
	let top_padding = '20px'; //padding for web
	let isBottomSheetShow = false;
	let handleBottomSheetClose = () => {};

	if (platform == 'ios') top_padding = '55px';
	if (platform == 'android') top_padding = '25px';

	const unsubscribe = bottomSheetStore.subscribe((state) => {
		isBottomSheetShow = !!state.show;
		handleBottomSheetClose = state.handleClose ?? (() => {});
	});

	onDestroy(() => {
		unsubscribe();
	});

	onMount(() => {
		App.addListener('backButton', () => {
			if (isBottomSheetShow) {
				handleBottomSheetClose();
				bottomSheetStore.reset();
			} else {
				history.back();
			}
		});
	});
</script>

<svelte:head>
	<!-- bootstrap icons -->
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
	<!-- fonts -->
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" />
	<link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap" rel="stylesheet" />
	<!-- custom global css -->
	<style lang="scss">
		@import '../scss/global.scss';
		@import '/css/all.min.css';
	</style>
</svelte:head>
<div id="outer-wrapper" style="--os_top_padding:{top_padding}">
	<slot />
	<BottomSheet />
	<Notices notices={$notices} />
</div>

<style lang="scss">
	:global(.os_top_padding) {
		//apply this class to anything that needs to be colored below the top bar
		//something in the top bar HAS TO HAVE this class or the text will run to the top of the screen in iOS
		padding-top: var(--os_top_padding) !important;
	}
</style>
