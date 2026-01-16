<script lang="ts">
	import { goto } from '$app/navigation';
	import SplashScreen from '$lib/components/splash_screen.svelte';
	import { NetworkStatus } from '$lib/enums';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { networkStatus } from '$lib/stores/network';

	export let data: { redirectTo?: string };

	let showSplash = true;

	onMount(() => {
		// Show splash for minimum time, then redirect or allow app access
		const minTime = setTimeout(() => {
			showSplash = false;
			// Small delay for smooth transition
			setTimeout(() => {
				// Only redirect if online
				const status = get(networkStatus);
				if (data?.redirectTo && status === NetworkStatus.ONLINE) {
					goto(data.redirectTo, { replaceState: true });
				}
			}, 100);
		}, 2000);

		return () => {
			clearTimeout(minTime);
		};
	});
</script>

<SplashScreen show={showSplash} />

<!-- Bootstrap Toasts for network status -->
<div aria-live="polite" aria-atomic="true" class="position-relative">
	<div class="toast-container position-fixed bottom-0 start-50 translate-middle-x mb-4" style="z-index:9999;">
		{#if $networkStatus === NetworkStatus.OFFLINE}
			<div class="toast show bg-danger text-white border-0 shadow" role="alert" aria-live="assertive" aria-atomic="true">
				<div class="toast-header bg-danger text-white border-0">
					<strong class="me-auto">Offline</strong>
				</div>
				<div class="toast-body">You are offline. Some features may be unavailable.</div>
			</div>
		{:else if $networkStatus === NetworkStatus.SLOW}
			<div class="toast show bg-warning text-dark border-0 shadow" role="alert" aria-live="assertive" aria-atomic="true">
				<div class="toast-header bg-warning text-dark border-0">
					<strong class="me-auto">Slow Connection</strong>
				</div>
				<div class="toast-body">Your internet connection is slow. Some features may be delayed.</div>
			</div>
		{/if}
	</div>
</div>
