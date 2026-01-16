<script lang="ts">
	import { Capacitor } from '@capacitor/core';
	import Notices from '$lib/components/notices.svelte';
	import { notices } from '$lib/stores/notices';
	import BottomSheet from '$lib/components/bottom_sheet.svelte';
	import { onDestroy, onMount } from 'svelte';
	import { App } from '@capacitor/app';
	import { bottomSheetStore } from '$lib/stores/bottom_sheet';
	import { registerServiceWorker } from '$lib/utils/pwa';
	import { networkStatus } from '$lib/stores/network';
	import { NetworkStatus } from '$lib/enums';

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

	function updateNetworkStatus() {
		if (!navigator.onLine) {
			networkStatus.set(NetworkStatus.OFFLINE);
		} else {
			// Check for slow network using Network Information API
			const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
			if (connection && typeof connection.downlink === 'number') {
				// More lenient threshold: < 0.2 Mbps is slow, >= 0.2 is online
				if (connection.downlink < 0.2) {
					networkStatus.set(NetworkStatus.SLOW);
				} else {
					networkStatus.set(NetworkStatus.ONLINE);
				}
			} else {
				// If we can't detect speed, assume online
				networkStatus.set(NetworkStatus.ONLINE);
			}
		}
	}

	onMount(() => {
		registerServiceWorker();

		// Initialize network status
		updateNetworkStatus();
		window.addEventListener('online', updateNetworkStatus);
		window.addEventListener('offline', updateNetworkStatus);

		// Listen for changes in connection speed
		const connection = (navigator as any).connection;
		if (connection && typeof connection.addEventListener === 'function') {
			connection.addEventListener('change', updateNetworkStatus);
		}

		// Periodically re-check network status (every 30 seconds)
		const statusCheckInterval = setInterval(updateNetworkStatus, 30000);

		App.addListener('backButton', () => {
			if (isBottomSheetShow) {
				handleBottomSheetClose();
				bottomSheetStore.reset();
			} else {
				history.back();
			}
		});

		return () => {
			clearInterval(statusCheckInterval);
			window.removeEventListener('online', updateNetworkStatus);
			window.removeEventListener('offline', updateNetworkStatus);
			if (connection && typeof connection.removeEventListener === 'function') {
				connection.removeEventListener('change', updateNetworkStatus);
			}
		};
	});
</script>

<svelte:head>
	<!-- bootstrap icons -->
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
	<!-- fonts -->
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true" />
	<link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap" rel="stylesheet" />
	<!-- custom global css -->
	<style lang="scss">
		@import '../scss/global.scss';
		@import '/css/all.min.css';
	</style>
</svelte:head>

<!-- Persistent offline/slow banner at top -->
{#if $networkStatus === NetworkStatus.OFFLINE}
	<div class="alert alert-danger text-center m-0 rounded-0 position-fixed top-0 start-0 w-100" style="z-index:1050;">
		<i class="bi bi-wifi-off me-2"></i>
		You are offline. Data will be updated when internet works again.
	</div>
{:else if $networkStatus === NetworkStatus.SLOW}
	<div class="alert alert-warning text-center m-0 rounded-0 position-fixed top-0 start-0 w-100" style="z-index:1050;">
		<i class="bi bi-wifi me-2"></i>
		Your internet connection is slow. Some features may be delayed.
	</div>
{/if}

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
